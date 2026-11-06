import { LEVEL1_CARDS, LEVEL2_CARDS, LEVEL3_CARDS, LEVEL4_CARDS, SESSION1_CARDS, SESSION3_CARDS } from '../i18n'
import { ALL } from '../levels'
import { browserStorage, createLocalStore } from './progress'

export const EVERY_CARD = [...SESSION1_CARDS, ...SESSION3_CARDS, ...LEVEL1_CARDS, ...LEVEL2_CARDS, ...LEVEL3_CARDS, ...LEVEL4_CARDS]

/** The player's progress store. Browser-only until accounts exist. */
export const store = createLocalStore(
  browserStorage(),
  {
    level1Cards: LEVEL1_CARDS.map((c) => c.id),
    mainPuzzles: (id) => ALL.find((l) => l.id === id)?.puzzles.filter((s) => !s.bonus).map((s) => s.id) ?? [],
  },
  EVERY_CARD.map((c) => c.id),
)

export type { Progress, ProgressStore, MomentVars } from './progress'
