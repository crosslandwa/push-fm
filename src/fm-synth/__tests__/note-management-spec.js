import { currentActiveNoteNumbers, playNote, releaseNote, updateEnv1Attack, updateEnv1Release } from '..'
import createStore from '../../store'

const wait = async (ms) => {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}

const createStoreAndMinimiseEnvelopeTimes = async (numberOfVoices = 1) => {
  const store = await createStore(numberOfVoices)
  store.dispatch(updateEnv1Attack(0))
  store.dispatch(updateEnv1Release(0))
  return { ...store, currentNotes: () => currentActiveNoteNumbers(store.getState()) }
}

describe('note-management', () => {
  it('details the currently playing note', async () => {
    const { dispatch, currentNotes } = await createStoreAndMinimiseEnvelopeTimes()
    dispatch(playNote(36, 100))
    expect(currentNotes()).toEqual([36])

    dispatch(releaseNote(36))
    await wait(50) // attack/release are 5ms

    expect(currentNotes()).toHaveLength(0)
  })

  it('steals last playing note', async () => {
    const { dispatch, currentNotes } = await createStoreAndMinimiseEnvelopeTimes()
    dispatch(playNote(36, 100))
    dispatch(playNote(37, 100))
    expect(currentNotes()).toEqual([37])
  })

  // TODO note off for stolen note should have no effect

  // TODO re-instate below test and fix
  // it('delays note off when re-triggering the same note', async () => {
  //   const { dispatch, getState } = await createStore()
  //   dispatch(playNoteAndRelease(36, 100)) // play 1st note at T = 0. Should get note off ~ T = 500ms (default release is 500ms...)

  //   await wait(250)
  //   dispatch(playNoteAndRelease(36, 100)) // play 2nd note at T = 250. Should get note off ~ T = 750ms

  //   await wait(350) // so at T = 600 1st note-off "should" have fired (if it is not cancelled as part of the voice stealing)

  //   expect(currentActiveNoteNumbers(getState())).toHaveLength(1) // i.e. 1st note-off cancelld, 2nd note-off is yet to fire

  //   await wait(200) // so at T = 800 2nd note-off "should" have fired
  //   expect(currentActiveNoteNumbers(getState())).toHaveLength(0)
  // })

  it('ignores note offs for stolen notes', async () => {
    const { dispatch, currentNotes } = await createStoreAndMinimiseEnvelopeTimes()

    dispatch(playNote(36, 100))
    await wait(50)
    expect(currentNotes()).toEqual([36])

    dispatch(playNote(37, 100))
    await wait(50)
    expect(currentNotes()).toEqual([37])

    dispatch(releaseNote(36))
    await wait(50)
    expect(currentNotes()).toEqual([37])
  })

  it('voice stealing', async () => {
    const { dispatch, currentNotes } = await createStoreAndMinimiseEnvelopeTimes(3)
    const noteOn = noteNumber => dispatch(playNote(noteNumber, 100))
    const noteOff = async (noteNumber) => {
      dispatch(releaseNote(noteNumber))
      await wait(10)
    }

    expect(currentNotes()).toEqual([])

    noteOn(1)
    expect(currentNotes()).toEqual([1])

    noteOn(2)
    expect(currentNotes()).toEqual([1, 2])

    noteOn(3)
    expect(currentNotes()).toEqual([1, 2, 3])

    noteOn(4)
    expect(currentNotes()).toEqual([2, 3, 4])

    await noteOff(1)
    expect(currentNotes()).toEqual([2, 3, 4])

    await noteOff(3)
    expect(currentNotes()).toEqual([2, 4])

    noteOn(5)
    expect(currentNotes()).toEqual([2, 4, 5])

    await noteOff(4)
    expect(currentNotes()).toEqual([2, 5])

    noteOn(4)
    expect(currentNotes()).toEqual([2, 5, 4])

    await noteOff(2)
    expect(currentNotes()).toEqual([5, 4])

    await noteOff(4)
    expect(currentNotes()).toEqual([5])

    await noteOff(5)
    expect(currentNotes()).toEqual([])
  })
})
