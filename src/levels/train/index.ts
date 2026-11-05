import { TrainScene } from '../../game/TrainScene'
import { LEVEL1_CARDS } from '../../i18n'
import type { Level, LevelRun } from '../types'
import { TRAIN_STARTER, readTrainProgram, trainToolbox } from './blocks'
import { chooseTrainHint } from './hints'
import { run, type RunResult, type Step } from './model'

function toLevelRun(result: RunResult): LevelRun & { raw: RunResult } {
  const lastTest = [...result.events].reverse().find((e) => e.kind === 'test')
  const context = lastTest?.kind === 'test' ? { correct: lastTest.results.filter((r) => r.correct).length, total: lastTest.results.length } : null
  const smallTest = !result.events.some((e) => e.kind === 'test' && e.results.length >= 10)
  return {
    raw: result,
    events: result.events,
    accuracy: result.accuracy,
    passed: result.passed,
    context,
    failKey: result.passed || result.accuracy === null ? null : smallTest ? 'tryAgainSmallTest' : 'tryAgainLow',
  }
}

export const trainLevel: Level<Step[]> = {
  id: 'train',
  title: { id: 'Latih Robot', en: 'Train the Robot' },
  topic: 'Classification',
  fileKey: 'l1Title',
  missionKey: 'l1Mission',
  cards: LEVEL1_CARDS,
  winKey: 'winBody',
  winCard: 'classification',
  storageKey: 'kotakata.level1.blocks',
  toolbox: trainToolbox,
  starter: TRAIN_STARTER,
  read: readTrainProgram,
  isEmpty: (p) => p.length === 0,
  run: (p, seed) => toLevelRun(run(p, seed)),
  hint: (p, r) => chooseTrainHint(p, r ? (r as ReturnType<typeof toLevelRun>).raw : null),
  createScene: () => new TrainScene(),
}
