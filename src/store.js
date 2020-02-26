import { createStore as createReduxStore, applyMiddleware, combineReducers, compose } from 'redux'
import persistState from 'redux-localstorage'
import { middleware as fmSynthMiddleware } from './fm-synth'
import { reducer as ui } from './ui'

const reducer = combineReducers({ ui })
const naturalEnhancer = (createStore) => (...args) => createStore(...args)

const localStorageAvailable = !!(window && window.localStorage)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

function createStore () {
  return createReduxStore(
    reducer,
    composeEnhancers(
      applyMiddleware(...[fmSynthMiddleware]),
      localStorageAvailable ? persistState() : naturalEnhancer
    )
  )
}

export default createStore
