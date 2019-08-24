/* global document __DROPBOX_APP_KEY__ FileReader localStorage Promise fetch */

import { format as formatDate } from 'date-fns'
import dropbox from 'dropbox'
import fields from './config/fields.json'
import workouts from './config/workouts.json'

const Dropbox = dropbox.Dropbox
const dropboxAppKey = __DROPBOX_APP_KEY__
const localStorageTokenKey = 'dropboxAccessToken'

const dbx = getDropboxInstance()

export function isStoreConnected() {
  return getAccessTokenFromStore() ? true : false
}

export function redirectToLogin() {
  window.location.href = '/login.html'
}

export function clearAccessToken() {
  localStorage.removeItem(localStorageTokenKey)
}

export function getConfigAndMonths() {
  const getters = [getMonths(), Promise.resolve(fields), Promise.resolve(workouts)]
  return Promise.all(getters).then(([months, fields, workouts]) => {
    return {
      months,
      workouts,
      fields,
    }
  })
}

export function getMonth(filePath) {
  return getJsonFile(filePath)
}

export function getAuthUrl() {
  const dbx = new Dropbox({ clientId: dropboxAppKey, fetch })
  return dbx.getAuthenticationUrl(document.location.href, null, 'token')
}

export function saveAccessTokenFromUrlAndRedirect() {
  const matches = document.location.href.match(/access_token=([a-zA-Z0-9-_]+)/)
  const token = matches && matches[1] ? matches[1] : null
  if (token) {
    localStorage.setItem(localStorageTokenKey, token)
    document.location.href = '/'
  }
}

export function saveLog(data) {
  const date = formatDate(data.fields.datetime, 'YYYY-MM')
  const filePath = `/logs/${date}.json`
  return getJsonFile(filePath, true).then((json) => {
    json.push(data)
    json.sort(sortLogsByDate)
    return dbx.filesUpload({ path: filePath, contents: JSON.stringify(json, null, 2), mode: 'overwrite' }).then(() => {
      return { monthHash: formatDate(date, 'MMMM-YYYY').toLowerCase(), logs: json }
    })
  })
}

function sortLogsByDate(a, b) {
  const aTime = new Date(a.fields.datetime).getTime()
  const bTime = new Date(b.fields.datetime).getTime()
  return aTime < bTime ? 1 : aTime > bTime ? -1 : 0
}

function getMonths() {
  // @todo make this recursive
  return dbx.filesListFolder({ path: '/logs', recursive: false, limit: 100 }).then((response) => {
    return response.entries
      .filter((entry) => entry.name.match(/^[0-9]{4}-[0-9]{2}\.json$/))
      .map((entry) => {
        return {
          path: entry.path_display,
          name: formatDate(entry.name.replace('.json', ''), 'MMMM YYYY'),
          hash: formatDate(entry.name.replace('.json', ''), 'MMMM-YYYY').toLowerCase(),
        }
      })
      .reverse()
  })
}

function getAccessTokenFromStore() {
  const token = localStorage.getItem(localStorageTokenKey)
  return typeof token === 'string' && token.search(/^[a-zA-Z0-9-_]+$/) === 0 ? token : null
}

function getDropboxInstance() {
  if (isStoreConnected()) {
    const token = getAccessTokenFromStore()
    return new Dropbox({ accessToken: token, fetch })
  }
  return null
}

function getJsonFile(filePath, returnEmptyIfNotFound = false) {
  return dbx
    .filesDownload({ path: filePath })
    .then((response) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('loadend', () => {
          try {
            const json = JSON.parse(reader.result)
            resolve(json)
          } catch (error) {
            reject(error)
          }
        })
        reader.readAsText(response.fileBlob)
      })
    })
    .catch((rawError) => {
      if (rawError.error) {
        const errorObject = JSON.parse(rawError.error)
        if (returnEmptyIfNotFound && errorObject.error_summary.search('path/not_found') > -1) {
          return []
        }
      }
      throw rawError
    })
}
