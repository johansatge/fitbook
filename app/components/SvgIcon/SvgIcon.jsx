import { h, Component } from 'preact'

export default class SvgIcon extends Component {
  constructor() {
    super()
  }

  render({ icon }) {
    return (
      <svg className="svg-icon">
        <use href={`#svg-${icon}`} />
      </svg>
    )
  }
}
