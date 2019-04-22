/* global __EJS_FEED__ */

import { getConfigAndMonths, getMonth } from './store.js'

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
  nodeFeedFilter.addEventListener('change', onChangeMonth)
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

function onHashChangeLoadMonth() {
  state.currentMonthId = getCurrentMonth()
  setFeedFilter()
  getMonth(state.months[state.currentMonthId].path).then((data) => {
    console.log('@todo html', data)
    nodeFeed.innerHTML = templates.feed()
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
