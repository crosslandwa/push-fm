import React from 'react'
import { connect } from 'react-redux'
import { modLevel, updateModLevel } from './index'

const forEvent = action => event => action(event.target.value)

const mapStateToProps = state => ({
  modLevel: modLevel(state)
})

const FmSynth = ({ modLevel, updateModLevel }) => (
  <div class="fm-synth">
    <label for="modLevel">Mod level</label>
    <input type="range" id="modLevel" onChange={updateModLevel} min="0" max="1.0" step="0.001" value={modLevel} />
  </div>
)

export default connect(mapStateToProps, { updateModLevel: forEvent(updateModLevel) })(FmSynth)
