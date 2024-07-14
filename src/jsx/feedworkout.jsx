import { h, Fragment } from 'preact'
import { useState } from 'preact/hooks'
import { getWorkoutsAndFields } from '../utils/store.js'

const { workouts, fields } = getWorkoutsAndFields()

export function FeedWorkout({ log }) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  function getHighlightedWorkoutInfo() {
    const name = fields[workouts[log.workout].highlight].name
    const value = log.fields[workouts[log.workout].highlight]
    const unit = fields[workouts[log.workout].highlight].unit
    return `${name}: ${value}${unit} (${log.time}@${log.fields.place})`
  }

  return <div class="feed-card-line">
    <div class="feed-card-line-icon">
      <svg class="svg-icon"><use href={`#svg-${workouts[log.workout].icon}`}></use></svg>
    </div>
    <button class="feed-card-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
      <svg class="svg-icon"><use href="#svg-keyboard_arrow_down"></use></svg>
    </button>
    <h3 class="feed-card-title">{workouts[log.workout].name}</h3>
    <p class="feed-card-text">{getHighlightedWorkoutInfo()}</p>
    {!isCollapsed && <table class="feed-card-data" cellpadding="0" cellspacing="0">
      {workouts[log.workout].fields.map((field) => {
        if (field === 'datetime') return
        return <tr class="feed-card-data-line">
          <td class="feed-card-data-cell">
            <svg class="svg-icon"><use href={`#svg-${fields[field].icon}`}></use></svg>
          </td>
          <td class="feed-card-data-cell">{fields[field].name}</td>
          <td class="feed-card-data-cell">
            {log.fields[field]}{fields[field].unit}
          </td>
        </tr>
      })}
    </table>}
  </div>
}