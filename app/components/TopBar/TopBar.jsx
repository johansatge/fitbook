import { h, Component } from 'preact'
import SvgIcon from '../SvgIcon/SvgIcon.jsx'

export default class TopBar extends Component {
  constructor() {
    super()
    this.state = {
      isConfirmDelete: false,
    }
  }

  onDelete = () => {
    this.setState({ ...this.state, isConfirmDelete: true })
  }

  onConfirmDelete = () => {
    this.setState({ ...this.state, isConfirmDelete: false })
    this.props.onClickDelete()
  }

  onCancelDelete = () => {
    this.setState({ ...this.state, isConfirmDelete: false })
  }

  getDeleteUi() {
    if (!this.props.onClickDelete) {
      return null
    }
    if (this.state.isConfirmDelete) {
      const buttons = [
        <button key="0" onClick={this.onConfirmDelete} className="mdc-top-app-bar__action-item">
          <SvgIcon icon="done" />
        </button>,
        <button key="1" onClick={this.onCancelDelete} className="mdc-top-app-bar__action-item">
          <SvgIcon icon="clear" />
        </button>,
      ]
      return buttons
    }
    return (
      <button onClick={this.onDelete} className="mdc-top-app-bar__action-item">
        <SvgIcon icon="delete_forever" />
      </button>
    )
  }

  render({ isLoading, onClickRefresh, onClickMenu, onClickSave, canSave, menuIcon, title }, state) {
    return (
      <header className="mdc-top-app-bar">
        <div className="mdc-top-app-bar__row">
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <a href="#" className="mdc-top-app-bar__navigation-icon" onClick={onClickMenu}>
              <SvgIcon icon={menuIcon} />
            </a>
            <span className="mdc-top-app-bar__title">{state.isConfirmDelete ? 'Delete?' : title}</span>
          </section>
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">
            {onClickRefresh ? (
              <button
                onClick={onClickRefresh}
                className={`mdc-top-app-bar__action-item ${isLoading ? 'top-bar--loading' : ''}`}
                disabled={isLoading}
              >
                <SvgIcon icon="autorenew" />
              </button>
            ) : null}
            {onClickSave ? (
              <button onClick={onClickSave} disabled={!canSave} className="mdc-top-app-bar__action-item">
                <SvgIcon icon="done" />
              </button>
            ) : null}
            {this.getDeleteUi()}
          </section>
        </div>
      </header>
    )
  }
}
