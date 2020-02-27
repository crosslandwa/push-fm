import React from 'react'
import { connect } from 'react-redux'
import './app.css'
import { playNote } from './fm-synth'
import { isPlaying } from './ui'

const mapStateToProps = state => ({
  isPlaying: isPlaying(state) ? 'Playing' : 'Stopped'
})

const App = ({ isPlaying, playNote }) => (
  <>
    <h1>Push FM</h1>
    <div>
      <span>{isPlaying}</span>
    </div>
    <button onClick={() => playNote(48, 100)}>Play note</button>
    <button onClick={() => playNote(50, 100)}>Play note</button>
    <button onClick={() => playNote(52, 100)}>Play note</button>
    <button onClick={() => playNote(53, 100)}>Play note</button>
    <button onClick={() => playNote(55, 100)}>Play note</button>
    <button onClick={() => playNote(57, 100)}>Play note</button>
    <button onClick={() => playNote(59, 100)}>Play note</button>
    <button onClick={() => playNote(60, 100)}>Play note</button>
  </>
)

export default connect(mapStateToProps, { playNote })(App)
