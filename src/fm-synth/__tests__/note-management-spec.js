import { currentActiveNoteNumbers, playNote, playNoteAndRelease, releaseNote, updateEnv1Attack, updateEnv1Release } from '..'
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

  it('steals voice from oldest playing note when playing new note', async () => {
    const { dispatch, currentNotes } = await createStoreAndMinimiseEnvelopeTimes()
    dispatch(playNote(36, 100))
    dispatch(playNote(37, 100))
    expect(currentNotes()).toEqual([37])
  })

  it('delays note off when re-triggering the same note', async () => {
    const withSingleVoice = 1
    const { dispatch, getState } = await createStore(withSingleVoice)
    dispatch(playNoteAndRelease(36, 100)) // play 1st note at T = 0. Should get note off ~ T = 350ms (default release is 350ms...)

    await wait(150)
    dispatch(playNoteAndRelease(36, 100)) // play 2nd note at T = 150. Should get note off ~ T = 500ms

    await wait(250) // so at T = 400 1st note-off "would" have fired (if it is not cancelled as part of the voice stealing)

    expect(currentActiveNoteNumbers(getState())).toHaveLength(1) // i.e. 1st note-off cancelled, 2nd note-off is yet to fire

    await wait(200) // so at T = 600 2nd note-off "should" have fired
    expect(currentActiveNoteNumbers(getState())).toHaveLength(0)
  })

  it('ignores note offs for stolen notes', async () => {
    const withSingleVoice = 1
    const { dispatch, getState } = await createStore(withSingleVoice)
    const currentNotes = () => currentActiveNoteNumbers(getState())

    dispatch(playNote(36, 100)) // play 1st note at T = 0
    dispatch(releaseNote(36)) // Release 1st note (default release is 500ms...)
    expect(currentNotes()).toEqual([36])

    await wait(350)
    dispatch(playNote(37, 100)) // play 2nd note at T = 350, steals 1st note
    expect(currentNotes()).toEqual([37])

    await wait(250) // by T = 600 first (stolen) note would have finished...
    expect(currentNotes()).toEqual([37]) // ...but second note is still active
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
