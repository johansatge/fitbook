import { h, Component } from 'preact'

export default class Log extends Component {
  constructor() {
    super()
  }

  componentDidMount() {}

  componentWillUnmount() {}

  readableFieldValue(log, fieldName) {
    if (fieldName === 'datetime') {
      return `${log.readableDate} (${log.readableTime})`
    }
    return `${log.data[fieldName].value}${log.data[fieldName].field.unit}`
  }

  render({ log }) {
    const fields = [
      <li key="0" className="mdc-list-item">
        <span className="mdc-list-item__graphic material-icons">accessibility_new</span>
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">{log.workout.name}</span>
          <span className="mdc-list-item__secondary-text">Workout type</span>
        </span>
      </li>,
    ]
    Object.keys(log.data).forEach((fieldName, index) => {
      fields.push(
        <li key={index + 1} className="mdc-list-item">
          <span className="mdc-list-item__graphic material-icons">{log.data[fieldName].field.icon}</span>
          <span className="mdc-list-item__text">
            <span className="mdc-list-item__primary-text">{this.readableFieldValue(log, fieldName)}</span>
            <span className="mdc-list-item__secondary-text">{log.data[fieldName].field.name}</span>
          </span>
        </li>
      )
    })
    return <ul className="log mdc-list mdc-list--two-line">{fields}</ul>
  }
}
