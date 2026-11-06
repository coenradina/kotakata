import { palette, type Hint } from '../../hints'
import { SLANG_DAY, type ChatResult, type Step } from './model'

const field = (type: string, f: string, blockId?: string): Hint['target'] => ({ where: 'field', type, field: f, blockId })

/**
 * The pointer for a failed run (hint rung 2 and 3). Checks go from "can't
 * work at all" to "worked but scored low", and each puzzle only asks for
 * what it's about.
 */
export function chooseChatHint(program: Step[] | null, result: ChatResult | null, puzzle: string): Hint | null {
  if (program === null) return { key: 'c_start', target: palette('kk_when_run') }
  const has = (k: Step['kind']) => program.some((s) => s.kind === k)
  const index = (k: Step['kind']) => program.findIndex((s) => s.kind === k)
  const rulesOnly = puzzle === 'p1' || puzzle === 'p2' || puzzle === 'sandbox'

  if (rulesOnly) {
    if (!has('test')) return { key: 'c_addTest', target: palette('kk_c_test') }
    if (!has('else')) return { key: 'c_addElse', target: palette('kk_c_else') }
    return { key: 'c_moreRules', target: palette('kk_c_rule') }
  }

  // Puzzles 3 to 5: Kata learns from examples.
  const collects = program.filter((s): s is Extract<Step, { kind: 'collect' }> => s.kind === 'collect')
  if (!collects.length) return { key: 'c_collect', target: palette('kk_c_collect', { LABEL: 'penting' }) }
  const labels = new Set(collects.map((c) => c.label))
  if (labels.size < 2) return { key: 'c_bothLabels', target: palette('kk_c_collect', { LABEL: labels.has('penting') ? 'santai' : 'penting' }) }
  if (!has('train')) return { key: 'c_train', target: palette('kk_c_train') }
  if (index('train') < index('collect')) return { key: 'c_collectFirst', target: { where: 'block', blockId: collects[0].id } }

  if (puzzle === 'p5') {
    const work = program.find((s): s is Extract<Step, { kind: 'work' }> => s.kind === 'work')
    if (!work) return { key: 'c_work', target: palette('kk_c_work') }
    if ((result?.daysWorked ?? 0) < SLANG_DAY) return { key: 'c_moreDays', target: field('kk_c_work', 'DAYS', work.id) }
    if (!result?.retrainedAfterSlang) return { key: 'c_retrain', target: palette('kk_c_collect', { LABEL: 'penting' }) }
    return { key: 'c_workAgain', target: palette('kk_c_work') }
  }

  if (!has('test')) return { key: 'c_addTest', target: palette('kk_c_test') }
  // The smaller pile of examples is the one to grow.
  const smallest = [...collects].sort((a, b) => a.count - b.count)[0]
  return { key: 'c_moreExamples', target: field('kk_c_collect', 'COUNT', smallest.id) }
}
