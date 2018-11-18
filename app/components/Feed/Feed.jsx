import { h, Component } from 'preact'
import FeedLog from '../FeedLog/FeedLog.jsx'
import FeedDate from '../FeedDate/FeedDate.jsx'

export default class FeedAddButton extends Component {
  constructor() {
    super()
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render({ logs, onOpenLog }) {
    const html = []
    Object.keys(logs).forEach((day) => {
      html.push(<FeedDate date={day} />)
      const dayLogs = logs[day].map((log, index) => {
        return <FeedLog key={index} log={log} onOpenLog={onOpenLog} />
      })
      html.push(<ul className="feed mdc-list mdc-list--two-line">{dayLogs}</ul>)
    })
    return <div>{html}</div>
  }
}
