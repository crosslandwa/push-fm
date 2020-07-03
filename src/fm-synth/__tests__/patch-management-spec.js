import {
  currentPatchHasModifiedVersion,
  currentPatchIsModified,
  loadPatch,
  modLevel,
  savePatch,
  togglePatchAB,
  updateModLevel
} from '..'
import createStore from '../../store'

describe('patch management', () => {
  it('synth parameters can be stored and recalled as patches', async () => {
    const { dispatch, getState } = await createStore()
    expect(modLevel(getState())).toEqual(0)

    dispatch(updateModLevel(0.5))
    expect(modLevel(getState())).toEqual(0.5)

    dispatch(savePatch(1))

    dispatch(loadPatch(2))
    expect(modLevel(getState())).toEqual(0)
    dispatch(updateModLevel(0.75))
    expect(modLevel(getState())).toEqual(0.75)
    dispatch(savePatch(2))

    dispatch(loadPatch(1))
    expect(modLevel(getState())).toEqual(0.5)

    dispatch(loadPatch(2))
    expect(modLevel(getState())).toEqual(0.75)
  })

  it('edits are dismissed if a patch is not saved before changing patches', async () => {
    const { dispatch, getState } = await createStore()
    expect(modLevel(getState())).toEqual(0)

    dispatch(updateModLevel(0.5))
    expect(modLevel(getState())).toEqual(0.5)

    // patch 1 not saved
    dispatch(loadPatch(2))
    dispatch(loadPatch(1))
    expect(modLevel(getState())).toEqual(0)
  })

  describe('A/B comparison', () => {
    const assertIsAWithB = (state) => {
      expect(currentPatchIsModified(state)).toEqual(false)
      expect(currentPatchHasModifiedVersion(state)).toEqual(true)
    }

    const assertIsAWithoutB = (state) => {
      expect(currentPatchIsModified(state)).toEqual(false)
      expect(currentPatchHasModifiedVersion(state)).toEqual(false)
    }

    const assertIsB = (state) => {
      expect(currentPatchIsModified(state)).toEqual(true)
      expect(currentPatchHasModifiedVersion(state)).toEqual(false)
    }

    describe('reverting to the unedited "A" version of a patch', () => {
      it('is not possible on loading patch', async () => {
        const { getState } = await createStore()

        assertIsAWithoutB(getState())
      })

      it('is possible after modifying a patch', async () => {
        const { dispatch, getState } = await createStore()
        dispatch(updateModLevel(0.5)) // B

        assertIsB(getState())
      })

      it('is not possible after modifying a patch then saving it', async () => {
        const { dispatch, getState } = await createStore()
        dispatch(updateModLevel(0.5)) // B
        dispatch(savePatch(1)) // A

        assertIsAWithoutB(getState())
      })

      it('is not possible after modifying a patch then loading a different one it', async () => {
        const { dispatch, getState } = await createStore()
        dispatch(updateModLevel(0.5)) // B

        // patch 1 not saved
        dispatch(loadPatch(2)) // A

        assertIsAWithoutB(getState())
      })
    })

    describe('(re-)applying the edited "B" version of a patch', () => {
      it('is not possible on loading patch', async () => {
        const { getState } = await createStore() // A (no B)

        assertIsAWithoutB(getState())
      })

      it('is not possible on modifying a patch', async () => {
        const { dispatch, getState } = await createStore() // A
        dispatch(updateModLevel(0.5)) // B

        assertIsB(getState())
      })

      it('is possible on modifying a patch then reverting to the "A" version', async () => {
        const { dispatch, getState } = await createStore()
        dispatch(updateModLevel(0.5)) // B
        dispatch(togglePatchAB()) // A (has B)

        assertIsAWithB(getState())
      })

      it('is not possible on modifying a patch then reverting to the "A" version, then re-applying the "B" version', async () => {
        const { dispatch, getState } = await createStore()
        dispatch(updateModLevel(0.5)) // B
        dispatch(togglePatchAB()) // A
        dispatch(togglePatchAB()) // B

        assertIsB(getState())
      })

      it('is not possible on modifying a patch then reverting to the "A" version, then loading another patch', async () => {
        const { dispatch, getState } = await createStore()
        dispatch(updateModLevel(0.5)) // B
        dispatch(togglePatchAB()) // A (has B)
        dispatch(loadPatch(2)) // A (no B)

        assertIsAWithoutB(getState())
      })

      it('is not possible on modifying a patch then reverting to the "A" version, then modifying again', async () => {
        const { dispatch, getState } = await createStore()
        dispatch(updateModLevel(0.5)) // B
        dispatch(togglePatchAB()) // A
        dispatch(updateModLevel(0.75)) // B

        assertIsB(getState())
      })

      it('is not possible on modifying a patch then reverting to the "A" version, then saving the patch', async () => {
        const { dispatch, getState } = await createStore()
        dispatch(updateModLevel(0.5)) // B
        dispatch(togglePatchAB()) // A (with B)
        dispatch(savePatch(1)) // A (no B)

        assertIsAWithoutB(getState())
      })
    })
  })
})
