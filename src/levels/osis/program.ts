// Builds Blockly's saved-program shape without loading Blockly, for demos and tests.
import { DEFAULTS, type Settings } from './model'

type Step = [string, Record<string, unknown>]

/** Decision blocks under "when ▶ clicked", in the shape Blockly loads. */
export function osisProgram(...steps: Step[]) {
  const chain = steps.reduceRight<object | undefined>((next, [type, fields]) => ({ type, fields, ...(next ? { next: { block: next } } : {}) }), undefined)
  return { languageVersion: 0, blocks: [{ x: 24, y: 24, type: 'kk_when_run', ...(chain ? { next: { block: chain } } : {}) }] }
}

/** The block type for each setting. */
export const BLOCK_OF: Record<keyof Settings, string> = {
  attend: 'kk_o_attend',
  strict: 'kk_o_strict',
  flag: 'kk_o_flag',
  unsure: 'kk_o_unsure',
  review: 'kk_o_review',
  recog: 'kk_o_recog',
  keep: 'kk_o_keep',
  access: 'kk_o_access',
}

/** A block set to the proposal's default, as the meeting first hears it. */
const at = (setting: keyof Settings): Step => [BLOCK_OF[setting], { V: String(DEFAULTS[setting]) }]

/** The proposals as first put to the meeting, loaded at the start of each stage. */
export const PROPOSALS = {
  p1: osisProgram(at('attend')),
  p2: osisProgram(at('strict')),
  p4: osisProgram(at('unsure'), at('review')),
  p5: osisProgram(at('recog'), at('keep'), at('access')),
}
