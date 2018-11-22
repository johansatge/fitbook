import dateFns from 'date-fns'
import { h, Component } from 'preact'

export default class FeedLog extends Component {
  constructor() {
    super()
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render({ log, workouts, fields, onOpenLog }) {
    const highlightField = fields[workouts[log.workout].highlight]
    const highlightValue = log.fields[workouts[log.workout].highlight]
    const onClick = function() {
      onOpenLog(log)
    }
    const readableTime = dateFns.format(log.fields.datetime, 'HH:mm')
    return (
      <li onClick={onClick} className="mdc-list-item">
        <span className="mdc-list-item__graphic material-icons">{workouts[log.workout].icon}</span>
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">{workouts[log.workout].name}</span>
          <span className="mdc-list-item__secondary-text">
            {`${highlightField.name}: ${highlightValue}${highlightField.unit} (${readableTime})`}
          </span>
        </span>
        <span className="mdc-list-item__meta material-icons">info</span>
      </li>
    )
  }
}
