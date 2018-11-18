import { h, Component } from 'preact'
import { MDCSelect } from '@material/select'
import { MDCTextField } from '@material/textfield'

export default class Add extends Component {
  constructor() {
    super()
  }

  componentDidMount() {
    const selectNodes = this.base.querySelectorAll('.mdc-select')
    for (let i = 0; i < selectNodes.length; i += 1) {
      new MDCSelect(selectNodes[i])
    }
    const textNodes = this.base.querySelectorAll('.mdc-text-field')
    for (let i = 0; i < textNodes.length; i += 1) {
      new MDCTextField(textNodes[i])
    }
  }

  componentWillUnmount() {}

  render({ fields, workouts }) {
    const workoutNodes = Object.keys(workouts).map((workoutName, index) => {
      return (
        <option key={index} value={workoutName}>
          {workouts[workoutName].name}
        </option>
      )
    })
    return (
      <div className="add">
        <div className="field mdc-select mdc-select--with-leading-icon">
          <i className="material-icons mdc-select__icon">accessibility_new</i>
          <i className="mdc-select__dropdown-icon" />
          <select className="mdc-select__native-control">
            <option value="" disabled selected />
            {workoutNodes}
          </select>
          <label className="mdc-floating-label">Workout type</label>
          <div className="mdc-line-ripple" />
        </div>
        <div className="field mdc-text-field mdc-text-field--with-leading-icon">
          <i className="material-icons mdc-text-field__icon">event</i>
          <input type="text" id="my-input" className="mdc-text-field__input" />
          <label htmlFor="my-input" className="mdc-floating-label">
            Date
          </label>
          <div className="mdc-line-ripple" />
        </div>
        <div className="field mdc-text-field mdc-text-field--with-leading-icon">
          <i className="material-icons mdc-text-field__icon">map</i>
          <input type="text" id="my-input" className="mdc-text-field__input" />
          <label htmlFor="my-input" className="mdc-floating-label">
            Distance
          </label>
          <div className="mdc-line-ripple" />
        </div>
        <div className="field mdc-text-field mdc-text-field--with-leading-icon">
          <i className="material-icons mdc-text-field__icon">play_arrow</i>
          <input type="text" id="my-input" className="mdc-text-field__input" />
          <label htmlFor="my-input" className="mdc-floating-label">
            Average speed
          </label>
          <div className="mdc-line-ripple" />
        </div>
        <div className="field mdc-text-field mdc-text-field--with-leading-icon">
          <i className="material-icons mdc-text-field__icon">fast_forward</i>
          <input type="text" id="my-input" className="mdc-text-field__input" />
          <label htmlFor="my-input" className="mdc-floating-label">
            Max speed
          </label>
          <div className="mdc-line-ripple" />
        </div>
        <div className="field mdc-text-field mdc-text-field--with-leading-icon">
          <i className="material-icons mdc-text-field__icon">whatshot</i>
          <input type="text" id="my-input" className="mdc-text-field__input" />
          <label htmlFor="my-input" className="mdc-floating-label">
            Calories
          </label>
          <div className="mdc-line-ripple" />
        </div>
        <div className="field mdc-text-field mdc-text-field--with-leading-icon">
          <i className="material-icons mdc-text-field__icon">favorite</i>
          <input type="text" id="my-input" className="mdc-text-field__input" />
          <label htmlFor="my-input" className="mdc-floating-label">
            Average heartbeat
          </label>
          <div className="mdc-line-ripple" />
        </div>
        <button className="button mdc-button mdc-button--unelevated">Save workout</button>
        <button className="button mdc-button">Cancel</button>
      </div>
    )
  }
}
