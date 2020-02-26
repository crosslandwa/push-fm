import React from 'react'
import { connect } from 'react-redux'
import './app.css'
import { playNote } from './fm-synth'
import { isPlaying } from './ui'

const mapStateToProps = state => ({
  isPlaying: isPlaying(state)
})

const App = ({ isPlaying, playNote }) => (
  <>
    <h1>Push FM</h1>
    <button onClick={() => playNote(60, 100)}>Play note</button>
    {isPlaying ? <span>Playing</span> : <span>Stopped</span>}
  </>
)

export default connect(mapStateToProps, { playNote })(App)
