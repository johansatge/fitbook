import { h, Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'

export function StopwatchOverlay({ closeHandler }) {

  const [isRunning, setIsRunning] = useState(false)
  const [isResting, setIsResting] = useState(false)
  const [setsAmount, setSetsAmounts] = useState(null)
  const [doneSetsAmount, setDoneSetsAmount] = useState(0)
  const [restTime, setRestTime] = useState(null)

  useEffect(() => {
    if (!isRunning) return
    document.querySelector(':root').style.setProperty('--stopwatchRestTime', `${restTime}s`)
    const timeout = setTimeout(() => setIsResting(false), restTime * 1000)
    return () => clearTimeout(timeout)
  }, [doneSetsAmount])

  function onStart() {
    if (setsAmount > 0 && restTime > 0) {
      setIsRunning(true)
    }
  }

  function onSetDone() {
    if (doneSetsAmount + 1 === setsAmount) {
      closeHandler()
      return
    }
    setDoneSetsAmount(doneSetsAmount + 1)
    setIsResting(true)
  }

  return <div class="stopwatchoverlay">
    <div class="stopwatchoverlay-form">
      {!isRunning && <div class="stopwatchoverlay-fields">
        <label class="stopwatchoverlay-field">
          <svg class="stopwatchoverlay-icon svg-icon"><use href="#svg-forward_10"></use></svg>
          <input
            type="number"
            class="stopwatchoverlay-input"
            placeholder="Sets"
            autocomplete="off"
            onInput={(evt) => setSetsAmounts(parseInt(evt.currentTarget.value) || 5)}
          />
        </label>
        <label class="stopwatchoverlay-field">
          <svg class="stopwatchoverlay-icon svg-icon"><use href="#svg-alarm_on"></use></svg>
          <input
            type="number"
            class="stopwatchoverlay-input"
            placeholder="Rest time"
            autocomplete="off"
            onInput={(evt) => setRestTime(parseInt(evt.currentTarget.value) || 30)}
          />
        </label>
      </div>}
      {isRunning && !isResting && <div class="stopwatchoverlay-currentset" onClick={onSetDone}>
        <div class="stopwatchoverlay-currentset-title">
          Set {doneSetsAmount + 1}/{setsAmount}
        </div>
        Tap to rest
      </div>}
      {isRunning && isResting && <div class="stopwatchoverlay-currentrest" data-js-stopwatch-currentrest>
        <div class="stopwatchoverlay-currentrest-title">Rest</div>
      </div>}
      <div class="stopwatchoverlay-buttons">
        <button class="button" onClick={closeHandler}>Close</button>
        {!isRunning && <button class="button button--main" onClick={onStart}>Start</button>}
      </div>
    </div>
  </div>
}