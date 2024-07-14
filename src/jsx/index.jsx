import { h, render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { isStoreConnected } from '../utils/store.js'
import { InitialLoader } from './initialloader.jsx'
import { Ui } from './ui.jsx'
import { Login } from './login.jsx'
import { saveAccessTokenFromUrlAndRedirect } from '../utils/store.js'

saveAccessTokenFromUrlAndRedirect()

function App() {
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  useEffect(() => {
    const asyncEffect = async () => {
      const isConnected = await isStoreConnected()
      setIsLoadingUser(false)
      setIsConnected(isConnected)
    }
    asyncEffect()
  }, [])
  if (isLoadingUser) {
    return <InitialLoader />
  }
  return isConnected ? <Ui /> : <Login />
}

render(<App />, document.querySelector('#preact'))