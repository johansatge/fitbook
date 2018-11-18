import dateFns from 'date-fns'
import { h, Component } from 'preact'

export default class FeedDate extends Component {
  constructor() {
    super()
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render({ date }) {
    const readableDate = dateFns.format(date, 'dddd, MMMM Do')
    return <h2 className="feed-date mdc-typography--headline6">{readableDate}</h2>
  }
}
