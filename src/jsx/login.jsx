import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { getAuthUrl } from '../utils/store.js'

export function Login() {
  const [authUrl, setAuthUrl] = useState(null)
  useEffect(() => {
    const asyncEffect = async () => {
      const authUrl = await getAuthUrl()
      setAuthUrl(authUrl)
    }
    asyncEffect()
  }, [])
  return (
    <div class="login">
      <h1 class="login-title">{window.appTitle}</h1>
      <a class="button button--main" href={authUrl}>Login to Dropbox</a>
    </div>
  )
}