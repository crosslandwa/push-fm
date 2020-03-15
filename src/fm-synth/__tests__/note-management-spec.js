import { activeNotes, playNote } from '..'
import createStore from '../../store'

const wait = async (ms) => {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}

describe('note-management', () => {
  it('details the currently playing note', async () => {
    const { dispatch, getState } = await createStore()
    dispatch(playNote(36, 100))
    expect(activeNotes(getState())).toEqual([{ noteNumber: 36, velocity: 100 }])

    // TODO convert this to external trigger of note off (rather than fixed envelope within FM synth)
    await wait(700)

    expect(activeNotes(getState())).toHaveLength(0)
  })
})
