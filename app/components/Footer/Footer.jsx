import { h, Component } from 'preact'
const pkg = require('../../../package.json')

export default class Footer extends Component {
  constructor() {
    super()
  }

  render() {
    return <div className="footer mdc-typography--body2">{`${pkg.name} ${pkg.version}`}</div>
  }
}
