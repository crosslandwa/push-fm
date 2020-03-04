import { createStore as createReduxStore, applyMiddleware, combineReducers, compose } from 'redux'
import { middleware as fmSynthMiddleware } from './fm-synth'
import { initialisePush, middleware as pushMiddleware } from './push'
import { reducer as ui } from './ui'

const reducer = combineReducers({ ui })
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

function createStore () {
  const store = createReduxStore(
    reducer,
    composeEnhancers(
      applyMiddleware(...[fmSynthMiddleware, pushMiddleware])
    )
  )
  store.dispatch(initialisePush())
  return store
}

export default createStore
