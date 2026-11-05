import { TrainScene } from '../../game/TrainScene'
import { LEVEL1_CARDS } from '../../i18n'
import type { Level } from '../types'
import { TRAIN_ACHIEVEMENTS, TRAIN_STAGES, type TrainRun } from './stages'
import { TRAIN_STARTER, readTrainProgram, trainToolbox } from './blocks'
import { chooseTrainHint } from './hints'
import { run, type RunResult, type Step } from './model'

function toLevelRun(result: RunResult): TrainRun {
  const lastTest = [...result.events].reverse().find((e) => e.kind === 'test')
  const context = lastTest?.kind === 'test' ? { correct: lastTest.results.filter((r) => r.correct).length, total: lastTest.results.length } : null
  return { raw: result, events: result.events, accuracy: result.accuracy, passed: result.passed, context }
}

export const trainLevel: Level<Step[]> = {
  id: 'train',
  title: { id: 'Latih Robot', en: 'Train the Robot' },
  topic: { id: 'Memilah (Classification)', en: 'Classification' },
  fileKey: 'l1Title',
  cards: LEVEL1_CARDS,
  winKey: 'winBody',
  winCard: 'classification',
  storageKey: 'kotakata.level1.blocks',
  toolbox: trainToolbox,
  starter: TRAIN_STARTER,
  read: readTrainProgram,
  isEmpty: (p) => p.length === 0,
  stages: TRAIN_STAGES,
  // Every stage plays the same run, so a full program clears them together.
  runGroup: () => 'all',
  achievements: TRAIN_ACHIEVEMENTS,
  run: (p, seed) => toLevelRun(run(p, seed)),
  hint: (p, r, stage) => chooseTrainHint(p, r ? (r as TrainRun).raw : null, stage),
  createScene: () => new TrainScene(),
}
