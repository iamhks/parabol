import {useSelector} from 'react-redux'
import useAtmosphere from '../../hooks/useAtmosphere'
import {getPluginServerRoute, isAuthorized} from '../../selectors'
import SidePanel from './SidePanel'

const SidePanelRoot = () => {
  const atmosphere = useAtmosphere()
  const loggedIn = useSelector(isAuthorized)
  const pluginServerRoute = useSelector(getPluginServerRoute)

  return (
    <div className='flex flex-col items-stretch overflow-y-auto p-4'>
      {loggedIn ? (
        <SidePanel />
      ) : (
        <div>
          <p className='py-4'>
            You are not logged in to Parabol.
            <br />
            Please <a href={`${pluginServerRoute}/parabol/signin`}>sign in</a> or{' '}
            <a href={`${pluginServerRoute}/parabol/create-account`}>create an account</a> and retry.
          </p>
          <button className='btn btn-primary' onClick={atmosphere.login}>
            Retry
          </button>
        </div>
      )}
    </div>
  )
}

export default SidePanelRoot
