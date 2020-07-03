import pushWrapper from 'push-wrapper'
import range from '../range'
import {
  changeHarmonicityLevelBy,
  changeModLevelBy,
  currentActiveNoteNumbers,
  currentPatchHasModifiedVersion,
  currentPatchIsModified,
  currentPatchNumber,
  loadPatch,
  playNote,
  playNoteAndRelease,
  releaseNote,
  togglePatchAB
} from '../fm-synth'

const YELLOW = [220, 230, 20]
const ORANGE = [230, 130, 20]

// ---------- SELECTOR ----------
export const activeChannelSelect = state => ({
  6: currentPatchIsModified(state)
    ? ORANGE
    : currentPatchHasModifiedVersion(state) ? YELLOW : undefined
})
export const activeGridSelect = state => ({ [currentPatchNumber(state) - 1]: YELLOW })
export const activePads = state => currentActiveNoteNumbers(state)
  .map(x => x - 36)
  .filter(x => x >= 0)
  .reduce(
    (acc, it) => ({ ...acc, [it]: YELLOW }),
    {}
  )

// ---------- ACTION ----------
export const channelSelectPressed = (x) => ({ type: 'PUSH_CHANNEL_SELECT_PRESSED', x })
export const initialisePush = () => ({ type: 'PUSH_INITIALISE' })
export const gridChannelKnobTurned = (x, delta) => ({ type: 'PUSH_CHANNEL_KNOB_TURNED', x, delta })
export const gridPadPressed = (x, y, velocity, autoRelease = true) => ({ type: 'PUSH_PAD_PRESSED', x, y, velocity, autoRelease })
export const gridPadReleased = (x, y) => ({ type: 'PUSH_PAD_RELEASED', x, y })
export const gridSelectPressed = (x) => ({ type: 'PUSH_GRID_SELECT_PRESSED', x })
const pushBindingError = error => ({ type: 'PUSH_BINDING_ERROR', error })

// ---------- REDUCER ----------
export const reducer = (state = { errors: [] }, action) => {
  switch (action.type) {
    case 'PUSH_BINDING_ERROR':
      return { ...state, errors: [action.error] }
  }
  return state
}

// ---------- MIDDLEWARE ----------
const xyToNumber = (x, y) => (x % 8) + (y * 8)

const resetAllHardwareUI = push => {
  push.gridSelectButtons().forEach(selectButton => selectButton.ledOff())
  range(0, 7).forEach(x => push.gridCol(x).forEach(pad => pad.ledOff()))
  return push
}

export const middleware = ({ dispatch, getState }) => next => async action => {
  switch (action.type) {
    case 'PUSH_INITIALISE':
      // TODO potentially need to have user select input/output MIDI ports and re-initialise push wrapper
      return pushWrapper.webMIDIio()
        .then(
          ({ inputPort, outputPort }) => {
            const push = pushWrapper.push()
            inputPort.onmidimessage = event => push.midiFromHardware(event.data)
            push.onMidiToHardware(outputPort.send.bind(outputPort))
            return push
          }
        )
        .then(resetAllHardwareUI)
        .then(push => {
          push.channelSelectButtons().forEach((channelSelectButton, index) => {
            channelSelectButton.onPressed(() => dispatch(channelSelectPressed(index)))
          })
          push.gridSelectButtons().forEach((gridSelectButton, index) => {
            gridSelectButton.onPressed(() => dispatch(gridSelectPressed(index)))
          })
          range(0, 7).forEach(y => {
            push.gridRow(y).forEach((pad, x) => {
              pad.onPressed(velocity => dispatch(gridPadPressed(x, y, velocity, false)))
              pad.onReleased(() => dispatch(gridPadReleased(x, y)))
            })
          })
          push.channelKnobs().forEach((knob, x) => {
            knob.onTurned(delta => dispatch(gridChannelKnobTurned(x, delta)))
          })
          return push
        })
        .catch(err => { next(pushBindingError(err.message)); return pushWrapper.push() }) // Ports not found or Web MIDI API not supported)
    case 'PUSH_CHANNEL_KNOB_TURNED': {
      const f = [changeModLevelBy, changeHarmonicityLevelBy][action.x]
      f && dispatch(f(action.delta * 0.01))
      return
    }
    case 'PUSH_CHANNEL_SELECT_PRESSED': {
      if (action.x === 6) {
        dispatch(togglePatchAB())
      }
      return
    }
    case 'PUSH_PAD_PRESSED': {
      const { autoRelease, x, y, velocity } = action
      dispatch((autoRelease ? playNoteAndRelease : playNote)(36 + xyToNumber(x, y), velocity))
      return
    }
    case 'PUSH_PAD_RELEASED': {
      dispatch(releaseNote(36 + xyToNumber(action.x, action.y)))
      return
    }
    case 'PUSH_GRID_SELECT_PRESSED': {
      const invokedPatchNumber = action.x + 1
      return dispatch(loadPatch(invokedPatchNumber))
    }
  }
  return next(action)
}

// ---------- RENDERING ----------
const numberToXY = n => {
  const y = parseInt(n / 8)
  return { x: n - y * 8, y }
}
const turnOnPad = (push, n, rgb) => {
  const { x, y } = numberToXY(n)
  push.gridCol(x)[y].ledRGB(...rgb)
}

const turnOffPad = push => n => {
  const { x, y } = numberToXY(n)
  push.gridCol(x)[y].ledOff()
}

let previousActivePads = {}
let previousGridSelectButtons = {}
export const render = (push, state) => {
  const newActivePads = activePads(state)
  const previousActivePadNumbers = Object.keys(previousActivePads)
  const newActivePadNumbers = Object.keys(newActivePads)
  previousActivePadNumbers.filter(n => !newActivePadNumbers.includes(n)).forEach(turnOffPad(push))
  newActivePadNumbers.filter(n => !previousActivePadNumbers.includes(n)).forEach(n => turnOnPad(push, n, newActivePads[n]))
  previousActivePads = newActivePads

  const newActiveGridSelect = activeGridSelect(state)
  const previousActiveGridSelectNumbers = Object.keys(previousGridSelectButtons)
  const newActiveGridSelectNumbers = Object.keys(newActiveGridSelect)
  previousActiveGridSelectNumbers.filter(n => !newActiveGridSelectNumbers.includes(n))
    .forEach(n => push.gridSelectButtons()[n].ledOff())
  newActiveGridSelectNumbers.filter(n => !previousActiveGridSelectNumbers.includes(n))
    .forEach(n => push.gridSelectButtons()[n].ledRGB(...newActiveGridSelect[n]))
  previousGridSelectButtons = newActiveGridSelect
}
