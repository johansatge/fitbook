import { h, Component } from 'preact'
import { MDCTopAppBar } from '@material/top-app-bar'

export default class TopBar extends Component {
  constructor() {
    super()
    this.state = {
      isConfirmDelete: false,
    }
    this.onDelete = this.onDelete.bind(this)
    this.onConfirmDelete = this.onConfirmDelete.bind(this)
    this.onCancelDelete = this.onCancelDelete.bind(this)
  }

  componentDidMount() {
    const topAppBar = MDCTopAppBar.attachTo(this.base)
    topAppBar.setScrollTarget(document.querySelector('.app-main')) // @todo this is not good
    topAppBar.listen('MDCTopAppBar:nav', () => {
      this.props.onClickMenu()
    })
  }

  onDelete() {
    this.setState({ ...this.state, isConfirmDelete: true })
  }

  onConfirmDelete() {
    this.setState({ ...this.state, isConfirmDelete: false })
    this.props.onClickDelete()
  }

  onCancelDelete() {
    this.setState({ ...this.state, isConfirmDelete: false })
  }

  getDeleteUi() {
    if (!this.props.onClickDelete) {
      return null
    }
    if (this.state.isConfirmDelete) {
      const buttons = [
        <button key="0" onClick={this.onConfirmDelete} className="material-icons mdc-top-app-bar__action-item">
          done
        </button>,
        <button key="1" onClick={this.onCancelDelete} className="material-icons mdc-top-app-bar__action-item">
          clear
        </button>,
      ]
      return buttons
    }
    return (
      <button onClick={this.onDelete} className="material-icons mdc-top-app-bar__action-item">
        delete_forever
      </button>
    )
  }

  render({ isLoading, onClickRefresh, onClickSave, canSave, menuIcon, title }, state) {
    return (
      <header className="mdc-top-app-bar">
        <div className="mdc-top-app-bar__row">
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <a href="#" className="demo-menu material-icons mdc-top-app-bar__navigation-icon">
              {menuIcon}
            </a>
            <span className="mdc-top-app-bar__title">{state.isConfirmDelete ? 'Delete?' : title}</span>
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
            {this.getDeleteUi()}
          </section>
        </div>
      </header>
    )
  }
}
