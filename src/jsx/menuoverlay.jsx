import { h } from 'preact'
import { logout } from '../utils/store.js'

export function MenuOverlay({ closeHandler }) {
  return <div class="menuoverlay">
    <div class="menu-back" onClick={closeHandler}></div>
    <div class="menu">
      <div class="menu-hero">
        {window.appTitle}
      </div>
      <ul class="menu-items">
        <li>
          <a href="#" class="menu-item menu-item--current">
            <svg class="svg-icon"><use href="#svg-list"></use></svg>
            Feed
          </a>
        </li>
        <li>
          <a href="#" class="menu-item">
            <svg class="svg-icon"><use href="#svg-insert_chart_outlined"></use></svg>
            Statistics (todo)
          </a>
        </li>
        <li>
          <button class="menu-item" onClick={logout}>
            <svg class="svg-icon"><use href="#svg-exit_to_app"></use></svg>
            Logout
          </button>
        </li>
        <li>
          <a href="https://github.com/johansatge/fitbook" class="menu-item">
            <svg class="svg-icon"><use href="#svg-help"></use></svg>
            About the app
          </a>
        </li>
      </ul>
    </div>
  </div>
}