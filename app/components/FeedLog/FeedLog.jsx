import { h, Component } from 'preact'

export default class FeedLog extends Component {
  constructor() {
    super()
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render({ log, onOpenLog }) {
    const highlightField = log.data[log.workout.highlight].field
    const highlightValue = log.data[log.workout.highlight].value
    const onClick = function() {
      onOpenLog(log)
    }
    return (
      <li onClick={onClick} className="mdc-list-item">
        <span className="mdc-list-item__graphic material-icons">{log.workout.icon}</span>
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">{log.workout.name}</span>
          <span className="mdc-list-item__secondary-text">
            {`${highlightField.name}: ${highlightValue}${highlightField.unit} (${log.readableTime})`}
          </span>
        </span>
        <span className="mdc-list-item__meta material-icons">info</span>
      </li>
    )
  }
}
