import { h, Component } from 'preact'
import { MDCTopAppBar } from '@material/top-app-bar'

export default class TopBar extends Component {
  constructor() {
    super()
  }

  componentDidMount() {
    const topAppBar = MDCTopAppBar.attachTo(this.base)
    topAppBar.setScrollTarget(document.querySelector('.app-main')) // @todo this is not good
    topAppBar.listen('MDCTopAppBar:nav', () => {
      this.props.onClickMenu()
    })
  }

  render({ isLoading, onClickRefresh, onClickSave, onClickDelete, canSave, menuIcon, title }) {
    return (
      <header className="mdc-top-app-bar">
        <div className="mdc-top-app-bar__row">
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <a href="#" className="demo-menu material-icons mdc-top-app-bar__navigation-icon">
              {menuIcon}
            </a>
            <span className="mdc-top-app-bar__title">{title}</span>
          </section>
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">
            {onClickRefresh ? (
              <button
                onClick={onClickRefresh}
                className={`material-icons mdc-top-app-bar__action-item ${isLoading ? 'top-bar--loading' : ''}`}
                disabled={isLoading}
              >
                autorenew
              </button>
            ) : null}
            {onClickSave ? (
              <button onClick={onClickSave} disabled={!canSave} className="material-icons mdc-top-app-bar__action-item">
                done
              </button>
            ) : null}
            {onClickDelete ? (
              <button onClick={onClickDelete} className="material-icons mdc-top-app-bar__action-item">
                delete_forever
              </button>
            ) : null}
          </section>
        </div>
      </header>
    )
  }
}
