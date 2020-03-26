import React from 'react'
import { connect } from 'react-redux'
import {
  env1Attack, updateEnv1Attack,
  env1Decay, updateEnv1Decay,
  env1Release, updateEnv1Release,
  env1Sustain, updateEnv1Sustain,
  harmonicityLevel, updateHarmonicityLevel,
  modLevel, updateModLevel
} from './index'

const forEvent = action => event => action(event.target.value)

const mapStateToProps = state => ({
  env1Attack: env1Attack(state),
  env1Decay: env1Decay(state),
  env1Release: env1Release(state),
  env1Sustain: env1Sustain(state),
  harmonicityLevel: harmonicityLevel(state),
  modLevel: modLevel(state)
})

const idFrom = label => label.toLowerCase().replace(/\s+/g, '-')
const Parameter = ({ label, id = idFrom(label), update, value }) => (
  <div class="synth-control">
    <label class="synth-control__label" for={id}>{label}</label>
    <input type="range" id={id} onChange={update} min="0" max="1.0" step="0.001" value={value} />
  </div>
)

const FmSynth = ({
  harmonicityLevel,
  env1Attack,
  env1Decay,
  env1Release,
  env1Sustain,
  modLevel,
  updateEnv1Attack,
  updateEnv1Decay,
  updateEnv1Release,
  updateEnv1Sustain,
  updateHarmonicityLevel,
  updateModLevel
}) => (
  <div class="fm-synth">
    <Parameter label="Mod level" update={updateModLevel} value={modLevel} />
    <Parameter label="Harmonicity ratio" update={updateHarmonicityLevel} value={harmonicityLevel} />
    <div>
      <Parameter label="Env 1 attack" update={updateEnv1Attack} value={env1Attack} />
      <Parameter label="Env 1 decay" update={updateEnv1Decay} value={env1Decay} />
      <Parameter label="Env 1 sustain" update={updateEnv1Sustain} value={env1Sustain} />
      <Parameter label="Env 1 release" update={updateEnv1Release} value={env1Release} />
    </div>
  </div>
)

export default connect(
  mapStateToProps,
  {
    updateEnv1Attack: forEvent(updateEnv1Attack),
    updateEnv1Decay: forEvent(updateEnv1Decay),
    updateEnv1Release: forEvent(updateEnv1Release),
    updateEnv1Sustain: forEvent(updateEnv1Sustain),
    updateHarmonicityLevel: forEvent(updateHarmonicityLevel),
    updateModLevel: forEvent(updateModLevel)
  }
)(FmSynth)
