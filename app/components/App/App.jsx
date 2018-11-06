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
import { getConfigAndLogs, getStoreAuthUrl, getStoreUser, isStoreConnected } from '../../store.js'

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
    if (!this.state.store.isConnected) {
      return <AuthButton authUrl={this.state.store.authUrl} />
    }
    if (this.state.page === 'log') {
      return (
        <div>
          <TopBar onClickMenu={this.onReturnToFeed} menuIcon="keyboard_backspace" title="Workout" />
          <main className="app-main">
            <div className="mdc-top-app-bar--fixed-adjust" />
            <Log log={this.state.pageData} />
            <Footer />
          </main>
        </div>
      )
    }
    if (this.state.page === 'add') {
      return (
        <div>
          <TopBar onClickMenu={this.onReturnToFeed} menuIcon="keyboard_backspace" title="Add workout" />
          <main className="app-main">
            <div className="mdc-top-app-bar--fixed-adjust" />
            <Add fields={this.state.store.fields} workouts={this.state.store.workouts} />
            <Footer />
          </main>
        </div>
      )
    }
    if (this.state.page === 'feed') {
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
            <Feed logs={state.store.logs} onOpenLog={this.onOpenLog} />
            <Footer />
            <FeedAddButton onClick={this.onOpenAdd} />
          </main>
        </div>
      )
    }
  }
}
