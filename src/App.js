import React from 'react'
import './app.css'
import FmSynth from './fm-synth/FmSynth'
import DOMPush from './push/DOMPush'

const App = () => (
  <>
    <h1>Push FM</h1>
    <FmSynth />
    <DOMPush />
  </>
)

export default App
