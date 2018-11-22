import { h, Component } from 'preact'
import { MDCDrawer } from '@material/drawer'

export default class Drawer extends Component {
  constructor() {
    super()
    this.mdcDrawer = null
  }

  componentDidMount() {
    this.mdcDrawer = MDCDrawer.attachTo(this.base)
    this.mdcDrawer.listen('MDCDrawer:closed', () => {
      this.props.onClose()
    })
    const drawerItems = this.base.querySelector('.mdc-list')
    drawerItems.addEventListener('click', () => {
      this.props.onClickItem()
    })
  }

  componentDidUpdate() {
    this.mdcDrawer.open = this.props.isVisible
  }

  render() {
    return (
      <aside className="mdc-drawer mdc-drawer--modal">
        <div className="mdc-drawer__header">
          <h3 className="mdc-drawer__title">fitbook</h3>
          <h6 className="mdc-drawer__subtitle">email@material.io</h6>
        </div>
        <div className="mdc-drawer__content">
          <div className="mdc-list">
            <a className="mdc-list-item mdc-list-item--activated" href="#">
              <i className="material-icons mdc-list-item__graphic">list</i>
              <span className="mdc-list-item__text">Feed</span>
            </a>
            <a className="mdc-list-item" href="#">
              <i className="material-icons mdc-list-item__graphic">date_range</i>
              <span className="mdc-list-item__text">Calendar</span>
            </a>
            <a className="mdc-list-item" href="#">
              <i className="material-icons mdc-list-item__graphic">insert_chart_outlined</i>
              <span className="mdc-list-item__text">Statistics</span>
            </a>
            <hr className="mdc-list-divider" />
            <h6 className="mdc-list-group__subheader">More</h6>
            <a className="mdc-list-item" href="#">
              <i className="material-icons mdc-list-item__graphic">help</i>
              <span className="mdc-list-item__text">About the app</span>
            </a>
          </div>
        </div>
      </aside>
    )
  }
}
