import pushWrapper from 'push-wrapper'
import { ACTION__FM_SYNTH_NOTE_OFF, ACTION__FM_SYNTH_NOTE_ON, currentPatchNumber, loadPatch, playNote, savePatch } from '../fm-synth'

export const initialisePush = () => ({ type: 'PUSH_INITIALISE' })
export const gridPadPressed = (x, y, velocity) => ({ type: 'PUSH_PAD_PRESSED', x, y, velocity })
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
const numberToXY = n => {
  const y = parseInt(n / 8)
  return { x: n - y * 8, y }
}

let push

const turnOnPad = n => {
  const { x, y } = numberToXY(n)
  push.gridCol(x)[y].ledOn()
}

const turnOffPad = n => {
  const { x, y } = numberToXY(n)
  push.gridCol(x)[y].ledOff()
}

export const middleware = ({ dispatch, getState }) => next => async action => {
  switch (action.type) {
    case 'PUSH_INITIALISE':
      // TODO potentially need to have user select input/output MIDI ports and re-initialise push wrapper
      push = await pushWrapper.webMIDIio()
        .then(
          ({ inputPort, outputPort }) => {
            const push = pushWrapper.push()
            inputPort.onmidimessage = event => push.midiFromHardware(event.data)
            push.onMidiToHardware(outputPort.send.bind(outputPort))
            return push
          },
          err => { next(pushBindingError(err.message)); return pushWrapper.push() } // Ports not found or Web MIDI API not supported
        )
        .then(push => {
          [0, 1, 2, 3, 4, 5, 6, 7].forEach(y => {
            push.gridRow(y).forEach((pad, x) => {
              pad.onPressed(velocity => dispatch(gridPadPressed(x, y, velocity)))
            })
          })
          return push
        })
      return
    case 'PUSH_PAD_PRESSED':
      next(action)
      const { x, y, velocity } = action
      return dispatch(playNote(36 + xyToNumber(x, y), velocity))
    case 'PUSH_GRID_SELECT_PRESSED':
      next(action)
      const currentlyLoadedPatchNumber = currentPatchNumber(getState())
      const invokedPatchNumber = action.x + 1
      return currentlyLoadedPatchNumber === invokedPatchNumber
        ? dispatch(savePatch(invokedPatchNumber))
        : dispatch(loadPatch(invokedPatchNumber))
    case ACTION__FM_SYNTH_NOTE_ON.type:
      turnOnPad(ACTION__FM_SYNTH_NOTE_ON.noteNumber(action) - 36)
      return next(action)
    case ACTION__FM_SYNTH_NOTE_OFF.type:
      turnOffPad(ACTION__FM_SYNTH_NOTE_OFF.noteNumber(action) - 36)
      return next(action)
  }
  return next(action)
}
