import { HillScene } from '../../game/HillScene'
import { LEVEL3_CARDS } from '../../i18n'
import type { Level } from '../types'
import { HILL_STARTER, hillToolbox, readHillProgram } from './blocks'
import { chooseHillHint } from './hints'
import { runHill, type Step } from './model'
import { HILL_ACHIEVEMENTS, HILL_STAGES, STAGE_SETUP, type HillRun } from './stages'

export const hillLevel: Level<Step[]> = {
  id: 'hill',
  title: { id: 'Bukit Loss', en: 'Hill of Loss' },
  topic: { id: 'Menuruni bukit (Gradient descent)', en: 'Gradient descent' },
  fileKey: 'l3Title',
  cards: LEVEL3_CARDS,
  winCard: 'gradientDescent',
  winKey: 'winBodyHill',
  storageKey: 'kotakata.level3.blocks',
  toolbox: hillToolbox,
  starter: HILL_STARTER,
  read: readHillProgram,
  isEmpty: (p) => p.length === 0,
  stages: HILL_STAGES,
  achievements: HILL_ACHIEVEMENTS,
  // Stages on the same hill share a run; each checks its own energy budget.
  runGroup: (stage) => STAGE_SETUP[stage]?.hill ?? 'gentle',
  run: (p, _seed, stage): HillRun => {
    const setup = STAGE_SETUP[stage] ?? STAGE_SETUP.gentle
    const raw = runHill(p, setup.hill, setup.budget)
    return { raw, events: [raw], accuracy: null, passed: false, context: null }
  },
  hint: (p, r, stage) => chooseHillHint(p, r ? (r as HillRun).raw : null, stage),
  createScene: () => new HillScene(),
  // The preview shows this stage's hill and energy before anything runs.
  previewData: (_p, stage) => STAGE_SETUP[stage] ?? STAGE_SETUP.gentle,
}
