import { FairScene } from '../../game/FairScene'
import { SESSION3_CARDS } from '../../i18n'
import type { Session } from '../types'
import { FAIR_BADGES, FAIR_STAGES, type FairRun } from './stages'
import { FAIR_STARTER, fairToolbox, readFairProgram } from './blocks'
import { chooseFairHint } from './hints'
import { runFair, type FairResult, type Step } from './model'

function toRun(raw: FairResult): FairRun {
  const t = raw.lastTest
  return { raw, events: [raw], accuracy: raw.accuracy, passed: false, context: t ? { correct: t.right, total: t.size } : null }
}

/** Session 3: Fair data (docs/plan/02-sessions.md, section 4) */
export const fairSession: Session<Step[]> = {
  id: 's3',
  title: { id: 'Data yang Adil', en: 'Fair Data' },
  topic: { id: 'Data latih dan bias (Bias)', en: 'Training data and bias' },
  fileKey: 'c3File',
  cards: SESSION3_CARDS,
  winKey: 'fWin',
  winCard: 'fairness',
  toolbox: fairToolbox,
  starter: FAIR_STARTER,
  read: readFairProgram,
  isEmpty: (p) => p.length === 0,
  puzzles: FAIR_STAGES,
  // Each puzzle is scored on its own test, so one run doesn't clear the next.
  runGroup: (id) => id,
  badgeDefs: FAIR_BADGES,
  run: (p, seed, _stageId, lang) => toRun(runFair(p, seed, lang)),
  // Before a run, the phone shows the class chat the program tests on.
  previewIsData: true,
  previewData: (p) => ({ on: [...(p ?? [])].reverse().find((s) => s.kind === 'test')?.on ?? null }),
  hint: (p, r, stageId) => chooseFairHint(p, r ? (r as FairRun).raw : null, stageId),
  createScene: () => new FairScene(),
}
