/* global document  */

import { getAuthUrl, saveAccessTokenFromUrlAndRedirect } from './store.js'

export { init }

function init() {
  saveAccessTokenFromUrlAndRedirect()
  const authUrl = getAuthUrl()
  document.querySelector('[data-js-login-button]').href = authUrl
}
