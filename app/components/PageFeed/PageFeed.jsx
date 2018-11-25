import dateFns from 'date-fns'
import { h, Component } from 'preact'
import Drawer from '../Drawer/Drawer.jsx'
import Footer from '../Footer/Footer.jsx'
import SvgIcon from '../SvgIcon/SvgIcon.jsx'
import TopBar from '../TopBar/TopBar.jsx'

export default class PageFeed extends Component {
  constructor() {
    super()
    this.state = {
      isDrawerVisible: false,
    }
    this.onOpenDrawer = this.onOpenDrawer.bind(this)
    this.onCloseDrawer = this.onCloseDrawer.bind(this)
  }

  onOpenDrawer() {
    this.setState({ ...this.state, isDrawerVisible: true })
  }

  onCloseDrawer() {
    this.setState({ ...this.state, isDrawerVisible: false })
  }

  getItems(logs, workouts, fields, onOpenLog) {
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
      const readableDate = dateFns.format(day, 'dddd, MMMM Do')
      html.push(<h2 className="page-feed-date mdc-typography--headline6">{readableDate}</h2>)
      const dayLogs = days[day].map((log, index) => {
        return this.getItem(index, log, workouts, fields, onOpenLog)
      })
      html.push(<ul className="page-feed mdc-list mdc-list--two-line">{dayLogs}</ul>)
    })
    return html
  }

  getItem(index, log, workouts, fields, onOpenLog) {
    const highlightField = fields[workouts[log.workout].highlight]
    const highlightValue = log.fields[workouts[log.workout].highlight]
    const onClick = function() {
      onOpenLog(log)
    }
    const readableTime = dateFns.format(log.fields.datetime, 'HH:mm')
    return (
      <li key={index} onClick={onClick} className="mdc-list-item">
        <span className="mdc-list-item__graphic">
          <SvgIcon icon={workouts[log.workout].icon} />
        </span>
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">{workouts[log.workout].name}</span>
          <span className="mdc-list-item__secondary-text">
            {`${highlightField.name}: ${highlightValue}${highlightField.unit} (${readableTime})`}
          </span>
        </span>
        <span className="mdc-list-item__meta">
          <SvgIcon icon="info" variant="grey" />
        </span>
      </li>
    )
  }

  render({ logs, workouts, fields, onOpenLog, onAddLog, onRefresh, isLoading }, state) {
    return (
      <div>
        <Drawer onClickItem={this.onCloseDrawer} onClose={this.onCloseDrawer} isVisible={state.isDrawerVisible} />
        <div className="mdc-drawer-scrim" />
        <TopBar
          onClickMenu={this.onOpenDrawer}
          menuIcon="menu"
          title="Feed"
          onClickRefresh={onRefresh}
          isLoading={isLoading}
        />
        <main className="app-main">
          <div className="mdc-top-app-bar--fixed-adjust" />
          {this.getItems(logs, workouts, fields, onOpenLog)}
          <Footer />
          {!isLoading ? (
            <button onClick={onAddLog} className="page-feed-add-button mdc-fab">
              <span className="mdc-fab__icon">
                <SvgIcon icon="add" />
              </span>
            </button>
          ) : null}
        </main>
      </div>
    )
  }
}
