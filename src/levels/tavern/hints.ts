import { palette, type Hint } from '../../hints'
import { boringStory, type Step, type TavernResult } from './model'

const field = (type: string, name: string, blockId?: string) => ({ where: 'field' as const, type, field: name, blockId })

/** From "nothing written" to "wrote, but not what this stage asks for". */
export function chooseTavernHint(program: Step[] | null, result: TavernResult | null, stage = 'first'): Hint | null {
  if (program === null) return { key: 'start', target: palette('kk_when_run') }
  const writes = program.filter((s) => s.kind === 'write')
  const temp = program.filter((s) => s.kind === 'temp').at(-1)
  const ctx = program.filter((s) => s.kind === 'context').at(-1)
  if (writes.length === 0) return { key: 'tokAddWrite', target: palette('kk_tok_write') }
  if (!result) return null
  // A setting below the last write block never applies: say so, pointing at it.
  const misplaced = result.unused[0]
  if (misplaced) {
    return misplaced.kind === 'temp'
      ? { key: 'tokOrder', target: field('kk_tok_temp', 'T', misplaced.id) }
      : { key: 'tokOrder', target: field('kk_tok_context', 'C', misplaced.id) }
  }
  const lastWrite = writes.at(-1)!
  const tempField = temp ? field('kk_tok_temp', 'T', temp.id) : null
  const warm = result.temperatures.some((t) => t > 0)
  const different = result.story.join(' ') !== boringStory(program).join(' ')

  if (stage === 'first') return result.picks.length < 4 ? { key: 'tokMoreTokens', target: field('kk_tok_write', 'N', lastWrite.id) } : null

  if (stage === 'surprise') {
    if (!warm) return tempField ? { key: 'tokWarmUp', target: tempField } : { key: 'tokAddTemp', target: palette('kk_tok_temp', { T: '1' }) }
    return different ? null : { key: 'tokRunAgain', target: tempField ?? palette('kk_tok_temp') }
  }

  if (stage === 'context') {
    if (warm) return { key: 'tokCool', target: tempField ?? palette('kk_tok_temp', { T: '0' }) }
    if (result.looped || !result.finished) {
      if (!ctx) return { key: 'tokAddContext', target: palette('kk_tok_context', { C: '2' }) }
      if (ctx.kind === 'context' && ctx.value < 2) return { key: 'tokContextTwo', target: field('kk_tok_context', 'C', ctx.id) }
      return { key: 'tokMoreTokens', target: field('kk_tok_write', 'N', lastWrite.id) }
    }
    return null
  }

  // Bonus: warm, two-word memory, finished, and not the usual story
  if (!result.temperatures.some((t) => t >= 1)) return tempField ? { key: 'tokWarmUp', target: tempField } : { key: 'tokAddTemp', target: palette('kk_tok_temp', { T: '1' }) }
  if (!ctx || (ctx.kind === 'context' && ctx.value < 2)) {
    return ctx ? { key: 'tokContextTwo', target: field('kk_tok_context', 'C', ctx.id) } : { key: 'tokAddContext', target: palette('kk_tok_context', { C: '2' }) }
  }
  if (!result.finished) return { key: 'tokMoreTokens', target: field('kk_tok_write', 'N', lastWrite.id) }
  return different ? null : { key: 'tokRunAgain', target: tempField ?? palette('kk_tok_temp') }
}
