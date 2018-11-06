import { h, render } from 'preact'
import App from './components/App/App.jsx'
import { saveAccessTokenFromUrlAndRedirect } from './store.js'

export { init }

function init(rootNode) {
  saveAccessTokenFromUrlAndRedirect()
  render(h(App), rootNode)
}
