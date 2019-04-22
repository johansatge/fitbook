/* global __EJS_FEED__ */

import { format as formatDate } from 'date-fns'
import { getConfigAndMonths, getMonth, isStoreConnected, redirectToLogin } from './store.js'

export { init }

const nodeFeedFilter = document.querySelector('[data-js-feed-filter]')
const nodeFeedFilterName = document.querySelector('[data-js-feed-filter-name]')
const nodeLoader = document.querySelector('[data-js-loader]')
const nodeFeed = document.querySelector('[data-js-feed]')

const templates = {
  feed: __EJS_FEED__,
}

const state = {
  months: null,
  workouts: null,
  fields: null,
  currentMonthId: null,
}

function init() {
  if (!isStoreConnected()) {
    redirectToLogin()
  }
  nodeFeedFilter.addEventListener('change', onChangeMonth)
  nodeFeed.addEventListener('click', onFeedClick)
  window.addEventListener('hashchange', onHashChangeLoadMonth)
  setLoading(true)
  getConfigAndMonths().then(({ months, workouts, fields }) => {
    state.months = months
    state.workouts = workouts
    state.fields = fields
    populateFeedFilter()
    onHashChangeLoadMonth()
  })
}

function onChangeMonth() {
  const monthId = nodeFeedFilter.querySelector('option:checked').value
  window.location.hash = `#${state.months[monthId].hash}`
}

function onFeedClick(evt) {
  const toggleId = evt.target.dataset.jsFeedToggle
  if (!toggleId) {
    return
  }
  evt.target.classList.toggle('js-opened')
  nodeFeed.querySelector(`[data-js-feed-data="${toggleId}"]`).classList.toggle('js-visible')
}

function onHashChangeLoadMonth() {
  setLoading(true)
  state.currentMonthId = getCurrentMonth()
  setFeedFilter()
  nodeFeed.innerHTML = ''
  getMonth(state.months[state.currentMonthId].path).then((logs) => {
    const days = {}
    logs.forEach((log) => {
      const day = formatDate(log.fields.datetime, 'YYYY-MM-DD')
      if (!days[day]) {
        days[day] = {
          name: formatDate(log.fields.datetime, 'dddd, MMMM Do'),
          logs: [],
        }
      }
      log.time = formatDate(log.fields.datetime, 'HH:mm')
      days[day].logs.push(log)
    })

    nodeFeed.innerHTML = templates.feed({ days, workouts: state.workouts, fields: state.fields })
    setLoading(false)
  })
}

function getCurrentMonth() {
  const hash = window.location.hash.match(/^#[a-z]+-[0-9]{4}$/) ? window.location.hash.replace('#', '') : ''
  const currentMonthId = state.months.findIndex((month) => month.hash === hash)
  return currentMonthId > -1 ? currentMonthId : 0
}

function populateFeedFilter() {
  nodeFeedFilter.innerHTML = state.months
    .map((month, index) => {
      return `<option value="${index}">${month.name}</option>`
    })
    .join('')
}

function setFeedFilter() {
  const currentOption = nodeFeedFilter.querySelector(`option[value="${state.currentMonthId}"]`)
  currentOption.selected = true
  nodeFeedFilterName.innerHTML = currentOption.innerHTML
}

function setLoading(isLoading) {
  nodeLoader.style.display = isLoading ? 'block' : 'none'
}
