import type * as Blockly from 'blockly/core'
import { buildToolbox, defineJsonBlocks, findHat, WHEN_RUN_GROUP, type ToolboxGroup } from '../../blocks/common'
import { num, t, type Lang } from '../../i18n'
import { CONTEXTS, MAX_WRITE, PROMPT_SLOTS, TEMPERATURES, vocabulary, type Step } from './model'
import { BLANK, askFields, boardProgram } from './program'

export function defineBoardBlocks(lang: Lang) {
  const words = [['—', BLANK], ...vocabulary(lang).map((w) => [w, w])]
  defineJsonBlocks([
    {
      type: 'kk_w_ask',
      message0: t(lang, 'blkWAsk'),
      args0: Array.from({ length: PROMPT_SLOTS }, (_, i) => ({ type: 'field_dropdown', name: `W${i + 1}`, options: words })),
      previousStatement: null,
      nextStatement: null,
      style: 'events',
    },
    {
      type: 'kk_w_temp',
      message0: t(lang, 'blkWTemp'),
      args0: [{ type: 'field_dropdown', name: 'T', options: TEMPERATURES.map((v) => [num(lang, v), String(v)]) }],
      previousStatement: null,
      nextStatement: null,
      style: 'data',
    },
    {
      type: 'kk_w_context',
      message0: t(lang, 'blkWContext'),
      args0: [{ type: 'field_dropdown', name: 'C', options: CONTEXTS.map((v) => [String(v), String(v)]) }],
      previousStatement: null,
      nextStatement: null,
      style: 'data',
    },
    {
      type: 'kk_w_write',
      message0: t(lang, 'blkWWrite'),
      args0: [{ type: 'field_number', name: 'N', value: 1, min: 1, max: MAX_WRITE, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      style: 'model',
    },
    { type: 'kk_w_check', message0: t(lang, 'blkWCheck'), previousStatement: null, nextStatement: null, style: 'events' },
    { type: 'kk_w_reread', message0: t(lang, 'blkWReread'), previousStatement: null, nextStatement: null, style: 'data' },
  ])
}

const ORDER = ['p1', 'p2', 'p3', 'p4', 'p5']

/** One new block per puzzle: temperature in P2, memory in P3, the check in P4, re-reading the board in the sandbox. */
export function boardToolbox(lang: Lang, puzzleId = 'p1') {
  const at = ORDER.indexOf(puzzleId)
  const from = (p: string) => at < 0 || at >= ORDER.indexOf(p)
  const ask: ToolboxGroup = { label: 'catWAsk', style: 'events', blocks: [{ kind: 'block', type: 'kk_w_ask' }] }
  const settings: ToolboxGroup = {
    label: 'catWSettings',
    style: 'data',
    blocks: [
      ...(from('p2') ? [{ kind: 'block' as const, type: 'kk_w_temp', fields: { T: '1' } }] : []),
      ...(from('p3') ? [{ kind: 'block' as const, type: 'kk_w_context', fields: { C: '3' } }] : []),
      ...(at < 0 ? [{ kind: 'block' as const, type: 'kk_w_reread' }] : []),
    ],
  }
  const write: ToolboxGroup = { label: 'catWWrite', style: 'model', blocks: [{ kind: 'block', type: 'kk_w_write', fields: { N: 1 } }] }
  const check: ToolboxGroup = { label: 'catWCheck', style: 'events', blocks: [{ kind: 'block', type: 'kk_w_check' }] }
  return buildToolbox(lang, [WHEN_RUN_GROUP, ask, ...(settings.blocks.length ? [settings] : []), write, ...(from('p4') ? [check] : [])])
}

/** Puzzle 1: a question whose answer is on the board, and one word. */
export function boardStarter(lang: Lang): object {
  const prompt = lang === 'id' ? ['kelas', 'libur', 'hari'] : ['no', 'class', 'on']
  return { blocks: boardProgram(['kk_w_ask', askFields(prompt)], ['kk_w_write', { N: 1 }]) }
}

const pick = (v: unknown, options: number[], fallback: number) => (options.includes(Number(v)) ? Number(v) : fallback)

/** Reads the steps under "when run", as data. */
export function readBoardProgram(ws: Blockly.Workspace): Step[] | null {
  const hat = findHat(ws)
  if (!hat) return null
  const steps: Step[] = []
  for (let b = hat.getNextBlock(); b; b = b.getNextBlock()) {
    if (!b.isEnabled()) continue
    if (b.type === 'kk_w_ask') {
      const words = Array.from({ length: PROMPT_SLOTS }, (_, i) => String(b.getFieldValue(`W${i + 1}`) ?? BLANK)).filter((w) => w !== BLANK)
      steps.push({ kind: 'ask', words, id: b.id })
    } else if (b.type === 'kk_w_temp') steps.push({ kind: 'temp', value: pick(b.getFieldValue('T'), TEMPERATURES, 0), id: b.id })
    else if (b.type === 'kk_w_context') steps.push({ kind: 'context', value: pick(b.getFieldValue('C'), CONTEXTS, 3), id: b.id })
    else if (b.type === 'kk_w_write') steps.push({ kind: 'write', n: Math.max(1, Math.min(MAX_WRITE, Math.round(Number(b.getFieldValue('N')) || 1))), id: b.id })
    else if (b.type === 'kk_w_check') steps.push({ kind: 'check', id: b.id })
    else if (b.type === 'kk_w_reread') steps.push({ kind: 'reread', id: b.id })
  }
  return steps
}
