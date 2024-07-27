import { h, Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { getWorkoutsAndFields } from '../utils/store.js'

const { workouts } = getWorkoutsAndFields()

export function FloatingButtons({ openStopwatchHandler, addWorkoutHandler }) {
  const [selectedWorkout, setSelectedWorkout] = useState('')
  function onSelectWorkout(evt) {
    addWorkoutHandler(evt.currentTarget.value)
    setSelectedWorkout(evt.currentTarget.value)
  }
  useEffect(() => {
    if (selectedWorkout === '') return
    setSelectedWorkout('')
  }, [selectedWorkout])
  return <div class="floatingbuttons">
    <span class="floatingbutton">
      <svg class="svg-icon"><use href="#svg-add"></use></svg>
      <select class="floatingbutton-actions" onChange={onSelectWorkout}>
        <option value="" selected={selectedWorkout === ''}>Select a workout...</option>
        {Object.keys(workouts).map((workoutId) => {
          const workout = workouts[workoutId]
          return <option value={workoutId} selected={selectedWorkout === workoutId}>{workout.name}</option>
        })}
      </select>
    </span>
    <button class="floatingbutton" onClick={openStopwatchHandler}>
      <svg class="svg-icon"><use href="#svg-alarm_on"></use></svg>
    </button>
  </div>
}