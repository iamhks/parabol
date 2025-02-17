import {useCallback} from 'react'
import {useDispatch} from 'react-redux'
import {removeTeamFromChannel} from '../reducers'
import {useCurrentChannel} from './useCurrentChannel'

export const useUnlinkTeam = () => {
  const dispatch = useDispatch()
  const currentChannel = useCurrentChannel()

  const unlinkTeam = useCallback(
    async (teamId: string) => {
      if (!currentChannel) {
        console.log('No current channel')
        return
      }
      dispatch(removeTeamFromChannel({channel: currentChannel.id, teamId}))
    },
    [currentChannel?.id, dispatch]
  )

  return unlinkTeam
}
