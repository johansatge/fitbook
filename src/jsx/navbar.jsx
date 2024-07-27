import { h, Fragment } from 'preact'

export function Navbar ({ isLoading, currentMonthPath, months, selectMonthHandler, openMenuHandler }) {
  return <div class="navbar">
    <div class="navbar-left">
      <button class="navbar-menu" onClick={openMenuHandler}>
        <svg class="svg-icon"><use href="#svg-menu"></use></svg>
      </button>
      <h1 class="navbar-title">
        {window.appTitle}
        <svg class="svg-icon"><use href="#svg-play_arrow"></use></svg>
        <span class="navbar-title-current">
          <span>
            {currentMonthPath ? months.find((m) => m.path === currentMonthPath).name : 'loading'}
          </span>
          <select class="navbar-filter" onChange={(evt) => selectMonthHandler(evt.currentTarget.value)}>
            {months && months.map((month) => (
              <option value={month.path} selected={currentMonthPath === month.path}>{month.name}</option>
            ))}
            {!months && (
              <option disabled>loading</option>
            )}
          </select>
        </span>
      </h1>
    </div>
    <div class="navbar-right">
      {isLoading && <button class="navbar-menu navbar-menu--loader">
        <svg class="svg-icon"><use href="#svg-autorenew"></use></svg>
      </button>}
    </div>
  </div>
}