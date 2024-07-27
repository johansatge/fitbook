import { h, Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { Navbar } from './navbar.jsx'
import { MenuOverlay } from './menuoverlay.jsx'
import { Toast } from './toast.jsx'
import { Feed } from './feed.jsx'
import { FloatingButtons } from './floatingbuttons.jsx'
import { AddOverlay } from './addoverlay.jsx'
import { StopwatchOverlay } from './stopwatchoverlay.jsx'
import { fetchMonths, fetchMonth, isValueValidForField, saveLog } from '../utils/store.js'

export function Ui() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpened, setIsMenuOpened] = useState(false)
  const [isStopwatchOpened, setIsStopwatchOpened] = useState(false)
  const [currentMonthPath, setCurrentMonthPath] = useState(null)
  const [months, setMonths] = useState(null)
  const [monthLogs, setMonthLogs] = useState(null)
  const [workoutIdToAdd, setWorkoutIdToAdd] = useState(null)
  const [toastLabel, setToastLabel] = useState('')

  // Load months
  useEffect(() => {
    const asyncEffect = async () => {
      const months = await fetchMonths()
      setMonths(months)
      setCurrentMonthPath(months[0].path)
      setIsLoading(false)
      setToastLabel('Loaded months')
    }
    asyncEffect()
  }, [])

  // Load selected month
  useEffect(() => {
    setIsLoading(true)
    setMonthLogs(null)
    const asyncEffect = async () => {
      if (!currentMonthPath) return
      const logs = await fetchMonth(currentMonthPath)
      setMonthLogs(logs)
      setIsLoading(false)
      setToastLabel('Loaded workouts')
    }
    asyncEffect()
  }, [currentMonthPath])

  async function onSubmitWorkout(data) {
    let errors = 0
    Object.keys(data.fields).forEach((fieldName) => {
      errors += isValueValidForField(data.fields[fieldName], fieldName) ? 0 : 1
    })
    if (errors > 0) {
      return
    }
    setWorkoutIdToAdd(null)
    setIsLoading(true)
    setToastLabel('Saving workout...')
    const { monthPath, logs } = await saveLog(data)
    setIsLoading(false)
    setToastLabel('Saved workout')
    if (monthPath === currentMonthPath) {
      setMonthLogs(logs)
    }
  }

  return <>
    <Navbar
      isLoading={isLoading}
      currentMonthPath={currentMonthPath}
      months={months}
      selectMonthHandler={setCurrentMonthPath}
      openMenuHandler={() => setIsMenuOpened(true)}
    />
    <FloatingButtons
      addWorkoutHandler={setWorkoutIdToAdd}
      openStopwatchHandler={() => setIsStopwatchOpened(true)}
    />
    <Toast label={toastLabel} />
    <Feed logs={monthLogs} />
    <div class="footer">
      {window.appTitleFull}
    </div>
    {workoutIdToAdd && <AddOverlay
      workoutId={workoutIdToAdd}
      closeHandler={() => setWorkoutIdToAdd(null)}
      submitHandler={(data) => onSubmitWorkout(data)}
    />}
    {isStopwatchOpened && <StopwatchOverlay closeHandler={() => setIsStopwatchOpened(false)} />}
    {isMenuOpened && <MenuOverlay closeHandler={() => setIsMenuOpened(false)} />}
  </>
}