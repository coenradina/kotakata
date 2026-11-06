import { palette, type Hint } from '../../hints'
import { SENDERS, type FairResult, type Step } from './model'
import { EXAMPLE_LIMIT } from './stages'

const field = (type: string, f: string, blockId?: string): Hint['target'] => ({ where: 'field', type, field: f, blockId })

/** The pointer for a failed Session 3 run (hint rungs 2 and 3). */
export function chooseFairHint(program: Step[] | null, result: FairResult | null, puzzle: string): Hint | null {
  if (program === null) return { key: 'f_start', target: palette('kk_when_run') }
  const train = program.findIndex((s) => s.kind === 'train')
  const tests = program.filter((s): s is Extract<Step, { kind: 'test' }> => s.kind === 'test')
  const collects = program.filter((s): s is Extract<Step, { kind: 'collect' }> => s.kind === 'collect')
  if (train < 0) return { key: 'f_train', target: palette('kk_c_train') }

  if (puzzle === 'p1') {
    const t8c = tests.find((t) => t.on === '8c')
    if (!t8c) return { key: 'f_test8c', target: tests[0] ? field('kk_f_test', 'ON', tests[0].id) : palette('kk_f_test') }
    return { key: 'f_inspect', target: palette('kk_f_inspect') }
  }
  if (puzzle === 'p2') {
    const last = tests.at(-1)
    if (!last || last.on !== '8c') return { key: 'f_test8c', target: last ? field('kk_f_test', 'ON', last.id) : palette('kk_f_test') }
    const from8a = collects.find((c) => c.source === '8a')
    return { key: 'f_collect8c', target: from8a ? field('kk_f_collect', 'SOURCE', from8a.id) : palette('kk_f_collect') }
  }
  if (puzzle === 'p3') {
    const last = tests.at(-1)
    if (!last || last.on !== '8a') return { key: 'f_test8a', target: last ? field('kk_f_test', 'ON', last.id) : palette('kk_f_test') }
    return { key: 'f_check', target: palette('kk_f_check') }
  }
  if (puzzle === 'p4') {
    if (!program.some((s) => s.kind === 'holdout')) return { key: 'f_holdout', target: palette('kk_f_holdout') }
    const last = tests.at(-1)
    return { key: 'f_testHoldout', target: last ? field('kk_f_test', 'ON', last.id) : palette('kk_f_test') }
  }
  // Puzzle 5 and the sandbox: fair to everyone.
  if (!program.some((s) => s.kind === 'bySender')) return { key: 'f_sender', target: palette('kk_f_sender') }
  const scores = result?.bySender
  const failing = scores ? SENDERS.filter((s) => scores[s].total && scores[s].right / scores[s].total < 5 / 6 - 1e-9) : []
  if (failing.length) {
    const fromBimo = collects.find((c) => c.source === 'bimo')
    if (failing.includes('bimo') && !fromBimo) return { key: 'f_collectBimo', target: palette('kk_f_collect') }
    if (failing.includes('ayu') && !collects.some((c) => c.source === '8c')) return { key: 'f_collect8c', target: palette('kk_f_collect') }
  }
  if (puzzle === 'sandbox' && (result?.examples ?? 0) > EXAMPLE_LIMIT) {
    const biggest = [...collects].sort((a, b) => b.count - a.count)[0]
    if (biggest) return { key: 'f_fewer', target: field('kk_f_collect', 'COUNT', biggest.id) }
  }
  return { key: 'f_collectBimo', target: palette('kk_f_collect') }
}
