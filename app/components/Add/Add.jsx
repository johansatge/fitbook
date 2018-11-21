import { h, Component } from 'preact'
import { MDCSelect } from '@material/select'
import { MDCTextField } from '@material/textfield'

export default class Add extends Component {
  constructor() {
    super()
    this.state = {
      workoutType: null,
      fields: {},
    }
    this.onSelectWorkoutType = this.onSelectWorkoutType.bind(this)
    this.onFieldChange = this.onFieldChange.bind(this)
  }

  componentDidMount() {
    this.updateMdcFields()
  }

  componentDidUpdate() {
    this.updateMdcFields()
  }

  componentWillUnmount() {}

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

  onSelectWorkoutType(evt) {
    this.setState({ ...this.state, workoutType: evt.target.value, fields: {} })
  }

  onFieldChange(evt) {
    const fields = { ...this.state.fields }
    fields[evt.target.name] = evt.target.value
    this.setState({ ...this.state, fields })
    this.props.onUpdate(this.state.workoutType, { ...this.state.fields })
  }

  render({ fields, workouts }, state) {
    const workoutNodes = Object.keys(workouts).map((workoutName, index) => {
      return (
        <option key={index} value={workoutName} selected={workoutName === state.workoutType}>
          {workouts[workoutName].name}
        </option>
      )
    })
    const fieldNodes = state.workoutType
      ? workouts[state.workoutType].fields.map((fieldName, index) => {
          return (
            <div key={index} className="field mdc-text-field mdc-text-field--with-leading-icon">
              <i className="material-icons mdc-text-field__icon">{fields[fieldName].icon}</i>
              <input
                type="text"
                id={fieldName}
                name={fieldName}
                value={state.fields[fieldName]}
                className="mdc-text-field__input"
                onChange={this.onFieldChange}
              />
              <label htmlFor={fieldName} className="mdc-floating-label">
                {fields[fieldName].name}
              </label>
              <div className="mdc-line-ripple" />
            </div>
          )
        })
      : []
    return (
      <div className="add">
        <div className="field mdc-select mdc-select--with-leading-icon">
          <i className="material-icons mdc-select__icon">accessibility_new</i>
          <i className="mdc-select__dropdown-icon" />
          <select className="mdc-select__native-control" onChange={this.onSelectWorkoutType}>
            <option value="" selected={state.workoutType ? null : true} />
            {workoutNodes}
          </select>
          <label className="mdc-floating-label">Workout type</label>
          <div className="mdc-line-ripple" />
        </div>
        {fieldNodes}
      </div>
    )
  }
}
