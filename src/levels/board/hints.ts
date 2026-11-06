import { palette, type Hint } from '../../hints'
import { QUESTIONS, firstWord, type BoardResult, type Lang, type Step } from './model'

const field = (type: string, f: string, blockId?: string): Hint['target'] => ({ where: 'field', type, field: f, blockId })

/** The pointer for a failed Session 5 run (hint rungs 2 and 3). */
export function chooseBoardHint(program: Step[] | null, result: BoardResult | null, puzzle: string, lang: Lang): Hint | null {
  if (program === null) return { key: 'w_start', target: palette('kk_when_run') }
  const asks = program.filter((s): s is Extract<Step, { kind: 'ask' }> => s.kind === 'ask')
  const writes = program.filter((s): s is Extract<Step, { kind: 'write' }> => s.kind === 'write')
  if (!asks.length) return { key: 'w_ask', target: palette('kk_w_ask') }
  if (!writes.length) return { key: 'w_write', target: palette('kk_w_write') }

  if (puzzle === 'p2') {
    const temp = program.find((s): s is Extract<Step, { kind: 'temp' }> => s.kind === 'temp')
    if (!temp) return { key: 'w_temp', target: palette('kk_w_temp') }
    if (temp.value === 0) return { key: 'w_tempUp', target: field('kk_w_temp', 'T', temp.id) }
    return { key: 'w_again', target: { where: 'block', blockId: writes[0].id } }
  }
  if (puzzle === 'p3') {
    const ctx = program.find((s): s is Extract<Step, { kind: 'context' }> => s.kind === 'context')
    if (ctx && ctx.value < 3) return { key: 'w_context', target: field('kk_w_context', 'C', ctx.id) }
    const total = writes.reduce((n, w) => n + w.n, 0)
    if (total < 6) return { key: 'w_longer', target: field('kk_w_write', 'N', writes[0].id) }
    return { key: 'w_context', target: ctx ? field('kk_w_context', 'C', ctx.id) : palette('kk_w_context') }
  }
  if (puzzle === 'p4') return { key: 'w_check', target: palette('kk_w_check') }
  if (puzzle === 'p5') {
    // Point at the first question whose answer is off.
    const i = QUESTIONS[lang].findIndex((q, k) => firstWord(result?.answers[k]) !== q.answer)
    const ask = asks[Math.max(0, i)]
    return { key: 'w_clearer', target: field('kk_w_ask', 'W1', ask.id) }
  }
  // The sandbox: Kata needs to read the new notice before it answers.
  const reread = program.findIndex((s) => s.kind === 'reread')
  if (reread < 0) return { key: 'w_reread', target: palette('kk_w_reread') }
  return { key: 'w_rereadFirst', target: { where: 'block', blockId: program[reread].id } }
}
