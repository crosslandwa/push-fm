// ---------- ACTIONS ----------
const changeParamBy = (param, delta) => ({ type: 'FM_SYNTH_CHANGE_PARAM_BY', param, delta: parseFloat(delta) })
export const changeHarmonicityLevelBy = delta => changeParamBy('harmonicityLevel', delta)
export const changeModLevelBy = delta => changeParamBy('modLevel', delta)
export const initialiseSynth = numberOfVoices => ({ type: 'FM_SYNTH_INITIALISE', numberOfVoices })
export const loadPatch = patchNumber => ({ type: 'FM_SYNTH_LOAD_PATCH', patchNumber })
const noteOff = voice => ({ type: 'FM_SYNTH_NOTE_OFF', voice })
const noteOn = (noteNumber, velocity, voice) => ({ type: 'FM_SYNTH_NOTE_ON', noteNumber, velocity, voice })
export const playNote = (noteNumber, velocity) => ({ type: 'FM_SYNTH_PLAY_NOTE', noteNumber, velocity, autoRelease: false })
export const playNoteAndRelease = (noteNumber, velocity) => ({ type: 'FM_SYNTH_PLAY_NOTE', noteNumber, velocity, autoRelease: true })
export const reapplyPatchModifications = () => ({ type: 'FM_SYNTH_REAPPLY_PATCH_MODIFICATIONS' })
export const releaseNote = noteNumber => ({ type: 'FM_SYNTH_RELEASE_NOTE', noteNumber })
export const revertPatchModifications = () => ({ type: 'FM_SYNTH_REVERT_PATCH_MODIFICATIONS' })
export const savePatch = patchNumber => ({ type: 'FM_SYNTH_SAVE_PATCH', patchNumber })
export const updateEnv1Attack = level => updateParam('env1Attack', level)
export const updateEnv1Decay = level => updateParam('env1Decay', level)
export const updateEnv1Release = level => updateParam('env1Release', level)
export const updateEnv1Sustain = level => updateParam('env1Sustain', level)
export const updateEnv2Attack = level => updateParam('env2Attack', level)
export const updateEnv2Decay = level => updateParam('env2Decay', level)
export const updateEnv2Release = level => updateParam('env2Release', level)
export const updateEnv2Sustain = level => updateParam('env2Sustain', level)
export const updateHarmonicityLevel = level => updateParam('harmonicityLevel', level)
export const updateHarmonicityLevelEnv2Amount = level => updateParam('harmonicityLevelEnv2Amount', level)
export const updateModLevel = level => updateParam('modLevel', level)
export const updateModLevelEnv2Amount = level => updateParam('modLevelEnv2Amount', level)
const updateParam = (param, level) => ({ type: 'FM_SYNTH_UPDATE_PARAM', param, level: parseFloat(level) })

// ---------- SELECTOR ----------
const activeNotes = state => fmSynth(state).activeNotes
export const currentActiveNoteNumbers = state => activeNotes(state).map(({ noteNumber }) => noteNumber)
const currentPatch = state => fmSynth(state).patch
export const currentPatchNumber = (state) => patchManagement(state).currentPatchNumber
export const currentPatchHasModifiedVersion = (state) => !!modifiedPatch(state)
export const currentPatchIsModified = (state) => fmSynth(state).patchHasEdits
export const env1Attack = state => currentPatch(state).env1Attack
export const env1Decay = state => currentPatch(state).env1Decay
export const env1Release = state => currentPatch(state).env1Release
export const env1Sustain = state => currentPatch(state).env1Sustain
export const env2Attack = state => currentPatch(state).env2Attack
export const env2Decay = state => currentPatch(state).env2Decay
export const env2Release = state => currentPatch(state).env2Release
export const env2Sustain = state => currentPatch(state).env2Sustain
const fmSynth = state => state.fmSynth
const modifiedPatch = state => fmSynth(state).modifiedPatch
export const modLevel = state => currentPatch(state).modLevel
export const modLevelEnv2Amount = state => currentPatch(state).modLevelEnv2Amount
export const numberOfVoices = state => fmSynth(state).numberOfVoices
export const harmonicityLevel = state => currentPatch(state).harmonicityLevel
export const harmonicityLevelEnv2Amount = state => currentPatch(state).harmonicityLevelEnv2Amount
const patchManagement = state => state.patchManagement
const savedPatch = (state, number) => patchManagement(state).patches[number]
const voiceForNoteNumber = (state, noteNumber) => {
  const activeNote = activeNotes(state).find(({ noteNumber: n }) => n === noteNumber)
  return activeNote && activeNote.voice
}
const voiceToUseForNewNote = (state, noteNumber) => {
  const alreadyActiveVoice = voiceForNoteNumber(state, noteNumber)
  if (alreadyActiveVoice >= 0) {
    return alreadyActiveVoice
  }
  const currentNotes = activeNotes(state)
  if (currentNotes.length === numberOfVoices(state)) {
    return currentNotes[0].voice // steal from oldest
  }
  const activeVoices = currentNotes.map(({ voice }) => voice)
  const firstAvailableVoice = [...new Array(numberOfVoices(state)).keys()].find(voice => !activeVoices.includes(voice))
  return firstAvailableVoice
}

// ---------- PATCH MANAGEMENT REDUCER ----------
export const patchManagementReducer = (state = { currentPatchNumber: 1, patches: {} }, action) => {
  switch (action.type) {
    case 'FM_SYNTH_LOAD_PATCH':
      return { ...state, currentPatchNumber: action.patchNumber }
    case 'FM_SYNTH_SAVE_PATCH':
      return {
        ...state,
        currentPatchNumber: action.patchNumber,
        patches: {
          ...state.patches,
          [action.patchNumber]: action.patch
        }
      }
  }
  return state
}

// ---------- REDUCER ----------
const initialState = {
  activeNotes: [],
  modifiedPatch: undefined,
  numberOfVoices: 1,
  patchHasEdits: false,
  patch: {
    harmonicityLevel: 0.2,
    harmonicityLevelEnv2Amount: 0.5, // -1 => 1, default to 0
    modLevel: 0,
    modLevelEnv2Amount: 0.5, // -1 => 1, default to 0
    env1Attack: 0, // ~ 5ms
    env1Decay: 0, // ~ 5ms
    env1Sustain: 1,
    env1Release: 0.4, // ~ 350ms
    env2Attack: 0.5,
    env2Decay: 0.5,
    env2Sustain: 0.5,
    env2Release: 0.5
  }
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FM_SYNTH_CHANGE_PARAM_BY':
      return {
        ...state,
        patchHasEdits: true,
        patch: { ...state.patch, [action.param]: Math.max(0, Math.min(1, action.delta + state.patch[[action.param]])) }
      }
    case 'FM_SYNTH_INITIALISE':
      return { ...state, numberOfVoices: action.numberOfVoices }
    case 'FM_SYNTH_NOTE_OFF':
      return {
        ...state,
        activeNotes: state.activeNotes.filter(x => x.voice !== action.voice)
      }
    case 'FM_SYNTH_NOTE_ON':
      return {
        ...state,
        activeNotes: state.activeNotes.concat({ noteNumber: action.noteNumber, velocity: action.velocity, voice: action.voice })
      }
    case 'FM_SYNTH_UPDATE_PARAM':
      return {
        ...state,
        patchHasEdits: true,
        patch: { ...state.patch, [action.param]: action.level }
      }
    case 'FM_SYNTH_LOAD_PATCH':
      return {
        ...state,
        patchHasEdits: false,
        modifiedPatch: undefined,
        patch: { ...initialState.patch, ...(action.patch || {}) }
      }
    case 'FM_SYNTH_REVERT_PATCH_MODIFICATIONS':
      return {
        ...state,
        patchHasEdits: false,
        modifiedPatch: action.modifiedPatch,
        patch: { ...initialState.patch, ...(action.patch || {}) }
      }
    case 'FM_SYNTH_REAPPLY_PATCH_MODIFICATIONS':
      return {
        ...state,
        patchHasEdits: true,
        modifiedPatch: undefined,
        patch: { ...initialState.patch, ...(action.patch || {}) }
      }
    case 'FM_SYNTH_SAVE_PATCH':
      return {
        ...state,
        patchHasEdits: false,
        modifiedPatch: undefined
      }
  }
  return state
}

// ---------- MIDDLEWARE ----------
const compose = (...funcs) => x => funcs.slice().reverse().reduce((acc, f) => f(acc), x)
const scaleLinearly = (min, max) => x => x * (max - min) + min
const exponentialScale = (factor) => x => (1 - Math.exp(-1 * factor * x)) / (1 - Math.exp(-1 * factor))

// maps to 5ms min, ~8s max
// scaled such that 0.125 => ~0.05, 0.25 => ~0.14, 0.5 => ~0.61, 0.75 => ~2.25
const mapToEnvelopeSectionTime = compose(scaleLinearly(0.005, 8), exponentialScale(-5))

export const createMiddleware = () => {
  let synth
  const middleware = ({ dispatch, getState }) => next => async (action) => {
    switch (action.type) {
      case 'FM_SYNTH_INITIALISE':
        next(action)
        dispatch(loadPatch(1))
        return
      case 'FM_SYNTH_UPDATE_PARAM':
      case 'FM_SYNTH_CHANGE_PARAM_BY': {
        next(action)
        synth = synth || createSynth(numberOfVoices(getState()))
        const { mapping, target } = paramMapper(action.param) || {}
        if (mapping) {
          synth.forEach(voice => voice[target](mapping(getState()), 0.1))
        }
        return
      }
      case 'FM_SYNTH_PLAY_NOTE': {
        synth = synth || createSynth(numberOfVoices(getState()))
        const voiceNumber = voiceToUseForNewNote(getState(), action.noteNumber)
        next(noteOff(voiceNumber))
        next(noteOn(action.noteNumber, action.velocity, voiceNumber))
        synth[voiceNumber].modulateCarrierFrequency(midiNoteToF(action.noteNumber), 0);
        ['harmonicityLevel', 'modLevel', 'modLevelEnv2Amount'].forEach(param => {
          const { mapping, target } = paramMapper(param)
          synth[voiceNumber][target](mapping(getState()), 0)
        })
        synth[voiceNumber].vca(
          [
            [action.velocity / 127, mapToEnvelopeSectionTime(env1Attack(getState()))],
            [(action.velocity / 127) * env1Sustain(getState()), mapToEnvelopeSectionTime(env1Decay(getState()))]
          ],
          action.autoRelease
            ? () => dispatch(releaseNote(action.noteNumber))
            : () => {}
        )
        synth[voiceNumber].vca2([
          [0, 0],
          [1, mapToEnvelopeSectionTime(env2Attack(getState()))],
          [env2Sustain(getState()), mapToEnvelopeSectionTime(env2Decay(getState()))]
        ])
        return
      }
      case 'FM_SYNTH_RELEASE_NOTE': {
        const voiceToTurnOff = voiceForNoteNumber(getState(), action.noteNumber)
        if (voiceToTurnOff >= 0) {
          synth[voiceToTurnOff].vca(
            [
              [0, mapToEnvelopeSectionTime(env1Release(getState()))]
            ],
            () => next(noteOff(voiceToTurnOff))
          )
          synth[voiceToTurnOff].vca2([
            [0, mapToEnvelopeSectionTime(env2Release(getState()))]
          ])
        }
        return
      }
      case 'FM_SYNTH_LOAD_PATCH':
        action.patch = savedPatch(getState(), action.patchNumber)
        return next(action)
      case 'FM_SYNTH_REVERT_PATCH_MODIFICATIONS':
        action.modifiedPatch = currentPatch(getState())
        action.patch = savedPatch(getState(), currentPatchNumber(getState()))
        next(action)
        return
      case 'FM_SYNTH_REAPPLY_PATCH_MODIFICATIONS':
        action.patch = modifiedPatch(getState())
        next(action)
        return
      case 'FM_SYNTH_SAVE_PATCH':
        action.patch = currentPatch(getState())
        return next(action)
    }
    return next(action)
  }
  return middleware
}

const paramMapper = (name) => {
  return {
    harmonicityLevel: { mapping: state => harmonicityLevel(state) * 3.75 + 0.25, target: 'modulateHarmonicityRatio' },
    harmonicityLevelEnv2Amount: { mapping: state => (harmonicityLevelEnv2Amount(state) * 2) - 1, target: 'modulateHarmonicityRatioEnv2Amount' },
    modLevel: { mapping: (state) => Math.pow(modLevel(state), 3) * 500, target: 'modulateModulationIndex' },
    modLevelEnv2Amount: { mapping: state => (modLevelEnv2Amount(state) * 2) - 1, target: 'modulateModulationIndexEnv2Amount' }
  }[name]
}

// ---------- FM SYNTH ----------
function createSynth (numberOfVoices) {
  const context = (window.AudioContext || window.webkitAudioContext) && new (window.AudioContext || window.webkitAudioContext)()
  return [...new Array(numberOfVoices).keys()].map(() => createSynthVoice(context))
}

function createSynthVoice (context) {
  const cancelables = []

  const cancelOnVcaChangeComplete = () => {
    cancelables.forEach(cancel => cancel())
    cancelables.length = 0
  }

  if (!context) {
    return {
      modulateCarrierFrequency: (target, time) => {},
      modulateHarmonicityRatio: (target, time) => {},
      modulateHarmonicityRatioEnv2Amount: (target, time) => {},
      modulateModulationIndex: (target, time) => {},
      modulateModulationIndexEnv2Amount: (target, time) => {},
      vca: (envelopeSegments, onComplete) => {
        cancelOnVcaChangeComplete()
        const totalTime = envelopeSegments.reduce(
          (acc, [target, time]) => acc + time,
          0
        )
        const handle = onComplete && setTimeout(onComplete, totalTime * 1000)
        cancelables.push(handle ? () => clearTimeout(handle) : () => {})
      },
      vca2: (envelopeSegments) => {}
    }
  }
  const { audioParam, multiply, now, oscillator, scheduleAt, sum } = operatorFactory(context)

  const carrierAmplitude = audioParam(0)
  const carrierFrequency = audioParam(0)
  const harmonicityRatio = audioParam(1)
  const harmonicityRatioEnv2Amount = audioParam(0)
  const modulationIndex = audioParam(0)
  const envelope2 = audioParam(0)
  const modulationIndexEnv2Amount = audioParam(0)

  const envelopedModulationIndex = multiply(modulationIndexEnv2Amount, multiply(envelope2, modulationIndex))
  const envelopedHarmonicityRatio = multiply(harmonicityRatioEnv2Amount, multiply(envelope2, harmonicityRatio))
  const carrierFrequencyTimesHarmonicityRatio = multiply(carrierFrequency, sum(harmonicityRatio, envelopedHarmonicityRatio))
  const modulatorOsc = multiply(
    oscillator([carrierFrequencyTimesHarmonicityRatio]),
    multiply(carrierFrequencyTimesHarmonicityRatio, sum(modulationIndex, envelopedModulationIndex))
  )

  const carrierOsc = oscillator([carrierFrequency, modulatorOsc])
  const output = multiply(carrierOsc, carrierAmplitude)

  output.connect(context.destination)

  const modulate = (param) => (target, time) => {
    const initialTime = now()
    const totalEnvelopeTime = initialTime + time
    param.holdAtCurrentValue()
    param.rampToValueAtTime(target, totalEnvelopeTime)
  }

  return {
    modulateCarrierFrequency: modulate(carrierFrequency),
    modulateHarmonicityRatio: modulate(harmonicityRatio),
    modulateHarmonicityRatioEnv2Amount: modulate(harmonicityRatioEnv2Amount),
    modulateModulationIndex: modulate(modulationIndex),
    modulateModulationIndexEnv2Amount: modulate(modulationIndexEnv2Amount),
    vca: (envelopeSegments, onComplete) => {
      cancelOnVcaChangeComplete()
      const initialTime = now()
      carrierAmplitude.holdAtCurrentValue()
      const totalEnvelopeTime = envelopeSegments.reduce(
        (totalTime, [target, time]) => {
          const endTime = totalTime + time
          carrierAmplitude.rampToValueAtTime(target, endTime)
          return endTime
        },
        initialTime
      )
      cancelables.push(onComplete
        ? scheduleAt(onComplete, totalEnvelopeTime)
        : () => {}
      )
    },
    vca2: (envelopeSegments) => {
      const initialTime = now()
      envelope2.holdAtCurrentValue()
      envelopeSegments.reduce(
        (totalTime, [target, time]) => {
          const endTime = totalTime + time
          envelope2.rampToValueAtTime(target, endTime)
          return endTime
        },
        initialTime
      )
    }
  }
}

const midiNoteToF = note => 440.0 * Math.pow(2, (note - 69.0) / 12.0)

const operatorFactory = audioContext => {
  function oscillator (frequencyModulators = []) {
    const osc = audioContext.createOscillator()
    osc.frequency.setValueAtTime(0, 0)
    frequencyModulators.forEach(({ connect: connectModulatorTo }) => connectModulatorTo(osc.frequency))
    osc.start()
    return {
      connect: destination => osc.connect(destination)
    }
  }

  function audioParam (initialValue = 0) {
    const node = audioContext.createGain()
    const source = audioContext.createConstantSource()
    source.start()
    node.gain.setValueAtTime(initialValue, 0)
    source.connect(node)
    return {
      connect: destination => node.connect(destination),
      holdAtCurrentValue: () => node.gain.cancelScheduledValues(0),
      rampToValueAtTime: (value, time) => node.gain.linearRampToValueAtTime(value, time)
    }
  }

  function multiply ({ connect: connectA }, { connect: connectB }) {
    const node = audioContext.createGain()
    node.gain.setValueAtTime(0, 0)
    connectA(node)
    connectB(node.gain)
    return {
      connect: destination => node.connect(destination)
    }
  }

  function sum (...signals) {
    const node = audioContext.createGain()
    node.gain.setValueAtTime(1, 0)
    signals.forEach(signal => signal.connect(node))
    return {
      connect: destination => node.connect(destination)
    }
  }

  /**
   * @returns {number} the current time in seconds
   */
  function now () {
    return audioContext.currentTime
  }

  /**
   * @param {function} callback the scheduled callback
   * @param {number} when the absolute time (in seconds) when the callback will be called
   * @returns {function} a function that when called will cancel the scheduled callback
   */
  function scheduleAt (callback, when) {
    const source = audioContext.createBufferSource()
    const numberOfSamplesInOneMs = audioContext.sampleRate / 1000
    // a buffer length of 1 sample doesn't work on IOS, so use 1/1000th of a second
    const oneMsBuffer = audioContext.createBuffer(1, numberOfSamplesInOneMs, audioContext.sampleRate)
    source.addEventListener('ended', callback)
    source.buffer = oneMsBuffer
    source.connect(audioContext.destination)
    source.start(when)

    return function cancel () {
      source.removeEventListener('ended', callback)
      source.stop()
    }
  }
  return { oscillator, audioParam, multiply, now, scheduleAt, sum }
}
