import {SearchAndReplace} from '@sereneinserenade/tiptap-search-and-replace'
import CharacterCount from '@tiptap/extension-character-count'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import {Extension, generateText, useEditor, type Editor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useEffect, useRef, useState} from 'react'
import Atmosphere from '../Atmosphere'
import {LoomExtension} from '../components/promptResponse/loomExtension'
import {TiptapLinkExtension} from '../components/promptResponse/TiptapLinkExtension'
import {LinkMenuState} from '../components/promptResponse/TipTapLinkMenu'
import {isEqualWhenSerialized} from '../shared/isEqualWhenSerialized'
import {mentionConfig, serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../utils/tiptapMentionConfig'

const isValid = <T>(obj: T | undefined | null | boolean): obj is T => {
  return !!obj
}

const isCursorMakingNode = (editor: Editor) => {
  const from = editor.state.selection.$from
  const nodeType = from.node().type.name
  const parentType = from.node(-1).type.name
  /*
    Support cases (nodeType/parentType):
      - Headings (heading/doc)
      - Bullet Lists (paragraph/listItem)
      - Blockquotes (paragraph/blockQuote)
      - CodeBlocks (codeBlock/doc)
  */
  return !(nodeType === 'paragraph' && parentType === 'doc')
}

export const useTipTapReflectionEditor = (
  content: string,
  options: {
    atmosphere?: Atmosphere
    teamId?: string
    readOnly?: boolean
    placeholder?: string
    onEnter?: () => void
    // onEscape?: () => void
  }
) => {
  const {atmosphere, teamId, readOnly, placeholder, onEnter} = options
  const [linkState, setLinkState] = useState<LinkMenuState>(null)
  const [contentJSON] = useState(() => JSON.parse(content))
  const placeholderRef = useRef(placeholder)
  placeholderRef.current = placeholder
  const editor = useEditor(
    {
      content: contentJSON,
      extensions: [
        StarterKit,
        LoomExtension,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder: () => {
            return placeholderRef.current || '*New Reflection*'
          }
        }),
        Mention.configure(
          atmosphere && teamId ? tiptapMentionConfig(atmosphere, teamId) : mentionConfig
        ),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLinkExtension.configure({
          openOnClick: false,
          popover: {
            setLinkState
          }
        }),
        SearchAndReplace.configure(),
        CharacterCount.configure({
          // this is a rough estimate because we store the JSON content as a string, not plaintext
          limit: 1900
        }),
        onEnter &&
          Extension.create({
            name: 'commentKeyboardShortcuts',
            addKeyboardShortcuts(this) {
              return {
                Enter: () => {
                  const isMakingNode = isCursorMakingNode(this.editor)
                  if (isMakingNode) return false
                  onEnter()
                  return true
                }
                // Escape: () => {
                //   onEscape()
                //   return true
                // }
              }
            }
          }),
        !onEnter &&
          Extension.create({
            name: 'blurOnSubmitExceptList',
            addKeyboardShortcuts(this) {
              return {
                Enter: () => {
                  const isMakingNode = isCursorMakingNode(this.editor)
                  if (isMakingNode) return false
                  this.editor.commands.blur()
                  return true
                },
                Tab: () => {
                  this.editor.commands.blur()
                  return true
                }
              }
            }
          })
      ].filter(isValid),
      autofocus: generateText(contentJSON, serverTipTapExtensions).length === 0,
      editable: !readOnly
    },
    []
  )
  useEffect(() => {
    if (!editor) return
    const oldDoc = editor.getJSON()
    const newDoc = JSON.parse(content)
    if (isEqualWhenSerialized(oldDoc, newDoc)) return
    editor.commands.setContent(newDoc)
  }, [content])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!readOnly)
  }, [readOnly])

  return {editor, linkState, setLinkState}
}
