import dateFns from 'date-fns'
import { h, Component } from 'preact'
import Footer from '../Footer/Footer.jsx'
import TopBar from '../TopBar/TopBar.jsx'

export default class PageLog extends Component {
  constructor() {
    super()
  }

  readableFieldValue(log, fieldName, fieldUnit) {
    if (fieldName === 'datetime') {
      const readableDate = dateFns.format(log.fields.datetime, 'dddd, MMMM Do')
      const readableTime = dateFns.format(log.fields.datetime, 'HH:mm')
      return `${readableDate} (${readableTime})`
    }
    return `${log.fields[fieldName]}${fieldUnit}`
  }

  render({ onBack, onDelete, log, workouts, fields }) {
    const items = [
      <li key="0" className="mdc-list-item">
        <span className="mdc-list-item__graphic material-icons">accessibility_new</span>
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">{workouts[log.workout].name}</span>
          <span className="mdc-list-item__secondary-text">Workout type</span>
        </span>
      </li>,
    ]
    Object.keys(log.fields).forEach((fieldName, index) => {
      items.push(
        <li key={index + 1} className="mdc-list-item">
          <span className="mdc-list-item__graphic material-icons">{fields[fieldName].icon}</span>
          <span className="mdc-list-item__text">
            <span className="mdc-list-item__primary-text">
              {this.readableFieldValue(log, fieldName, fields[fieldName].unit)}
            </span>
            <span className="mdc-list-item__secondary-text">{fields[fieldName].name}</span>
          </span>
        </li>
      )
    })
    return (
      <div>
        <TopBar onClickMenu={onBack} onClickDelete={onDelete} menuIcon="keyboard_backspace" title="Workout" />
        <main className="app-main">
          <div className="mdc-top-app-bar--fixed-adjust" />
          <ul className="page-log mdc-list mdc-list--two-line">{items}</ul>
          <Footer />
        </main>
      </div>
    )
  }
}
