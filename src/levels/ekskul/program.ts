// Builds Blockly's saved-program shape without loading Blockly, for starters, demos and tests.
import type { Ekskul, Feature } from './model'

export type Node = { ask: Feature; yes?: Node; no?: Node } | { rec: Ekskul }
type Step = [string, Record<string, unknown>?]

function nodeBlock(n: Node): object {
  if ('rec' in n) return { type: 'kk_e_rec', fields: { EK: n.rec } }
  const inputs: Record<string, object> = {}
  if (n.yes) inputs.YES = { block: nodeBlock(n.yes) }
  if (n.no) inputs.NO = { block: nodeBlock(n.no) }
  return { type: 'kk_e_ask', fields: { Q: n.ask }, inputs }
}

/** Steps under "when ▶ clicked", then an optional hand-built tree at the end. */
export function ekskulProgram(steps: Step[], tree?: Node) {
  const last: object | undefined = tree ? nodeBlock(tree) : undefined
  const chain = steps.reduceRight<object | undefined>((next, [type, fields]) => ({ type, ...(fields ? { fields } : {}), ...(next ? { next: { block: next } } : {}) }), last)
  return { languageVersion: 0, blocks: [{ x: 24, y: 24, type: 'kk_when_run', ...(chain ? { next: { block: chain } } : {}) }] }
}
