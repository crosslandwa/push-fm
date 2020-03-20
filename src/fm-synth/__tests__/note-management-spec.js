import { activeNotes, playNote, playNoteAndRelease, releaseNote } from '..'
import createStore from '../../store'

const wait = async (ms) => {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}

describe('note-management', () => {
  it('details the currently playing note', async () => {
    const { dispatch, getState } = await createStore()
    dispatch(playNote(36, 100))
    expect(activeNotes(getState())).toEqual([{ noteNumber: 36, velocity: 100 }])

    dispatch(releaseNote(36))

    await wait(600) // default release is 500ms

    expect(activeNotes(getState())).toHaveLength(0)
  })

  it('delays note off when re-triggering the same note', async () => {
    const { dispatch, getState } = await createStore()
    dispatch(playNoteAndRelease(36, 100))

    await wait(250) // default release is 500ms...

    dispatch(playNoteAndRelease(36, 100))
    await wait(350) // ...so first note should be cleared after 600ms

    expect(activeNotes(getState())).toHaveLength(1) // but clearing of first note-36 is cancelled so second note-36 is still active
  })

  it('steals last playing note', async () => {
    const { dispatch, getState } = await createStore()
    dispatch(playNote(36, 100))
    dispatch(playNote(37, 100))
    expect(activeNotes(getState())).toEqual([{ noteNumber: 37, velocity: 100 }])
  })
})
