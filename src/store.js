import { createStore as createReduxStore, applyMiddleware, combineReducers, compose } from 'redux'
import persistState from 'redux-localstorage'
import { middleware as fmSynthMiddleware, reducer as fmSynth } from './fm-synth'
import { loadPatch, middleware as patchManagementMiddleware, reducer as patchManagement } from './patch-management'
import { initialisePush, middleware as pushMiddleware, reducer as push } from './push'
import { reducer as ui } from './ui'

const reducer = combineReducers({ fmSynth, patchManagement, push, ui })
const naturalEnhancer = (createStore) => (...args) => createStore(...args)
const isBrowser = !!document.getElementById('app')
const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose
function createStore () {
  const store = createReduxStore(
    reducer,
    composeEnhancers(
      applyMiddleware(...[patchManagementMiddleware, fmSynthMiddleware, pushMiddleware]),
      isBrowser ? persistState('patchManagement', { key: 'push-fm' }) : naturalEnhancer
    )
  )
  store.dispatch(initialisePush())
  store.dispatch(loadPatch(1))
  return store
}

export default createStore
