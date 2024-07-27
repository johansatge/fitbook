import { h, Fragment } from 'preact'
import { FeedWorkout } from './feedworkout.jsx'
import { formatDate } from '../utils/date.js'

export function Feed({ logs }) {

  function getDaysFromMonthLogs(logs) {
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
    return { days, countDays, countWorkouts }
  }

  const { days, countDays, countWorkouts } = logs ? getDaysFromMonthLogs(logs) : {}

  return <div class="feed">
    {days && (
      <div class="feed-stats">
        {countDays} days, {countWorkouts} workouts
      </div>
    )}
    {days && Object.keys(days).map((dayId) => {
      const day = days[dayId]
      return <Fragment key={dayId}>
        <h2 class="feed-title">{day.name}</h2>
        <div class="feed-card">
          {day.logs.map((log) => <FeedWorkout log={log} />)}
        </div>
      </Fragment>
    })}
  </div>
}