import React from 'react'
import { connect } from 'react-redux'
import './app.css'
import FmSynth from './fm-synth/FmSynth'
import DOMPush from './push/DOMPush'
import { activeGridSelect, activePads, gridPadPressed, gridSelectPressed } from './push'

const mapStateToProps = state => ({
  activeGridSelect: activeGridSelect(state),
  activePads: activePads(state)
})

const App = ({ activeGridSelect, activePads, gridPadPressed, gridSelectPressed }) => (
  <>
    <h1>Push FM</h1>
    <FmSynth />
    <DOMPush />
  </>
)

export default connect(mapStateToProps, { gridPadPressed, gridSelectPressed })(App)
