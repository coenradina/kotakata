// After a run that didn't pass, pick ONE thing to point at.

import type { Label, RunResult, Step } from './levels/train/model'

export type HintKey =
  | 'start'
  | 'addData'
  | 'dataFirst'
  | 'addTest'
  | 'addTrain'
  | 'addApple'
  | 'addBanana'
  | 'testMore'
  | 'moreRounds'
  | 'moreData'

/** A block in the palette, or a field on a block in the player's program. */
export type HintTarget =
  | { where: 'palette'; type: string; label?: Label }
  | { where: 'field'; type: string; field: string }

export interface Hint {
  key: HintKey
  target: HintTarget
}

const palette = (type: string, label?: Label): HintTarget => ({ where: 'palette', type, label })

/**
 * `program` is null when there's no "when run" block at all. Checks go from
 * "can't run at all" to "ran but scored low", so the hint is always the most
 * basic thing still missing.
 */
export function chooseHint(program: Step[] | null, result: RunResult | null): Hint | null {
  if (program === null) return { key: 'start', target: palette('kk_when_run') }
  if (result?.passed) return null

  const collects = program.filter((s) => s.kind === 'collect')
  const trainIndex = program.findIndex((s) => s.kind === 'train')
  const testIndex = program.findIndex((s) => s.kind === 'test')
  const firstCollect = program.findIndex((s) => s.kind === 'collect')

  if (collects.length === 0) {
    return trainIndex >= 0
      ? { key: 'dataFirst', target: palette('kk_collect', 'apple') }
      : { key: 'addData', target: palette('kk_collect', 'apple') }
  }
  if (trainIndex >= 0 && firstCollect > trainIndex) return { key: 'dataFirst', target: palette('kk_collect', 'apple') }
  if (testIndex < 0) return { key: 'addTest', target: palette('kk_test') }
  if (trainIndex < 0 || trainIndex > testIndex) return { key: 'addTrain', target: palette('kk_train') }

  const labels = new Set(collects.map((s) => s.label))
  if (!labels.has('banana')) return { key: 'addBanana', target: palette('kk_collect', 'banana') }
  if (!labels.has('apple')) return { key: 'addApple', target: palette('kk_collect', 'apple') }

  const tested = program.filter((s) => s.kind === 'test').reduce((n, s) => Math.max(n, s.count), 0)
  if (tested < 10) return { key: 'testMore', target: { where: 'field', type: 'kk_test', field: 'COUNT' } }

  const rounds = program.reduce((n, s) => n + (s.kind === 'train' ? s.rounds : 0), 0)
  if (rounds < 3) return { key: 'moreRounds', target: { where: 'field', type: 'kk_train', field: 'ROUNDS' } }
  return { key: 'moreData', target: palette('kk_collect', 'apple') }
}

/** Hints the player has ignored twice in a row stop showing. */
export const MAX_REPEATS = 2
