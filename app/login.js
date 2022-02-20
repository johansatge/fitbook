/* global document, window */

import { getAuthUrl, saveAccessTokenFromUrlAndRedirect } from './store.js'

window.Scripts = window.Scripts || {}
window.Scripts.login = { init }

function init() {
  saveAccessTokenFromUrlAndRedirect()
  getAuthUrl().then((authUrl) => {
    document.querySelector('[data-js-login-button]').href = authUrl
  })
}
