import { palette, type Hint } from '../../hints'
import type { RunResult, Step } from './model'

/**
 * `program` is null when there's no "when run" block at all. Checks go from
 * "can't run at all" to "ran but scored low", so the hint is always the most
 * basic thing still missing.
 */
export function chooseTrainHint(program: Step[] | null, result: RunResult | null): Hint | null {
  if (program === null) return { key: 'start', target: palette('kk_when_run') }
  if (result?.passed) return null

  const collects = program.filter((s) => s.kind === 'collect')
  const trainIndex = program.findIndex((s) => s.kind === 'train')
  const testIndex = program.findIndex((s) => s.kind === 'test')
  const firstCollect = program.findIndex((s) => s.kind === 'collect')
  const apple = palette('kk_collect', { LABEL: 'apple' })

  if (collects.length === 0) return { key: trainIndex >= 0 ? 'dataFirst' : 'addData', target: apple }
  if (trainIndex >= 0 && firstCollect > trainIndex) return { key: 'dataFirst', target: apple }
  if (testIndex < 0) return { key: 'addTest', target: palette('kk_test') }
  if (trainIndex < 0 || trainIndex > testIndex) return { key: 'addTrain', target: palette('kk_train') }

  const labels = new Set(collects.map((s) => s.label))
  if (!labels.has('banana')) return { key: 'addBanana', target: palette('kk_collect', { LABEL: 'banana' }) }
  if (!labels.has('apple')) return { key: 'addApple', target: apple }

  const tested = program.filter((s) => s.kind === 'test').reduce((n, s) => Math.max(n, s.count), 0)
  if (tested < 10) return { key: 'testMore', target: { where: 'field', type: 'kk_test', field: 'COUNT' } }

  const rounds = program.reduce((n, s) => n + (s.kind === 'train' ? s.rounds : 0), 0)
  if (rounds < 3) return { key: 'moreRounds', target: { where: 'field', type: 'kk_train', field: 'ROUNDS' } }
  return { key: 'moreData', target: apple }
}
