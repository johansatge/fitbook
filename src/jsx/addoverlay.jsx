import { h, Fragment } from 'preact'
import { useState } from 'preact/hooks'
import { getWorkoutsAndFields, isValueValidForField } from '../utils/store.js'
import { formatDate } from '../utils/date.js'

const { fields, workouts } = getWorkoutsAndFields()

export function AddOverlay({ workoutId, submitHandler, closeHandler }) {
  const workout = workouts[workoutId]

  const initialData = {}
  workout.fields.forEach((field) => {
    initialData[field] = {
      isError: false,
      value: field === 'datetime' ? formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss') : '',
    }
  })
  const [data, setData] = useState(initialData)

  function onEditField(evt) {
    const newData = {}
    newData[evt.currentTarget.name] = {
      isError: !isValueValidForField(String(evt.currentTarget.value), evt.currentTarget.name),
      value: evt.currentTarget.value,
    }
    setData({...data, ...newData})
  }

  function formatDataToSave() {
    const formattedData = {
      workout: workoutId,
      fields: {},
    }
    Object.keys(data).forEach((fieldName) => {
      formattedData.fields[fieldName] = data[fieldName].value
    })
    return formattedData
  }

  return <div class="addoverlay">
    <div class="addoverlay-form">
      <div class="addoverlay-fields">
        <h2 class="addoverlay-title">
          <svg class="svg-icon"><use href={`#svg-${workout.icon}`}></use></svg>
          {workout.name}
        </h2>
        {workout.fields.map((field) => (
          <label class="addoverlay-field">
            <svg class="addoverlay-icon svg-icon"><use href={`#svg-${fields[field].icon}`}></use></svg>
            <input
              class="addoverlay-input"
              type={fields[field].type === 'number' ? 'number' : 'text'}
              name={field}
              placeholder={fields[field].name + (fields[field].unit ? ' (' + fields[field].unit + ')' : '')}
              value={data[field].value}
              onInput={onEditField}
              onChange={onEditField}
              data-js-error={data[field].isError}
            />
          </label>
        ))}
      </div>
      <div class="addoverlay-buttons">
        <button class="button" onClick={closeHandler}>Cancel</button>
        <button class="button button--main" onClick={() => submitHandler(formatDataToSave(data))}>Save</button>
      </div>
    </div>
  </div>
}