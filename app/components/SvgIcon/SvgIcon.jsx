import { h, Component } from 'preact'

export default class SvgIcon extends Component {
  constructor() {
    super()
  }

  render({ icon, variant }) {
    return (
      <svg className={`svg-icon ${variant ? `svg-icon--${variant}` : ''}`}>
        <use href={`#svg-${icon}`} />
      </svg>
    )
  }
}
