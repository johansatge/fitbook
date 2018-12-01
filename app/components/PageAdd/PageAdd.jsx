import dateFns from 'date-fns'
import Footer from '../Footer/Footer.jsx'
import { h, Component } from 'preact'
import { MDCSelect } from '@material/select'
import { MDCTextField } from '@material/textfield'
import SvgIcon from '../SvgIcon/SvgIcon.jsx'
import TopBar from '../TopBar/TopBar.jsx'

export default class Add extends Component {
  constructor() {
    super()
    this.state = {
      workoutType: null,
      fields: {},
    }
  }

  componentDidMount() {
    this.updateMdcFields()
  }

  componentDidUpdate() {
    this.updateMdcFields()
  }

  updateMdcFields() {
    // @todo make sure we don't apply the MDC classes several times on the same node
    const selectNodes = this.base.querySelectorAll('.mdc-select')
    for (let i = 0; i < selectNodes.length; i += 1) {
      new MDCSelect(selectNodes[i])
    }
    const textNodes = this.base.querySelectorAll('.mdc-text-field')
    for (let i = 0; i < textNodes.length; i += 1) {
      new MDCTextField(textNodes[i])
    }
  }

  onSelectWorkoutType = (evt) => {
    const defaultFields = {}
    this.props.workouts[evt.target.value].fields.forEach((fieldName) => {
      defaultFields[fieldName] = null
    })
    defaultFields.datetime = this.getDefaultDateTime()
    this.setState({
      ...this.state,
      workoutType: evt.target.value,
      fields: defaultFields,
    })
  }

  onFieldChange = (evt) => {
    const fields = { ...this.state.fields }
    fields[evt.target.name] = this.parseFieldValue(evt.target.name, evt.target.value)
    this.setState({ ...this.state, fields })
  }

  getDefaultDateTime() {
    return dateFns.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
  }

  isValidDateTime(rawDateTime) {
    return rawDateTime.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/)
  }

  parseFieldValue(fieldName, rawValue) {
    const type = this.props.fields[fieldName].type
    if (type === 'string') {
      return String(rawValue)
    }
    if (type === 'number') {
      const number = parseFloat(rawValue)
      return isNaN(number) ? 0 : number
    }
    if (type === 'datetime') {
      return this.isValidDateTime(rawValue) ? rawValue : this.getDefaultDateTime()
    }
    return rawValue
  }

  canSaveAddData(state) {
    if (!state.workoutType || !state.fields) {
      return false
    }
    const emptyFields = Object.keys(state.fields).filter((fieldName) => {
      return state.fields[fieldName] === null || state.fields[fieldName] === ''
    })
    return emptyFields.length === 0
  }

  getWorkouts(workouts, currentWorkoutType) {
    return Object.keys(workouts).map((workoutName, index) => {
      return (
        <option key={index} value={workoutName} selected={workoutName === currentWorkoutType}>
          {workouts[workoutName].name}
        </option>
      )
    })
  }

  getFields(workouts, fields, currentWorkoutType, data) {
    return currentWorkoutType
      ? workouts[currentWorkoutType].fields.map((fieldName, index) => {
          const readableUnit = fields[fieldName].unit ? ` (${fields[fieldName].unit})` : ''
          return (
            <div key={index} className="field mdc-text-field mdc-text-field--with-leading-icon">
              <i className="mdc-text-field__icon">
                <SvgIcon icon={fields[fieldName].icon} variant="darkgrey" />
              </i>
              <input
                type="text"
                id={fieldName}
                name={fieldName}
                value={data[fieldName]}
                className="mdc-text-field__input"
                onInput={this.onFieldChange}
              />
              <label htmlFor={fieldName} className="mdc-floating-label">
                {fields[fieldName].name + readableUnit}
              </label>
              <div className="mdc-line-ripple" />
            </div>
          )
        })
      : []
  }

  render({ fields, workouts, onSave, onBack }, state) {
    const sendData = function() {
      onSave({ workout: state.workoutType, fields: { ...state.fields } })
    }
    return (
      <div>
        <TopBar
          onClickMenu={onBack}
          menuIcon="keyboard_backspace"
          title="Add workout"
          onClickSave={sendData}
          canSave={this.canSaveAddData(state)}
        />
        <main className="app-main">
          <div className="mdc-top-app-bar--fixed-adjust" />
          <div className="page-add">
            <div className="field mdc-select mdc-select--with-leading-icon">
              <i className="mdc-select__icon">
                <SvgIcon icon="accessibility_new" />
              </i>
              <i className="mdc-select__dropdown-icon" />
              <select className="mdc-select__native-control" onChange={this.onSelectWorkoutType}>
                <option value="" selected={state.workoutType ? null : true} />
                {this.getWorkouts(workouts, state.workoutType)}
              </select>
              <label className="mdc-floating-label">Workout type</label>
              <div className="mdc-line-ripple" />
            </div>
            {this.getFields(workouts, fields, state.workoutType, state.fields)}
          </div>
          <Footer />
        </main>
      </div>
    )
  }
}
