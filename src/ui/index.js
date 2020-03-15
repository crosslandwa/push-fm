import { activeNotes, currentPatchNumber } from '../fm-synth'

const YELLOW = [220, 230, 20]

// ---------- SELECTOR ----------
export const activeGridSelect = state => ({ [currentPatchNumber(state) - 1]: YELLOW })
export const activePads = state => activeNotes(state)
  .map(x => x.noteNumber - 36)
  .filter(x => x >= 0)
  .reduce(
    (acc, it) => ({ ...acc, [it]: YELLOW }),
    {}
  )
