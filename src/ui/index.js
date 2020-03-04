import { ACTION__FM_SYNTH_NOTE_OFF, ACTION__FM_SYNTH_NOTE_ON } from '../fm-synth'

export const playingNotes = state => state.ui.playingNotes.map(x => x - 36)

export const reducer = (state = { playingNotes: [] }, action) => {
  switch (action.type) {
    case ACTION__FM_SYNTH_NOTE_ON.type:
      return { ...state, playingNotes: state.playingNotes.concat(ACTION__FM_SYNTH_NOTE_ON.noteNumber(action)) }
    case ACTION__FM_SYNTH_NOTE_OFF.type:
      return { ...state, playingNotes: state.playingNotes.filter(x => x !== ACTION__FM_SYNTH_NOTE_OFF.noteNumber(action)) }
  }
  return state
}
