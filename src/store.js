import { createStore as createReduxStore, applyMiddleware, combineReducers, compose } from 'redux'
import { middleware as fmSynthMiddleware, reducer as fmSynth } from './fm-synth'
import { middleware as patchManagementMiddleware, reducer as patchManagement } from './patch-management'
import { initialisePush, middleware as pushMiddleware, reducer as push } from './push'
import { reducer as ui } from './ui'

const reducer = combineReducers({ fmSynth, patchManagement, push, ui })
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

function createStore () {
  const store = createReduxStore(
    reducer,
    composeEnhancers(
      applyMiddleware(...[patchManagementMiddleware, fmSynthMiddleware, pushMiddleware])
    )
  )
  store.dispatch(initialisePush())
  return store
}

export default createStore
