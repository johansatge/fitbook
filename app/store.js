/* global document __DROPBOX_APP_KEY__ FileReader localStorage window */

import { formatDate } from './date.js'
import { Dropbox } from 'dropbox'
import fields from './config/fields.json'
import workouts from './config/workouts.json'

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
  const dbx = new Dropbox({ clientId: __DROPBOX_APP_KEY__ })
  return dbx.auth.getAuthenticationUrl(document.location.href)
}

export function saveAccessTokenFromUrlAndRedirect() {
  const searchParams = new URLSearchParams(document.location.hash.substring(1))
  const token = searchParams.get('access_token')
  if (token) {
    localStorage.setItem(localStorageTokenKey, token)
    document.location.href = '/'
  }
}

export async function saveLog(data) {
  const date = formatDate(data.fields.datetime, 'YYYY-MM')
  const filePath = `/logs/${date}.json`
  const json = await getJsonFile(filePath, true)
  json.push(data)
  json.sort(sortLogsByDate)
  await dbx.filesUpload({ path: filePath, contents: JSON.stringify(json, null, 2), mode: 'overwrite' })
  return { monthHash: formatDate(date, 'MMMM-YYYY').toLowerCase(), logs: json }
}

function sortLogsByDate(a, b) {
  const aTime = new Date(a.fields.datetime).getTime()
  const bTime = new Date(b.fields.datetime).getTime()
  return aTime < bTime ? 1 : aTime > bTime ? -1 : 0
}

async function getMonths() {
  // @todo make this recursive
  const response = await dbx.filesListFolder({ path: '/logs', recursive: false, limit: 100 })
  return response.result.entries
    .filter((entry) => entry.name.match(/^[0-9]{4}-[0-9]{2}\.json$/))
    .map((entry) => {
      return {
        path: entry.path_display,
        name: formatDate(entry.name.replace('.json', ''), 'MMMM YYYY'),
        hash: formatDate(entry.name.replace('.json', ''), 'MMMM-YYYY').toLowerCase(),
      }
    })
    .sort((a, b) => {
      return a.path > b.path ? -1 : a.path < b.path ? 1 : 0
    })
}

function getAccessTokenFromStore() {
  const token = localStorage.getItem(localStorageTokenKey)
  return typeof token === 'string' && token.search(/^[a-zA-Z0-9-_.]+$/) === 0 ? token : null
}

function getDropboxInstance() {
  if (isStoreConnected()) {
    const token = getAccessTokenFromStore()
    return new Dropbox({ accessToken: token })
  }
  return null
}

async function getJsonFile(filePath, returnEmptyIfNotFound = false) {
  let response = null
  try {
    response = await dbx.filesDownload({ path: filePath })
  } catch (rawError) {
    if (rawError.error) {
      if (returnEmptyIfNotFound && rawError.error.error_summary.search('path/not_found') > -1) {
        return []
      }
    }
    throw rawError
  }
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
    reader.readAsText(response.result.fileBlob)
  })
}
