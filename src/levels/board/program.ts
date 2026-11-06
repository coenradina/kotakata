// Builds Blockly's saved-program shape from a list of blocks. Kept apart
// from blocks.ts so puzzles and tests can use it without loading Blockly.

const chain = (...bs: [string, Record<string, unknown>?][]) =>
  bs.reduceRight<object | undefined>((next, [type, fields]) => ({ type, ...(fields ? { fields } : {}), ...(next ? { next: { block: next } } : {}) }), undefined)!

/** Program blocks under "when ▶ clicked", in the shape Blockly loads. */
export const boardProgram = (...bs: [string, Record<string, unknown>?][]) => ({ languageVersion: 0, blocks: [{ x: 24, y: 24, ...chain(['kk_when_run'], ...bs) }] })

/** The empty choice in a prompt slot. Blockly dropdown values can't be empty strings. */
export const BLANK = '_'
const SLOTS = 4

/** The fields of an "ask Kata" block for a prompt of up to four words. */
export function askFields(words: string[]): Record<string, string> {
  return Object.fromEntries(Array.from({ length: SLOTS }, (_, i) => [`W${i + 1}`, words[i] ?? BLANK]))
}
