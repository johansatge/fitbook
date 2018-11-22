/* global Promise */

import { h, Component } from 'preact'
import Drawer from '../Drawer/Drawer.jsx'
import Add from '../Add/Add.jsx'
import Log from '../Log/Log.jsx'
import Feed from '../Feed/Feed.jsx'
import FeedAddButton from '../FeedAddButton/FeedAddButton.jsx'
import Footer from '../Footer/Footer.jsx'
import AuthButton from '../AuthButton/AuthButton.jsx'
import TopBar from '../TopBar/TopBar.jsx'
import { getConfigAndLogs, getStoreAuthUrl, getStoreUser, isStoreConnected, saveLog } from '../../store.js'

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      isDrawerVisible: false,
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
    this.onOpenDrawer = this.onOpenDrawer.bind(this)
    this.onCloseDrawer = this.onCloseDrawer.bind(this)
    this.onFetchStoreData = this.onFetchStoreData.bind(this)
    this.onOpenAdd = this.onOpenAdd.bind(this)
    this.onOpenLog = this.onOpenLog.bind(this)
    this.onReturnToFeed = this.onReturnToFeed.bind(this)
    this.onAddSave = this.onAddSave.bind(this)
    this.onAddUpdate = this.onAddUpdate.bind(this)
    if (this.state.store.isConnected) {
      this.onFetchStoreData()
    }
  }

  onOpenLog(log) {
    this.setState({ ...this.state, page: 'log', pageData: log })
  }

  onOpenAdd() {
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

  onAddUpdate(workoutType, fields) {
    this.setState({ ...this.state, pageData: { workout: workoutType, fields: { ...fields } } })
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

  onOpenDrawer() {
    this.setState({ ...this.state, isDrawerVisible: true })
  }

  onCloseDrawer() {
    this.setState({ ...this.state, isDrawerVisible: false })
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render(props, state) {
    console.log('App', state)
    if (!state.store.isConnected) {
      return <AuthButton authUrl={state.store.authUrl} />
    }
    if (state.page === 'log') {
      return (
        <div>
          <TopBar onClickMenu={this.onReturnToFeed} menuIcon="keyboard_backspace" title="Workout" />
          <main className="app-main">
            <div className="mdc-top-app-bar--fixed-adjust" />
            <Log log={state.pageData} workouts={state.store.workouts} fields={state.store.fields} />
            <Footer />
          </main>
        </div>
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
        <div>
          <Drawer onClickItem={this.onCloseDrawer} onClose={this.onCloseDrawer} isVisible={state.isDrawerVisible} />
          <div className="mdc-drawer-scrim" />
          <TopBar
            onClickMenu={this.onOpenDrawer}
            menuIcon="menu"
            title="Feed"
            onClickRefresh={this.onFetchStoreData}
            isLoading={state.isLoading}
          />
          <main className="app-main">
            <div className="mdc-top-app-bar--fixed-adjust" />
            <Feed
              logs={state.store.logs}
              workouts={state.store.workouts}
              fields={state.store.fields}
              onOpenLog={this.onOpenLog}
            />
            <Footer />
            {!state.isLoading ? <FeedAddButton onClick={this.onOpenAdd} /> : null}
          </main>
        </div>
      )
    }
  }
}
