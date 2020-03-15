import { loadPatch, modLevel, savePatch, updateModLevel } from '..'
import createStore from '../../store'

describe('patch management', () => {
  it('synth parameters can be stored and recalled as patches', () => {
    const { dispatch, getState } = createStore()
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

  it('edits are dismissed if a patch is not saved before changing patches', () => {
    const { dispatch, getState } = createStore()
    expect(modLevel(getState())).toEqual(0)

    dispatch(updateModLevel(0.5))
    expect(modLevel(getState())).toEqual(0.5)

    // patch 1 not saved
    dispatch(loadPatch(2))
    dispatch(loadPatch(1))
    expect(modLevel(getState())).toEqual(0)
  })
})
