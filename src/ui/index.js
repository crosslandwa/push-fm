export const noteOn = () => ({ type: 'UI_NOTE_ON' })
export const noteOff = () => ({ type: 'UI_NOTE_OFF' })

export const isPlaying = state => state.ui.playing

export const reducer = (state = { playing: false }, action) => {
  switch (action.type) {
    case 'UI_NOTE_ON':
      return { ...state, playing: true }
    case 'UI_NOTE_OFF':
      return { ...state, playing: false }
  }
  return state
}
