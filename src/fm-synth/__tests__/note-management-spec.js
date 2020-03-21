import { activeNotes, playNote, playNoteAndRelease, releaseNote, updateEnv1Attack, updateEnv1Release } from '..'
import createStore from '../../store'

const wait = async (ms) => {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}

const createStoreAndMinimiseEnvelopeTimes = async () => {
  const store = await createStore()
  store.dispatch(updateEnv1Attack(0))
  store.dispatch(updateEnv1Release(0))
  return { ...store, getActiveNotes: () => activeNotes(store.getState()) }
}

describe('note-management', () => {
  it('details the currently playing note', async () => {
    const { dispatch, getActiveNotes } = await createStoreAndMinimiseEnvelopeTimes()
    dispatch(playNote(36, 100))
    expect(getActiveNotes()).toEqual([{ noteNumber: 36, velocity: 100 }])

    dispatch(releaseNote(36))
    await wait(50) // attack/release are 5ms

    expect(getActiveNotes()).toHaveLength(0)
  })

  it('steals last playing note', async () => {
    const { dispatch, getActiveNotes } = await createStoreAndMinimiseEnvelopeTimes()
    dispatch(playNote(36, 100))
    dispatch(playNote(37, 100))
    expect(getActiveNotes()).toEqual([{ noteNumber: 37, velocity: 100 }])
  })

  it('delays note off when re-triggering the same note', async () => {
    const { dispatch, getState } = await createStore()
    dispatch(playNoteAndRelease(36, 100)) // play 1st note at T = 0. Should get note off ~ T = 500ms (default release is 500ms...)

    await wait(250)
    dispatch(playNoteAndRelease(36, 100)) // play 2nd note at T = 250. Should get note off ~ T = 750ms

    await wait(350) // so at T = 600 1st note-off "should" have fired (if it is not cancelled as part of the voice stealing)

    expect(activeNotes(getState())).toHaveLength(1) // i.e. 1st note-off cancelld, 2nd note-off is yet to fire

    await wait(200) // so at T = 800 2nd note-off "should" have fired
    expect(activeNotes(getState())).toHaveLength(0)
  })

  it('ignores note offs for stolen notes', async () => {
    const { dispatch, getActiveNotes } = await createStoreAndMinimiseEnvelopeTimes()

    dispatch(playNote(36, 100))
    await wait(50)
    expect(getActiveNotes()).toEqual([{ noteNumber: 36, velocity: 100 }])

    dispatch(playNote(37, 100))
    await wait(50)
    expect(getActiveNotes()).toEqual([{ noteNumber: 37, velocity: 100 }])

    dispatch(releaseNote(36))
    await wait(50)
    expect(getActiveNotes()).toEqual([{ noteNumber: 37, velocity: 100 }])
  })
})
