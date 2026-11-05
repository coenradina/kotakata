import { palette, type Hint } from '../../hints'
import type { RunResult, Step } from './model'

/**
 * `program` is null when there's no "when run" block at all. Checks go from
 * "can't run at all" to "ran but scored low", so the hint is always the most
 * basic thing still missing.
 */
export function chooseTrainHint(program: Step[] | null, result: RunResult | null, stage = 'test'): Hint | null {
  if (program === null) return { key: 'start', target: palette('kk_when_run') }
  if (result?.passed && stage !== 'perfect') return null

  const collects = program.filter((s) => s.kind === 'collect')
  const trainIndex = program.findIndex((s) => s.kind === 'train')
  const testIndex = program.findIndex((s) => s.kind === 'test')
  const firstCollect = program.findIndex((s) => s.kind === 'collect')
  const apple = palette('kk_collect', { LABEL: 'apple' })

  const labels = new Set(collects.map((s) => s.label))
  const missingLabel = (): Hint | null =>
    !labels.has('banana')
      ? { key: 'addBanana', target: palette('kk_collect', { LABEL: 'banana' }) }
      : !labels.has('apple')
        ? { key: 'addApple', target: apple }
        : null

  if (collects.length === 0) return { key: trainIndex >= 0 ? 'dataFirst' : 'addData', target: apple }
  if (trainIndex >= 0 && firstCollect > trainIndex) return { key: 'dataFirst', target: apple }
  // Each stage only asks for what it's about.
  if (stage === 'collect') return missingLabel()
  if (stage === 'train') return missingLabel() ?? (trainIndex < 0 ? { key: 'addTrainAfterData', target: palette('kk_train') } : null)
  if (testIndex < 0) return { key: 'addTest', target: palette('kk_test') }
  if (trainIndex < 0 || trainIndex > testIndex) return { key: 'addTrain', target: palette('kk_train') }
  const label = missingLabel()
  if (label) return label

  const tested = program.filter((s) => s.kind === 'test').reduce((n, s) => Math.max(n, s.count), 0)
  if (tested < 10) return { key: 'testMore', target: { where: 'field', type: 'kk_test', field: 'COUNT' } }
  if (stage === 'perfect' && tested < 20) return { key: 'testTwenty', target: { where: 'field', type: 'kk_test', field: 'COUNT' } }

  const rounds = program.reduce((n, s) => n + (s.kind === 'train' ? s.rounds : 0), 0)
  if (rounds < 3) return { key: 'moreRounds', target: { where: 'field', type: 'kk_train', field: 'ROUNDS' } }
  return { key: 'moreData', target: apple }
}
