import pushWrapper from 'push-wrapper'
import { currentPatchNumber, loadPatch, playNote, savePatch } from '../fm-synth'

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
        .then(push => {
          [0, 1, 2, 3, 4, 5, 6, 7].forEach(y => {
            push.gridRow(y).forEach((pad, x) => {
              pad.onPressed(velocity => dispatch(gridPadPressed(x, y, velocity)))
            })
          })
          return push
        })
        .catch(err => { next(pushBindingError(err.message)); return pushWrapper.push() }) // Ports not found or Web MIDI API not supported)
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
  }
  return next(action)
}

/*
// TODO show active patch on grid select buttons somehow
// TODO re-instate turn on/off grid pads somehow

const numberToXY = n => {
  const y = parseInt(n / 8)
  return { x: n - y * 8, y }
}
const turnOnPad = n => {
  const { x, y } = numberToXY(n)
  push.gridCol(x)[y].ledOn()
}

const turnOffPad = n => {
  const { x, y } = numberToXY(n)
  push.gridCol(x)[y].ledOff()
}
*/
