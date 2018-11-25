import { h, Component } from 'preact'
const pkg = require('../../../package.json')

export default class PageAuth extends Component {
  constructor() {
    super()
  }

  render({ authUrl }) {
    return (
      <div className="page-auth">
        <h1 className="mdc-typography--headline1">{pkg.name}</h1>
        <a href={authUrl} className="mdc-button mdc-button--raised">
          Login to Dropbox
        </a>
      </div>
    )
  }
}
