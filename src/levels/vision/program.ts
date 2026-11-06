// Builds Blockly's saved-program shape from a list of blocks, without loading Blockly.

const chain = (...bs: [string, Record<string, unknown>?][]) =>
  bs.reduceRight<object | undefined>((next, [type, fields]) => ({ type, ...(fields ? { fields } : {}), ...(next ? { next: { block: next } } : {}) }), undefined)!

/** Program blocks under "when ▶ clicked", in the shape Blockly loads. */
export const visionProgram = (...bs: [string, Record<string, unknown>?][]) => ({ languageVersion: 0, blocks: [{ x: 24, y: 24, ...chain(['kk_when_run'], ...bs) }] })
