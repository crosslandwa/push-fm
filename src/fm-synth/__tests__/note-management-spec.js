import { activeNotes, playNote, releaseNote } from '..'
import createStore from '../../store'

describe('note-management', () => {
  it('details the currently playing note', async () => {
    const { dispatch, getState } = await createStore()
    dispatch(playNote(36, 100))
    expect(activeNotes(getState())).toEqual([{ noteNumber: 36, velocity: 100 }])

    await dispatch(releaseNote(36))

    expect(activeNotes(getState())).toHaveLength(0)
  })

  it('steals last playing note', async () => {
    const { dispatch, getState } = await createStore()
    dispatch(playNote(36, 100))
    dispatch(playNote(37, 100))
    expect(activeNotes(getState())).toEqual([{ noteNumber: 37, velocity: 100 }])
  })
})
