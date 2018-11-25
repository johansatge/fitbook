/* global Promise */

import { h, Component } from 'preact'
import PageAdd from '../PageAdd/PageAdd.jsx'
import PageAuth from '../PageAuth/PageAuth.jsx'
import PageFeed from '../PageFeed/PageFeed.jsx'
import PageLog from '../PageLog/PageLog.jsx'
import {
  getConfigAndLogs,
  getStoreAuthUrl,
  getStoreUser,
  isStoreConnected,
  saveLog,
  deleteLog,
  clearAccessToken,
} from '../../store.js'

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      isLoading: false,
      page: 'feed',
      currentLog: null,
      store: {
        isConnected: isStoreConnected(),
        authUrl: getStoreAuthUrl(),
        user: null,
        fields: null,
        workouts: null,
        logs: [],
      },
    }
    if (this.state.store.isConnected) {
      this.onFetchStoreData()
    }
  }

  onLogout = () => {
    clearAccessToken()
    this.setState({
      ...this.state,
      store: { ...this.state.store, isConnected: false, user: null, fields: null, workouts: null, logs: [] },
    })
  }

  onOpenLog = (log) => {
    this.setState({ ...this.state, page: 'log', currentLog: log })
  }

  onAddLog = () => {
    this.setState({ ...this.state, page: 'add' })
  }

  onSaveLog = (data) => {
    this.setState({ ...this.state, page: 'feed', currentLog: null, isLoading: true })
    saveLog(data, [...this.state.store.logs])
      .then((updatedLogs) => {
        this.setState({ ...this.state, isLoading: false, store: { ...this.state.store, logs: updatedLogs } })
      })
      .catch((error) => {
        this.setState({ ...this.state, isLoading: false })
        console.log('@todo handle store error', error)
      })
  }

  onDeleteLog = (log) => {
    this.setState({ ...this.state, page: 'feed', isLoading: true })
    deleteLog(log, [...this.state.store.logs])
      .then((updatedLogs) => {
        this.setState({ ...this.state, isLoading: false, store: { ...this.state.store, logs: updatedLogs } })
      })
      .catch((error) => {
        this.setState({ ...this.state, isLoading: false })
        console.log('@todo handle store error', error)
      })
  }

  onReturnToFeed = () => {
    this.setState({ ...this.state, page: 'feed', currentLog: null })
  }

  onFetchStoreData = () => {
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
      return <PageAuth authUrl={state.store.authUrl} />
    }
    if (state.page === 'log') {
      return (
        <PageLog
          log={state.currentLog}
          workouts={state.store.workouts}
          fields={state.store.fields}
          onBack={this.onReturnToFeed}
          onDelete={this.onDeleteLog}
        />
      )
    }
    if (state.page === 'add') {
      return (
        <PageAdd
          workouts={state.store.workouts}
          fields={state.store.fields}
          onBack={this.onReturnToFeed}
          onSave={this.onSaveLog}
        />
      )
    }
    if (state.page === 'feed') {
      return (
        <PageFeed
          onRefresh={this.onFetchStoreData}
          onOpenLog={this.onOpenLog}
          onAddLog={this.onAddLog}
          isLoading={state.isLoading}
          onLogout={this.onLogout}
          logs={state.store.logs}
          workouts={state.store.workouts}
          fields={state.store.fields}
        />
      )
    }
  }
}
