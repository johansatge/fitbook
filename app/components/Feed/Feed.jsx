import dateFns from 'date-fns'
import { h, Component } from 'preact'
import FeedLog from '../FeedLog/FeedLog.jsx'
import FeedDate from '../FeedDate/FeedDate.jsx'

export default class FeedAddButton extends Component {
  constructor() {
    super()
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render({ logs, workouts, fields, onOpenLog }) {
    const days = {}
    logs.forEach((log) => {
      const day = dateFns.format(log.fields.datetime, 'YYYY-MM-DD')
      if (!days[day]) {
        days[day] = []
      }
      days[day].push(log)
    })
    const html = []
    Object.keys(days).forEach((day) => {
      html.push(<FeedDate date={day} />)
      const dayLogs = days[day].map((log, index) => {
        return <FeedLog key={index} log={log} workouts={workouts} fields={fields} onOpenLog={onOpenLog} />
      })
      html.push(<ul className="feed mdc-list mdc-list--two-line">{dayLogs}</ul>)
    })
    return <div>{html}</div>
  }
}
