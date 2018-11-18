import { h, Component } from 'preact'

export default class FeedAddButton extends Component {
  constructor() {
    super()
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render({ onClick }) {
    return (
      <button onClick={onClick} className="feed-add-button mdc-fab">
        <span className="mdc-fab__icon material-icons">add</span>
      </button>
    )
  }
}
