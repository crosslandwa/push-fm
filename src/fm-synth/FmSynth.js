import React from 'react'
import { connect } from 'react-redux'
import {
  env1Release, updateEnv1Release,
  modLevel, updateModLevel
} from './index'

const forEvent = action => event => action(event.target.value)

const mapStateToProps = state => ({
  env1Release: env1Release(state),
  modLevel: modLevel(state)
})

const FmSynth = ({ env1Release, modLevel, updateEnv1Release, updateModLevel }) => (
  <div class="fm-synth">
    <label for="modLevel">Mod level</label>
    <input type="range" id="modLevel" onChange={updateModLevel} min="0" max="1.0" step="0.001" value={modLevel} />
    <label for="modLevel">Env 1 release</label>
    <input type="range" id="modLevel" onChange={updateEnv1Release} min="0" max="1.0" step="0.001" value={env1Release} />
  </div>
)

export default connect(
  mapStateToProps,
  {
    updateEnv1Release: forEvent(updateEnv1Release),
    updateModLevel: forEvent(updateModLevel)
  }
)(FmSynth)
