import { h, Component } from 'preact'
const pkg = require('../../../package.json')

export default class Footer extends Component {
  constructor() {
    super()
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return <div className="footer mdc-typography--body2">{`${pkg.name} ${pkg.version}`}</div>
  }
}
