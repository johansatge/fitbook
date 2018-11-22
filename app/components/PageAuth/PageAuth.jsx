import { h, Component } from 'preact'

export default class PageAuth extends Component {
  constructor() {
    super()
  }

  render({ authUrl }) {
    return (
      <a href={authUrl} className="mdc-button mdc-button--raised">
        Login to Dropbox
      </a>
    )
  }
}
