// ---------- ACTIONS ----------
export const ACTION__FM_SYNTH_NOTE_ON = {
  type: 'FM_SYNTH_NOTE_ON',
  noteNumber: action => action.noteNumber
}
export const ACTION__FM_SYNTH_NOTE_OFF = {
  type: 'FM_SYNTH_NOTE_OFF',
  noteNumber: action => action.noteNumber
}

export const noteOn = (noteNumber) => ({ type: ACTION__FM_SYNTH_NOTE_ON.type, noteNumber })
export const noteOff = (noteNumber) => ({ type: ACTION__FM_SYNTH_NOTE_OFF.type, noteNumber })
export const playNote = (noteNumber, velocity) => ({ type: 'FM_SYNTH_PLAY_NOTE', noteNumber, velocity })
export const updateModLevel = level => ({ type: 'FM_SYNTH_MOD_LEVEL', level: parseFloat(level) })

// ---------- SELECTOR ----------
export const modLevel = state => state.fmSynth.modLevel

// ---------- REDUCER ----------
const initialState = { modLevel: 0 }

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FM_SYNTH_MOD_LEVEL':
      return { ...state, modLevel: action.level }
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
      synth(
        () => next(noteOff(action.noteNumber)),
        midiNoteToF(action.noteNumber),
        action.velocity / 127,
        modLevel(getState()) * 500
      )
      next(noteOn(action.noteNumber))
      return
  }
  return next(action)
}

// ---------- FM SYNTH ----------
function intialiseSynth () {
  const context = (window.AudioContext || window.webkitAudioContext) && new (window.AudioContext || window.webkitAudioContext)()
  if (!context) return (onComplete) => { onComplete() }
  const { audioParam, multiply, now, oscillator, scheduleAt } = operatorFactory(context)

  const carrierAmplitude = audioParam(0)
  const carrierFrequency = audioParam(0)
  const harmonicityRatio = audioParam(0.99)
  const modulationIndex = audioParam(0)

  const carrierFrequencyTimesHarmonicityRatio = multiply(carrierFrequency, harmonicityRatio)
  const modulatorOsc = multiply(
    oscillator([carrierFrequencyTimesHarmonicityRatio]),
    multiply(carrierFrequencyTimesHarmonicityRatio, modulationIndex)
  )

  const carrierOsc = oscillator([carrierFrequency, modulatorOsc])
  const output = multiply(carrierOsc, carrierAmplitude)

  output.connect(context.destination)

  let cancelCurrent = () => {}

  return (onComplete, carrierF, carrierA, modLevel) => {
    cancelCurrent()
    const initialTime = now()
    carrierFrequency.rampToValueAtTime(carrierF, initialTime)
    modulationIndex.rampToValueAtTime(modLevel, initialTime)

    carrierAmplitude.holdAtCurrentValue()
    const attackTime = (20 / 1000)
    const decayTime = 0.5
    const totalEnvelopeTime = initialTime + attackTime + decayTime
    carrierAmplitude.rampToValueAtTime(carrierA, initialTime + attackTime)
    carrierAmplitude.rampToValueAtTime(0, totalEnvelopeTime)
    scheduleAt(onComplete, totalEnvelopeTime)
    cancelCurrent = () => { onComplete() }
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
      holdAtCurrentValue: () => node.gain.cancelAndHoldAtTime(0),
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
