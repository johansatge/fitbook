import { h, Component } from 'preact'
import { MDCDrawer } from '@material/drawer'
import SvgIcon from '../SvgIcon/SvgIcon.jsx'

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

  render({ onLogout }) {
    return (
      <aside className="mdc-drawer mdc-drawer--modal">
        <div className="mdc-drawer__header">
          <h3 className="mdc-drawer__title">fitbook</h3>
          <h6 className="mdc-drawer__subtitle">email@material.io</h6>
        </div>
        <div className="mdc-drawer__content">
          <div className="mdc-list">
            <a className="mdc-list-item mdc-list-item--activated" href="#">
              <i className="mdc-list-item__graphic">
                <SvgIcon icon="list" />
              </i>
              <span className="mdc-list-item__text">Feed</span>
            </a>
            <a className="mdc-list-item" href="#">
              <i className="mdc-list-item__graphic">
                <SvgIcon icon="date_range" />
              </i>
              <span className="mdc-list-item__text">Calendar</span>
            </a>
            <a className="mdc-list-item" href="#">
              <i className="mdc-list-item__graphic">
                <SvgIcon icon="insert_chart_outlined" />
              </i>
              <span className="mdc-list-item__text">Statistics</span>
            </a>
            <hr className="mdc-list-divider" />
            <h6 className="mdc-list-group__subheader">More</h6>
            <a className="mdc-list-item" href="#" onClick={onLogout}>
              <i className="mdc-list-item__graphic">
                <SvgIcon icon="exit_to_app" />
              </i>
              <span className="mdc-list-item__text">Logout</span>
            </a>
            <a className="mdc-list-item" href="#">
              <i className="mdc-list-item__graphic">
                <SvgIcon icon="help" />
              </i>
              <span className="mdc-list-item__text">About the app</span>
            </a>
          </div>
        </div>
      </aside>
    )
  }
}
