import { palette, type Hint } from '../../hints'
import { BLOCK_OF } from './program'
import type { OsisResult, Program, Settings } from './model'

/** Point at the player's block for a setting, or at the palette if it isn't placed. */
function at(program: Program, setting: keyof Settings, key: string): Hint {
  const id = program.ids[setting]
  return { key, target: id ? { where: 'field', type: BLOCK_OF[setting], field: 'V', blockId: id } : palette(BLOCK_OF[setting]) }
}

/** The pointer for a failed Session 6 run (hint rungs 2 and 3): the decision behind the lowest meter. */
export function chooseOsisHint(program: Program | null, result: OsisResult | null): Hint | null {
  if (program === null) return { key: 'o_start', target: palette('kk_when_run') }
  if (!result) return null
  const s = result.settings
  for (const p of result.plans) {
    if (p.ok) continue
    if (p.plan === 'attend') return at(program, 'attend', 'o_attend')
    if (p.plan === 'essay1') return at(program, 'strict', 'o_strict')
    if (p.plan === 'essay2') {
      if (s.flag === 'zero') return program.ids.flag ? at(program, 'flag', 'o_flagSet') : { key: 'o_flag', target: palette('kk_o_flag') }
      return at(program, 'strict', 'o_strict')
    }
    if (p.plan === 'chat') return s.unsure === 'answer' ? at(program, 'unsure', 'o_unsure') : at(program, 'review', 'o_review')
    if (p.plan === 'gate') {
      if (s.recog === 'on') return at(program, 'recog', 'o_recog')
      if (s.access === 'anyone') return at(program, 'access', 'o_access')
      return at(program, 'keep', 'o_keep')
    }
  }
  return null
}
