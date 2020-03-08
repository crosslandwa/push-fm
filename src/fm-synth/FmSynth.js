import React from 'react'
import { connect } from 'react-redux'
import {
  env1Attack, updateEnv1Attack,
  env1Release, updateEnv1Release,
  modLevel, updateModLevel
} from './index'

const forEvent = action => event => action(event.target.value)

const mapStateToProps = state => ({
  env1Attack: env1Attack(state),
  env1Release: env1Release(state),
  modLevel: modLevel(state)
})

const idFrom = label => label.toLowerCase().replace(/\s+/g, '-')
const Parameter = ({ label, id = idFrom(label), update, value }) => (
  <>
    <label for={id}>{label}</label>
    <input type="range" id={id} onChange={update} min="0" max="1.0" step="0.001" value={value} />
  </>
)

const FmSynth = ({ env1Attack, env1Release, modLevel, updateEnv1Attack, updateEnv1Release, updateModLevel }) => (
  <div class="fm-synth">
    <Parameter label="Mod level" update={updateModLevel} value={modLevel} />
    <Parameter label="Env 1 attack" update={updateEnv1Attack} value={env1Attack} />
    <Parameter label="Env 1 release" update={updateEnv1Release} value={env1Release} />
  </div>
)

export default connect(
  mapStateToProps,
  {
    updateEnv1Attack: forEvent(updateEnv1Attack),
    updateEnv1Release: forEvent(updateEnv1Release),
    updateModLevel: forEvent(updateModLevel)
  }
)(FmSynth)
