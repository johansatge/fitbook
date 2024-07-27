import { formatDate } from './date.js'
import { Dropbox } from 'dropbox'

import fields from '../config/fields.json'
import workouts from '../config/workouts.json'

const localStorageTokenKey = 'dropboxAccessToken'

let dbx = null
const token = getAccessTokenFromStore()
if (token) {
  dbx = new Dropbox({ accessToken: token })
}

export async function isStoreConnected() {
  if (!dbx) {
    return false
  }
  try {
    await dbx.usersGetCurrentAccount()
    return true
  } catch(error) {
    return false
  }
}

function getAccessTokenFromStore() {
  const token = localStorage.getItem(localStorageTokenKey)
  return typeof token === 'string' && token.match(/^[a-zA-Z0-9-_.]+$/) ? token : null
}

export async function getAuthUrl() {
  const dbx = new Dropbox({ clientId: window.dropboxAppKey })
  const authUrl = await dbx.auth.getAuthenticationUrl(document.location.href)
  return authUrl
}

export function saveAccessTokenFromUrlAndRedirect() {
  const searchParams = new URLSearchParams(document.location.hash.substring(1))
  const token = searchParams.get('access_token')
  if (token) {
    localStorage.setItem(localStorageTokenKey, token)
    const currentUrl = new URL(document.location.href)
    document.location.href = currentUrl.pathname
  }
}

export function logout() {
  localStorage.removeItem(localStorageTokenKey)
  window.location.reload()
}

export async function fetchMonths() {
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

export function fetchMonth(filePath) {
  return getJsonFile(filePath)
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

export function getWorkoutsAndFields() {
  const orderedWorkouts = Object.fromEntries(
    Object.entries(workouts).sort((a, b) => {
      return a[1].name > b[1].name ? 1 : (a[1].name < b[1].name ? -1 : 0)
    })
  )
  return { workouts: orderedWorkouts, fields }
}

export function isValueValidForField(rawValue, field) {
  const type = fields[field].type
  if (type === 'string') {
    return rawValue.length > 0
  }
  if (type === 'datetime') {
    return rawValue.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/)
  }
  if (type === 'place') {
    return ['gym', 'home'].includes(rawValue)
  }
  if (type === 'number') {
    return !isNaN(parseFloat(rawValue))
  }
}

export async function saveLog(data) {
  const date = formatDate(data.fields.datetime, 'YYYY-MM')
  const filePath = `/logs/${date}.json`
  const json = await getJsonFile(filePath, true)
  json.push(data)
  json.sort(sortLogsByDate)
  await dbx.filesUpload({ path: filePath, contents: JSON.stringify(json, null, 2), mode: 'overwrite' })
  return { monthPath: filePath, logs: json }
}

function sortLogsByDate(a, b) {
  const aTime = new Date(a.fields.datetime).getTime()
  const bTime = new Date(b.fields.datetime).getTime()
  return aTime < bTime ? 1 : aTime > bTime ? -1 : 0
}

