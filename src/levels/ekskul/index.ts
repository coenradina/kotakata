import { EkskulScene } from '../../game/EkskulScene'
import { SESSION4_CARDS } from '../../i18n'
import type { Session } from '../types'
import { EKSKUL_BADGES, EKSKUL_STAGES, runPuzzle, type EkskulRun } from './stages'
import { EKSKUL_STARTER, ekskulToolbox, readEkskulProgram } from './blocks'
import { chooseEkskulHint } from './hints'
import type { Program } from './model'

/** Session 4: Which club? (docs/plan/02-sessions.md, section 7) */
export const ekskulSession: Session<Program> = {
  id: 's4',
  title: { id: 'Ekskul Apa?', en: 'Which Club?' },
  topic: { id: 'Pohon keputusan dan keadilan', en: 'Decision trees and fairness' },
  fileKey: 'c4File',
  cards: SESSION4_CARDS,
  winKey: 'eWin',
  winCard: 'recommender',
  toolbox: ekskulToolbox,
  starter: EKSKUL_STARTER,
  read: readEkskulProgram,
  isEmpty: (p) => p.tree === null && !p.learn,
  puzzles: EKSKUL_STAGES,
  runGroup: (id) => id,
  badgeDefs: EKSKUL_BADGES,
  run: (p, _seed, stageId): EkskulRun => {
    const raw = runPuzzle(p, stageId)
    const total = raw.train.length + raw.test.length
    return { raw, events: [{ ...raw, puzzle: stageId, maxDepth: p.maxDepth }], accuracy: total ? (raw.trainRight + raw.testRight) / total : 0, passed: false, context: null }
  },
  hint: (p, r, stageId) => chooseEkskulHint(p, r ? (r as EkskulRun).raw : null, stageId),
  createScene: () => new EkskulScene(),
  previewData: (p, stageId) => ({ tree: p && !p.learn ? p.tree : null, puzzle: stageId }),
}
