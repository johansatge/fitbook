/* global __EJS_FEED__, __EJS_ADD__, window, document */

import { clearAccessToken, getConfigAndMonths, getMonth, isStoreConnected, redirectToLogin, saveLog } from './store.js'
import { setToast } from './toast.js'
import { formatDate } from './date.js'

window.Scripts = window.Scripts || {}
window.Scripts.index = { init }

const nodeFeedFilter = document.querySelector('[data-js-feed-filter]')
const nodeFeedFilterName = document.querySelector('[data-js-feed-filter-name]')
const nodeLoader = document.querySelector('[data-js-loader]')
const nodeFeed = document.querySelector('[data-js-feed]')

const nodeAddButton = document.querySelector('[data-js-add-button]')
const nodeAddMenu = document.querySelector('[data-js-add-menu]')
const nodeAddOverlay = document.querySelector('[data-js-add-overlay]')
const nodeAddForm = document.querySelector('[data-js-add-form]')
const nodeAddCancel = document.querySelector('[data-js-add-cancel]')
const nodeAddSave = document.querySelector('[data-js-add-save]')

const nodeStopwatchOpen = document.querySelector('[data-js-stopwatch-open]')
const nodeStopwatchOverlay = document.querySelector('[data-js-stopwatch-overlay]')
const nodeStopwatchClose = document.querySelector('[data-js-stopwatch-close]')
const nodeStopwatchStart = document.querySelector('[data-js-stopwatch-start]')
const nodeStopwatchSetsField = document.querySelector('[data-js-stopwatch-sets-field]')
const nodeStopwatchRestField = document.querySelector('[data-js-stopwatch-rest-field]')
const nodeStopwatchFields = document.querySelector('[data-js-stopwatch-fields]')
const nodeStopwatchCurrentSet = document.querySelector('[data-js-stopwatch-currentset]')
const nodeStopwatchCurrentSetNumber = document.querySelector('[data-js-stopwatch-currentsetnumber]')
const nodeStopwatchCurrentRest = document.querySelector('[data-js-stopwatch-currentrest]')

const nodeMenuOverlay = document.querySelector('[data-js-menu-overlay]')
const nodeMenuOverlayOpen = document.querySelector('[data-js-menu-overlay-open]')
const nodeMenuOverlayBack = document.querySelector('[data-js-menu-overlay-back]')
const nodeLogout = document.querySelector('[data-js-logout]')

window.eval(`window.addTemplate = ${__EJS_ADD__}`)
window.eval(`window.feedTemplate = ${__EJS_FEED__}`)

const state = {
  months: null,
  workouts: null,
  fields: null,
  currentMonthId: null,
  currentAddWorkout: null,
  stopwatch: {
    currentSet: null,
    totalSets: null,
    restTime: null,
    restTimeout: null,
  },
}

async function init() {
  const isConnected = await isStoreConnected()
  if (!isConnected) {
    redirectToLogin()
  }
  nodeLogout.addEventListener('click', onLogout)
  nodeMenuOverlayOpen.addEventListener('click', onMenuToggle)
  nodeMenuOverlayBack.addEventListener('click', onMenuToggle)
  nodeFeedFilter.addEventListener('change', onChangeMonth)
  nodeFeed.addEventListener('click', onFeedClick)
  window.addEventListener('hashchange', onHashChangeLoadMonth)
  nodeAddMenu.addEventListener('change', onAddOpen)
  nodeAddCancel.addEventListener('click', onAddClose)
  nodeAddSave.addEventListener('click', onAddSave)
  nodeStopwatchOpen.addEventListener('click', onStopwatchOpen)
  nodeStopwatchClose.addEventListener('click', onStopwatchClose)
  nodeStopwatchStart.addEventListener('click', onStopwatchStart)
  nodeStopwatchCurrentSet.addEventListener('click', onStopwatchFinishSet)
  setLoading(true)
  const { months, workouts, fields } = await getConfigAndMonths()
  state.months = months
  state.workouts = workouts
  state.fields = fields
  populateFeedFilter()
  populateAddMenu()
  setLoading(false)
  setToast('Loaded app config')
  onHashChangeLoadMonth()
}

function onLogout() {
  clearAccessToken()
  redirectToLogin()
}

function onMenuToggle() {
  nodeMenuOverlay.classList.toggle('js-visible')
}

function onChangeMonth() {
  const monthId = nodeFeedFilter.querySelector('option:checked').value
  window.location.hash = `#${state.months[monthId].hash}`
}

function onAddOpen() {
  state.currentAddWorkout = nodeAddMenu.querySelector('option:checked').value
  const currentDate = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
  nodeAddMenu.querySelector('option:checked').selected = false
  nodeAddOverlay.classList.add('js-visible')
  nodeAddForm.innerHTML = window.addTemplate({
    workout: state.workouts[state.currentAddWorkout],
    fields: state.fields,
    currentDate,
  })
}

function onAddClose() {
  nodeAddOverlay.classList.remove('js-visible')
  nodeAddForm.innerHTML = ''
}

function onAddSave() {
  const inputs = nodeAddForm.querySelectorAll('[data-js-add-input]')
  const data = {
    workout: state.currentAddWorkout,
    fields: {},
  }
  const errors = []
  for (let index = 0; index < inputs.length; index += 1) {
    const value = parseFieldValue(inputs[index].name, inputs[index].value)
    data.fields[inputs[index].name] = value
    if (value === null) {
      errors.push(inputs[index].name)
    }
    inputs[index].classList.toggle('js-error', value === null)
  }
  if (errors.length === 0) {
    onAddClose()
    setLoading(true)
    saveLog(data).then(({ monthHash, logs }) => {
      setLoading(false)
      const currentMonthHash = state.months[state.currentMonthId].hash
      if (monthHash === currentMonthHash) {
        populateFeedWithMonth(logs)
      } else {
        document.location.hash = `#${monthHash}`
        document.location.reload()
      }
    })
  }
}

function parseFieldValue(fieldName, rawValue) {
  rawValue = String(rawValue)
  const type = state.fields[fieldName].type
  if (type === 'string') {
    return rawValue.length > 0 ? rawValue : null
  }
  if (type === 'datetime') {
    return rawValue.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/) ? rawValue : null
  }
  if (type === 'place') {
    return ['gym', 'home'].includes(rawValue) ? rawValue : null
  }
  if (type === 'number') {
    const number = parseFloat(rawValue)
    return !isNaN(number) ? number : null
  }
  return null
}

function onStopwatchOpen() {
  nodeStopwatchSetsField.value = ''
  nodeStopwatchRestField.value = ''
  nodeStopwatchStart.innerText = 'Start'
  nodeStopwatchFields.classList.add('js-visible')
  nodeStopwatchCurrentSet.classList.remove('js-visible')
  nodeStopwatchCurrentRest.classList.remove('js-visible')
  nodeStopwatchOverlay.classList.add('js-visible')
  nodeStopwatchSetsField.classList.remove('js-error')
  nodeStopwatchRestField.classList.remove('js-error')
}

function onStopwatchClose() {
  nodeStopwatchOverlay.classList.remove('js-visible')
  clearTimeout(state.stopwatch.restTimeout)
}

function onStopwatchStart() {
  clearTimeout(state.stopwatch.restTimeout)
  const totalSets = parseInt(nodeStopwatchSetsField.value) || 0
  nodeStopwatchSetsField.classList.toggle('js-error', totalSets <= 0)
  const restTime = parseInt(nodeStopwatchRestField.value) || 0
  nodeStopwatchRestField.classList.toggle('js-error', restTime <= 0)
  if (totalSets <= 0 || restTime <= 0) {
    return
  }
  nodeStopwatchStart.innerText = 'Restart'
  nodeStopwatchFields.classList.remove('js-visible')
  state.stopwatch.currentSet = 1
  state.stopwatch.totalSets = totalSets
  state.stopwatch.restTime = restTime
  document.querySelector(':root').style.setProperty('--stopwatchRestTime', `${restTime}s`)
  setStopWatchState('set')
}

function onStopwatchFinishSet() {
  if (state.stopwatch.currentSet < state.stopwatch.totalSets) {
    setStopWatchState('rest')
    return
  }
  onStopwatchClose()
}

function setStopWatchState(currentState) {
  if (currentState === 'set') {
    nodeStopwatchCurrentSetNumber.innerText = `${state.stopwatch.currentSet}/${state.stopwatch.totalSets}`
    nodeStopwatchCurrentSet.classList.add('js-visible')
    nodeStopwatchCurrentRest.classList.remove('js-visible')
  }
  if (currentState === 'rest') {
    nodeStopwatchCurrentSet.classList.remove('js-visible')
    nodeStopwatchCurrentRest.classList.add('js-visible')
    triggerStopwatchRestAnimation()
    state.stopwatch.restTimeout = setTimeout(() => {
      state.stopwatch.currentSet += 1
      setStopWatchState('set')
    }, state.stopwatch.restTime * 1000)
  }
}

function triggerStopwatchRestAnimation() {
  nodeStopwatchCurrentRest.classList.remove('js-animate')
  void nodeStopwatchCurrentRest.offsetWidth
  nodeStopwatchCurrentRest.classList.add('js-animate')
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
    populateFeedWithMonth(logs)
    setLoading(false)
    setToast('Loaded month data')
  })
}

function populateFeedWithMonth(logs) {
  const days = {}
  let countDays = 0
  let countWorkouts = 0
  logs.forEach((log) => {
    const day = formatDate(log.fields.datetime, 'YYYY-MM-DD')
    if (!days[day]) {
      days[day] = {
        name: formatDate(log.fields.datetime, 'dddd, MMMM Do'),
        logs: [],
      }
      countDays += 1
    }
    log.time = formatDate(log.fields.datetime, 'HH:mm')
    days[day].logs.push(log)
    countWorkouts += 1
  })
  nodeFeed.innerHTML = window.feedTemplate({
    days,
    workouts: state.workouts,
    fields: state.fields,
    countDays,
    countWorkouts,
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

function populateAddMenu() {
  nodeAddMenu.innerHTML = [
    ...'<option value="-1">Choose a workout...</option>',
    ...Object.keys(state.workouts).map((workoutId) => {
      return `<option value="${workoutId}">${state.workouts[workoutId].name}</option>`
    }),
  ].join('')
}

function setFeedFilter() {
  const currentOption = nodeFeedFilter.querySelector(`option[value="${state.currentMonthId}"]`)
  currentOption.selected = true
  nodeFeedFilterName.innerHTML = currentOption.innerHTML
}

function setLoading(isLoading) {
  nodeLoader.classList.toggle('js-visible', isLoading)
  nodeAddButton.classList.toggle('js-visible', !isLoading)
  nodeStopwatchOpen.classList.toggle('js-visible', !isLoading)
}
