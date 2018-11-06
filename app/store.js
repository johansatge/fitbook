/* global document DROPBOX_APP_KEY FileReader localStorage Promise */

import dateFns from 'date-fns'
import dropbox from 'dropbox'

const Dropbox = dropbox.Dropbox
const dropboxAppKey = DROPBOX_APP_KEY
const localStorageTokenKey = 'dropboxAccessToken'

const dbx = getDropboxInstance()

export function isStoreConnected() {
  return getAccessTokenFromStore() ? true : false
}

export function getStoreAuthUrl() {
  const dbx = new Dropbox({ clientId: dropboxAppKey })
  return dbx.getAuthenticationUrl(document.location.href, null, 'token')
}

export function getStoreUser() {
  return dbx.usersGetCurrentAccount().then(function(response) {
    return {
      name: response.name.familiar_name,
      email: response.email,
      pic: response.profile_photo_url,
    }
  })
}

export function getConfigAndLogs() {
  const getters = [getLogs(), getJsonFile('/config/fields.json'), getJsonFile('/config/workouts.json')]
  return Promise.all(getters).then(([logs, fields, workouts]) => {
    return {
      logs: consolidateLogs(logs, workouts, fields),
      workouts,
      fields,
    }
  })
}

function consolidateLogs(rawLogs, workouts, fields) {
  const logs = []
  rawLogs.forEach((rawLog) => {
    const data = {}
    Object.keys(rawLog.fields).map((fieldName) => {
      data[fieldName] = {
        field: fields[fieldName],
        value: rawLog.fields[fieldName],
      }
    })
    logs.push({
      datetime: rawLog.fields.datetime,
      readableDate: dateFns.format(rawLog.fields.datetime, 'dddd, MMMM Do'),
      readableTime: dateFns.format(rawLog.fields.datetime, 'HH:mm'),
      workout: workouts[rawLog.workout],
      data,
    })
  })
  logs.sort(sortLogs)
  const days = {}
  logs.forEach((log) => {
    const day = dateFns.format(log.datetime, 'YYYY-MM-DD')
    if (!days[day]) {
      days[day] = []
    }
    days[day].push(log)
  })
  return days
}

function sortLogs(a, b) {
  const aTime = new Date(a.datetime).getTime()
  const bTime = new Date(b.datetime).getTime()
  return aTime < bTime ? 1 : aTime > bTime ? -1 : 0
}

function getLogs() {
  // @todo read the folder recursively
  return dbx.filesListFolder({ path: '/logs', recursive: false, limit: 100 }).then(function(response) {
    return new Promise((resolve, reject) => {
      recursiveGetLogs([], response.entries.map((entry) => entry.path_display), function(error, logs) {
        error ? reject(error) : resolve(logs)
      })
    })
  })
}

function recursiveGetLogs(logs, paths, callback) {
  if (paths.length === 0) {
    return callback(null, logs)
  }
  const path = paths.shift()
  getJsonFile(path)
    .then((json) => {
      json.forEach((log) => logs.push(log))
      recursiveGetLogs(logs, paths, callback)
    })
    .catch((error) => {
      callback(error, null)
    })
}

export function saveAccessTokenFromUrlAndRedirect() {
  const matches = document.location.href.match(/access_token=([a-zA-Z0-9-_]+)/)
  const token = matches && matches[1] ? matches[1] : null
  if (token) {
    localStorage.setItem(localStorageTokenKey, token)
    document.location.href = document.location.href.replace(/\/[^/]+$/, '')
  }
}

function getAccessTokenFromStore() {
  const token = localStorage.getItem(localStorageTokenKey)
  return typeof token === 'string' && token.search(/^[a-zA-Z0-9-_]+$/) === 0 ? token : null
}

function getDropboxInstance() {
  if (isStoreConnected()) {
    const token = getAccessTokenFromStore()
    return new Dropbox({ accessToken: token })
  }
  return null
}

function getJsonFile(filePath) {
  return dbx.filesDownload({ path: filePath }).then(function(response) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.addEventListener('loadend', function() {
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
