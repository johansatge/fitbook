/* global document __DROPBOX_APP_KEY__ FileReader localStorage Promise fetch */

import { format as formatDate } from 'date-fns'
import dropbox from 'dropbox'

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

export function getConfigAndMonths() {
  const getters = [getMonths(), getJsonFile('/config/fields.json'), getJsonFile('/config/workouts.json')]
  return Promise.all(getters).then(([months, fields, workouts]) => {
    return {
      months,
      workouts,
      fields,
    }
  })
}

export function getMonth(monthPath) {
  return getJsonFile(monthPath)
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

function getJsonFile(filePath) {
  return dbx.filesDownload({ path: filePath }).then((response) => {
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
}

// //
// // export function getStoreAuthUrl() {
// //   const dbx = new Dropbox({ clientId: dropboxAppKey, fetch })
// //   return dbx.getAuthenticationUrl(document.location.href, null, 'token')
// // }
// //
// // export function getStoreUser() {
// //   return dbx.usersGetCurrentAccount().then((response) => {
// //     return {
// //       name: response.name.familiar_name,
// //       email: response.email,
// //       pic: response.profile_photo_url,
// //     }
// //   })
// // }
//
// export function saveLog(data, currentLogs) {
//   const date = formatDate(data.fields.datetime, 'YYYY-MM')
//   const filePath = `/logs/${date}.json`
//   return getJsonFile(filePath, true).then((json) => {
//     json.push(data)
//     json.sort(sortLogsByDate)
//     return saveLogFileAndUpdateCurrentLogs(filePath, date, json, currentLogs)
//   })
// }
//
// export function deleteLog(logDelete, currentLogs) {
//   const date = formatDate(logDelete.fields.datetime, 'YYYY-MM')
//   const filePath = `/logs/${date}.json`
//   return getJsonFile(filePath, true).then((json) => {
//     json = json.filter((log) => log.fields.datetime !== logDelete.fields.datetime)
//     return saveLogFileAndUpdateCurrentLogs(filePath, date, json, currentLogs)
//   })
// }
//
// function saveLogFileAndUpdateCurrentLogs(filePath, date, json, currentLogs) {
//   return dbx.filesUpload({ path: filePath, contents: JSON.stringify(json, null, 2), mode: 'overwrite' }).then(() => {
//     const otherLogs = [...currentLogs.filter((log) => !log.fields.datetime.startsWith(date)), ...json]
//     otherLogs.sort(sortLogsByDate)
//     return otherLogs
//   })
// }

// function sortLogsByDate(a, b) {
//   const aTime = new Date(a.fields.datetime).getTime()
//   const bTime = new Date(b.fields.datetime).getTime()
//   return aTime < bTime ? 1 : aTime > bTime ? -1 : 0
// }
//
// function getLogs() {
//   // @todo read the folder recursively
//   return dbx.filesListFolder({ path: '/logs', recursive: false, limit: 100 }).then((response) => {
//     return new Promise((resolve, reject) => {
//       recursiveGetLogs([], response.entries.map((entry) => entry.path_display), function(error, logs) {
//         error ? reject(error) : resolve(logs)
//       })
//     })
//   })
// }
//
// function recursiveGetLogs(logs, paths, callback) {
//   if (paths.length === 0) {
//     return callback(null, logs)
//   }
//   const path = paths.shift()
//   getJsonFile(path)
//     .then((json) => {
//       json.forEach((log) => logs.push(log))
//       recursiveGetLogs(logs, paths, callback)
//     })
//     .catch((error) => {
//       callback(error, null)
//     })
// }
//
// export function clearAccessToken() {
//   localStorage.removeItem(localStorageTokenKey)
// }
//
// export function saveAccessTokenFromUrlAndRedirect() {
//   const matches = document.location.href.match(/access_token=([a-zA-Z0-9-_]+)/)
//   const token = matches && matches[1] ? matches[1] : null
//   if (token) {
//     localStorage.setItem(localStorageTokenKey, token)
//     document.location.href = document.location.href.replace(/\/[^/]+$/, '')
//   }
// }
//
