const nodeToast = document.querySelector('[data-js-toast]')

const state = {
  timeout: null,
}

export function setToast(message) {
  if (state.timeout) {
    clearTimeout(state.timeout)
    state.timeout = null
  }
  nodeToast.classList.add('js-visible')
  nodeToast.innerHTML = message
  nodeToast.classList.add('js-visible')
  state.timeout = setTimeout(() => {
    nodeToast.classList.remove('js-visible')
    state.timeout = null
  }, 2000)
}
