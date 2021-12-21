/* global document, window */

import { getAuthUrl, saveAccessTokenFromUrlAndRedirect } from './store.js'

window.Scripts = window.Scripts || {}
window.Scripts.login = { init }

function init() {
  saveAccessTokenFromUrlAndRedirect()
  const authUrl = getAuthUrl()
  document.querySelector('[data-js-login-button]').href = authUrl
}
