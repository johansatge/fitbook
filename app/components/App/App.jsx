/* global Promise */

import { h, Component } from 'preact'
import Add from '../Add/Add.jsx'
import Footer from '../Footer/Footer.jsx'
import AuthButton from '../AuthButton/AuthButton.jsx'
import PageFeed from '../PageFeed/PageFeed.jsx'
import PageLog from '../PageLog/PageLog.jsx'
import TopBar from '../TopBar/TopBar.jsx'
import { getConfigAndLogs, getStoreAuthUrl, getStoreUser, isStoreConnected, saveLog } from '../../store.js'

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      isLoading: false,
      page: 'feed',
      pageData: null,
      store: {
        isConnected: isStoreConnected(),
        authUrl: getStoreAuthUrl(),
        user: null,
        fields: null,
        workouts: null,
        logs: [],
      },
    }
    this.onFetchStoreData = this.onFetchStoreData.bind(this)
    this.onAddLog = this.onAddLog.bind(this)
    this.onOpenLog = this.onOpenLog.bind(this)
    this.onReturnToFeed = this.onReturnToFeed.bind(this)
    this.onAddSave = this.onAddSave.bind(this)
    this.onAddUpdate = this.onAddUpdate.bind(this)
    this.onDelete = this.onDelete.bind(this)
    if (this.state.store.isConnected) {
      this.onFetchStoreData()
    }
  }

  onOpenLog(log) {
    this.setState({ ...this.state, page: 'log', pageData: log })
  }

  onAddLog() {
    this.setState({ ...this.state, page: 'add', pageData: null })
  }

  onAddSave() {
    const data = { ...this.state.pageData }
    this.setState({
      ...this.state,
      page: 'feed',
      pageData: null,
      isLoading: true,
    })
    saveLog(data, [...this.state.store.logs])
      .then((updatedLogs) => {
        this.setState({ ...this.state, isLoading: false, store: { ...this.state.store, logs: updatedLogs } })
      })
      .catch((error) => {
        this.setState({ ...this.state, isLoading: false })
        console.log('@todo handle store error', error)
      })
  }

  canSaveAddData() {
    if (!this.state.pageData || !this.state.pageData.fields) {
      return false
    }
    const emptyFields = Object.keys(this.state.pageData.fields).filter((fieldName) => {
      return this.state.pageData.fields[fieldName] === null || this.state.pageData.fields[fieldName] === ''
    })
    return emptyFields.length === 0
  }

  onAddUpdate(data) {
    this.setState({ ...this.state, pageData: data })
  }

  onDelete() {
    // @todo delete and return to feed page
  }

  onReturnToFeed() {
    this.setState({ ...this.state, page: 'feed', pageData: null })
  }

  onFetchStoreData() {
    this.setState({
      ...this.state,
      isLoading: true,
      store: { ...this.state.store, user: null, fields: null, workouts: null, logs: [] },
    })
    Promise.all([getStoreUser(), getConfigAndLogs()])
      .then(([user, configAndLogs]) => {
        this.setState({
          ...this.state,
          store: {
            ...this.state.store,
            user,
            logs: configAndLogs.logs,
            fields: configAndLogs.fields,
            workouts: configAndLogs.workouts,
          },
          isLoading: false,
        })
      })
      .catch((error) => {
        this.setState({ ...this.state, isLoading: false })
        console.log('@todo handle store error', error)
      })
  }

  render(props, state) {
    console.log('App', state)
    if (!state.store.isConnected) {
      return <AuthButton authUrl={state.store.authUrl} />
    }
    if (state.page === 'log') {
      return (
        <PageLog
          log={state.pageData}
          workouts={state.store.workouts}
          fields={state.store.fields}
          onBack={this.onReturnToFeed}
          onDelete={this.onDelete}
        />
      )
    }
    if (state.page === 'add') {
      return (
        <div>
          <TopBar
            onClickMenu={this.onReturnToFeed}
            menuIcon="keyboard_backspace"
            title="Add workout"
            onClickSave={this.onAddSave}
            canSave={this.canSaveAddData()}
          />
          <main className="app-main">
            <div className="mdc-top-app-bar--fixed-adjust" />
            <Add
              fields={state.store.fields}
              workouts={state.store.workouts}
              data={state.store.pageData}
              onUpdate={this.onAddUpdate}
            />
            <Footer />
          </main>
        </div>
      )
    }
    if (state.page === 'feed') {
      return (
        <PageFeed
          onRefresh={this.onFetchStoreData}
          onOpenLog={this.onOpenLog}
          onAddLog={this.onAddLog}
          isLoading={state.isLoading}
          logs={state.store.logs}
          workouts={state.store.workouts}
          fields={state.store.fields}
        />
      )
    }
  }
}
