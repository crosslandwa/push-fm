import React from 'react'
import { connect } from 'react-redux'
import {
  env1Attack, updateEnv1Attack,
  env1Decay, updateEnv1Decay,
  env1Release, updateEnv1Release,
  env1Sustain, updateEnv1Sustain,
  env2Attack, updateEnv2Attack,
  env2Decay, updateEnv2Decay,
  env2Release, updateEnv2Release,
  env2Sustain, updateEnv2Sustain,
  harmonicityLevel, updateHarmonicityLevel,
  modLevel, updateModLevel,
  modLevelEnv2Amount, updateModLevelEnv2Amount
} from './index'

const forEvent = action => event => action(event.target.value)

const mapStateToProps = state => ({
  env1Attack: env1Attack(state),
  env1Decay: env1Decay(state),
  env1Release: env1Release(state),
  env1Sustain: env1Sustain(state),
  env2Attack: env2Attack(state),
  env2Decay: env2Decay(state),
  env2Release: env2Release(state),
  env2Sustain: env2Sustain(state),
  harmonicityLevel: harmonicityLevel(state),
  modLevel: modLevel(state),
  modLevelEnv2Amount: modLevelEnv2Amount(state)
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
  env2Attack,
  env2Decay,
  env2Release,
  env2Sustain,
  modLevel,
  modLevelEnv2Amount,
  updateEnv1Attack,
  updateEnv1Decay,
  updateEnv1Release,
  updateEnv1Sustain,
  updateEnv2Attack,
  updateEnv2Decay,
  updateEnv2Release,
  updateEnv2Sustain,
  updateHarmonicityLevel,
  updateModLevel,
  updateModLevelEnv2Amount
}) => (
  <div class="fm-synth">
    <div>
      <Parameter label="Mod level" update={updateModLevel} value={modLevel} />
      <Parameter label="Env 2 amount" update={updateModLevelEnv2Amount} value={modLevelEnv2Amount} />
    </div>
    <div>
      <Parameter label="Harmonicity ratio" update={updateHarmonicityLevel} value={harmonicityLevel} />
    </div>
    <div>
      <Parameter label="Env 1 attack" update={updateEnv1Attack} value={env1Attack} />
      <Parameter label="Env 1 decay" update={updateEnv1Decay} value={env1Decay} />
      <Parameter label="Env 1 sustain" update={updateEnv1Sustain} value={env1Sustain} />
      <Parameter label="Env 1 release" update={updateEnv1Release} value={env1Release} />
    </div>
    <div>
      <Parameter label="Env 2 attack" update={updateEnv2Attack} value={env2Attack} />
      <Parameter label="Env 2 decay" update={updateEnv2Decay} value={env2Decay} />
      <Parameter label="Env 2 sustain" update={updateEnv2Sustain} value={env2Sustain} />
      <Parameter label="Env 2 release" update={updateEnv2Release} value={env2Release} />
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
    updateEnv2Attack: forEvent(updateEnv2Attack),
    updateEnv2Decay: forEvent(updateEnv2Decay),
    updateEnv2Release: forEvent(updateEnv2Release),
    updateEnv2Sustain: forEvent(updateEnv2Sustain),
    updateHarmonicityLevel: forEvent(updateHarmonicityLevel),
    updateModLevel: forEvent(updateModLevel),
    updateModLevelEnv2Amount: forEvent(updateModLevelEnv2Amount)
  }
)(FmSynth)
