// ---------- ACTIONS ----------
export const loadPatch = patchNumber => ({ type: 'FM_SYNTH_LOAD_PATCH', patchNumber })
const noteOn = (noteNumber, velocity) => ({ type: 'FM_SYNTH_NOTE_ON', noteNumber, velocity })
const noteOff = (noteNumber) => ({ type: 'FM_SYNTH_NOTE_OFF', noteNumber })
export const playNote = (noteNumber, velocity) => ({ type: 'FM_SYNTH_PLAY_NOTE', noteNumber, velocity, autoRelease: false })
export const playNoteAndRelease = (noteNumber, velocity) => ({ type: 'FM_SYNTH_PLAY_NOTE', noteNumber, velocity, autoRelease: true })
export const releaseNote = noteNumber => ({ type: 'FM_SYNTH_RELEASE_NOTE', noteNumber })
export const savePatch = patchNumber => ({ type: 'FM_SYNTH_SAVE_PATCH', patchNumber })
export const updateEnv1Attack = level => updateParam('env1Attack', level)
export const updateEnv1Release = level => updateParam('env1Release', level)
export const updateModLevel = level => updateParam('modLevel', level)
const updateParam = (param, level) => ({ type: 'FM_SYNTH_UPDATE_PARAM', param, level: parseFloat(level) })

// ---------- SELECTOR ----------
export const activeNotes = state => state.fmSynth.activeNotes
const currentPatch = state => state.fmSynth.patch
export const currentPatchNumber = (state) => patchManagement(state).currentPatchNumber
export const env1Attack = state => currentPatch(state).env1Attack
export const env1Release = state => currentPatch(state).env1Release
export const modLevel = state => currentPatch(state).modLevel
const patchManagement = state => state.patchManagement
const savedPatch = (state, number) => patchManagement(state).patches[number]

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
  patch: { modLevel: 0, env1Attack: 0.0025, env1Release: 0.0625 }
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FM_SYNTH_LOAD_PATCH':
      return {
        ...state,
        patch: { ...initialState.patch, ...(action.patch || {}) }
      }
    case 'FM_SYNTH_NOTE_OFF':
      return {
        ...state,
        activeNotes: state.activeNotes.filter(x => x.noteNumber !== action.noteNumber)
      }
    case 'FM_SYNTH_NOTE_ON':
      return {
        ...state,
        activeNotes: state.activeNotes.concat({ noteNumber: action.noteNumber, velocity: action.velocity })
      }
    case 'FM_SYNTH_UPDATE_PARAM':
      return {
        ...state,
        patch: { ...state.patch, [action.param]: action.level }
      }
  }
  return state
}

// ---------- MIDDLEWARE ----------
let synth

export const middleware = ({ dispatch, getState }) => next => async (action) => {
  switch (action.type) {
    case 'FM_SYNTH_PLAY_NOTE':
      if (!synth) {
        synth = intialiseSynth()
      }
      next(noteOn(action.noteNumber, action.velocity))
      synth.modulate('carrierFrequency', midiNoteToF(action.noteNumber))
      synth.modulate('modulationIndex', Math.pow(modLevel(getState()), 3) * 500)
      synth.vca(
        action.velocity / 127,
        Math.max(0.005, env1Attack(getState()) * 8), // 5ms min
        action.autoRelease
          ? () => dispatch(releaseNote(action.noteNumber))
          : () => {}
      )
      return
    case 'FM_SYNTH_RELEASE_NOTE':
      return new Promise(resolve => synth.vca(
        0,
        Math.max(0.005, env1Release(getState()) * 8), // 5ms min
        resolve
      )).then(() => next(noteOff(action.noteNumber)))
    case 'FM_SYNTH_LOAD_PATCH':
      action.patch = savedPatch(getState(), action.patchNumber)
      return next(action)
    case 'FM_SYNTH_SAVE_PATCH':
      action.patch = currentPatch(getState())
      return next(action)
  }
  return next(action)
}

// ---------- FM SYNTH ----------
function intialiseSynth () {
  const context = (window.AudioContext || window.webkitAudioContext) && new (window.AudioContext || window.webkitAudioContext)()
  if (!context) {
    return {
      modulate: (param, target, time) => {},
      vca: (target, time, onComplete) => {
        onComplete && setTimeout(onComplete, time * 1000)
      }
    }
  }
  const { audioParam, multiply, now, oscillator, scheduleAt } = operatorFactory(context)

  const carrierAmplitude = audioParam(0)
  const carrierFrequency = audioParam(0)
  const harmonicityRatio = audioParam(0.99) // TODO control via UI
  const modulationIndex = audioParam(0)

  const carrierFrequencyTimesHarmonicityRatio = multiply(carrierFrequency, harmonicityRatio)
  const modulatorOsc = multiply(
    oscillator([carrierFrequencyTimesHarmonicityRatio]),
    multiply(carrierFrequencyTimesHarmonicityRatio, modulationIndex)
  )

  const carrierOsc = oscillator([carrierFrequency, modulatorOsc])
  const output = multiply(carrierOsc, carrierAmplitude)

  output.connect(context.destination)

  const modulatables = { carrierFrequency, harmonicityRatio, modulationIndex }

  return {
    modulate: (param, target, time) => {
      if (!modulatables[param]) return
      const initialTime = now()
      const totalEnvelopeTime = initialTime + (time || 0)
      modulatables[param].holdAtCurrentValue()
      modulatables[param].rampToValueAtTime(target, totalEnvelopeTime)
    },
    vca: (target, time, onComplete) => {
      const initialTime = now()
      const totalEnvelopeTime = initialTime + time
      carrierAmplitude.holdAtCurrentValue()
      carrierAmplitude.rampToValueAtTime(target, totalEnvelopeTime)
      onComplete && scheduleAt(onComplete, totalEnvelopeTime)
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
    let source = audioContext.createBufferSource()
    let numberOfSamplesInOneMs = audioContext.sampleRate / 1000
    // a buffer length of 1 sample doesn't work on IOS, so use 1/1000th of a second
    let oneMsBuffer = audioContext.createBuffer(1, numberOfSamplesInOneMs, audioContext.sampleRate)
    source.addEventListener('ended', callback)
    source.buffer = oneMsBuffer
    source.connect(audioContext.destination)
    source.start(when)

    return function cancel () {
      source.removeEventListener('ended', callback)
      source.stop()
    }
  }
  return { oscillator, audioParam, multiply, now, scheduleAt }
}
