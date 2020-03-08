import { currentPatch as currentSynthPatch, loadPatch as loadSynthPatch } from '../fm-synth'

// ---------- ACTION ----------
export const loadPatch = patchNumber => ({ type: 'PATCH_MANAGEMENT_LOAD_PATCH', patchNumber })
export const savePatch = patchNumber => ({ type: 'PATCH_MANAGEMENT_SAVE_PATCH', patchNumber })

// ---------- SELECTOR ----------
export const currentPatch = (state) => state.patchManagement.currentPatch
const patch = (state, number) => state.patchManagement.patches[number]

// ---------- REDUCER ----------
export const reducer = (state = { currentPatch: 1, patches: {} }, action) => {
  switch (action.type) {
    case 'PATCH_MANAGEMENT_LOAD_PATCH':
      return { ...state, currentPatch: action.patchNumber }
    case 'PATCH_MANAGEMENT_SAVE_PATCH':
      return {
        ...state,
        currentPatch: action.patchNumber,
        patches: {
          ...state.patches,
          [action.patchNumber]: action.patch
        }
      }
  }
  return state
}

// ---------- REDUCER ----------
export const middleware = ({ getState }) => next => action => {
  switch (action.type) {
    case 'PATCH_MANAGEMENT_LOAD_PATCH':
      next(action)
      next(loadSynthPatch(patch(getState(), action.patchNumber)))
      return
    case 'PATCH_MANAGEMENT_SAVE_PATCH':
      action.patch = currentSynthPatch(getState())
      next(action)
      return
  }
  return next(action)
}
