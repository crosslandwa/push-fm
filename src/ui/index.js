import { ACTION__FM_SYNTH_NOTE_OFF, ACTION__FM_SYNTH_NOTE_ON } from '../fm-synth'

export const isPlaying = state => state.ui.playing

export const reducer = (state = { playing: false }, action) => {
  switch (action.type) {
    case ACTION__FM_SYNTH_NOTE_ON:
      return { ...state, playing: true }
    case ACTION__FM_SYNTH_NOTE_OFF:
      return { ...state, playing: false }
  }
  return state
}
