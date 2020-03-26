import { createStore as createReduxStore, applyMiddleware, combineReducers, compose } from 'redux'
import persistState from 'redux-localstorage'
import { initialiseSynth, createMiddleware as createFmSynthMiddleware, patchManagementReducer as patchManagement, reducer as fmSynth } from './fm-synth'
import { initialisePush, middleware as pushMiddleware, reducer as push, render } from './push'

const reducer = combineReducers({ fmSynth, patchManagement, push })
const naturalEnhancer = (createStore) => (...args) => createStore(...args)
const isBrowser = !!document.getElementById('app')
const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose
async function createStore (numberOfVoices = 6) {
  const store = createReduxStore(
    reducer,
    composeEnhancers(
      applyMiddleware(...[createFmSynthMiddleware(), pushMiddleware]),
      isBrowser ? persistState('patchManagement', { key: 'push-fm' }) : naturalEnhancer
    )
  )
  const push = await store.dispatch(initialisePush())
  store.subscribe(() => {
    render(push, store.getState())
  })
  store.dispatch(initialiseSynth(numberOfVoices))
  return store
}

export default createStore
