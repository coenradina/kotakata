import type * as Blockly from 'blockly/core'
import { buildToolbox, defineJsonBlocks, findHat, WHEN_RUN_GROUP, type ToolboxBlock, type ToolboxGroup } from '../../blocks/common'
import { t, type Lang } from '../../i18n'
import { DARK_LEVELS, EDGE_LEVELS, type Step } from './model'
import { visionProgram } from './program'

export function defineVisionBlocks(lang: Lang) {
  const plain = (type: string, key: Parameters<typeof t>[1], style: 'events' | 'data' | 'model') => ({ type, message0: t(lang, key), previousStatement: null, nextStatement: null, style })
  defineJsonBlocks([
    {
      type: 'kk_v_dark',
      message0: t(lang, 'blkVDark'),
      args0: [{ type: 'field_dropdown', name: 'N', options: DARK_LEVELS.map((v) => [String(v), String(v)]) }],
      previousStatement: null,
      nextStatement: null,
      style: 'data',
    },
    {
      type: 'kk_v_edges',
      message0: t(lang, 'blkVEdges'),
      args0: [{ type: 'field_dropdown', name: 'N', options: EDGE_LEVELS.map((v) => [String(v), String(v)]) }],
      previousStatement: null,
      nextStatement: null,
      style: 'data',
    },
    plain('kk_v_exposure', 'blkVExposure', 'data'),
    plain('kk_v_depth', 'blkVDepth', 'data'),
    plain('kk_v_inside', 'blkVInside', 'events'),
    plain('kk_v_pair', 'blkVPair', 'events'),
    plain('kk_v_glasses', 'blkVGlasses', 'model'),
    plain('kk_v_hat', 'blkVHat', 'model'),
  ])
}

const ORDER = ['p1', 'p2', 'p3', 'p4', 'p5']

/** One new detector per puzzle: edges in P2, pairs in P3, exposure in P4, depth in P5, the hat in the sandbox. */
export function visionToolbox(lang: Lang, puzzleId = 'p1') {
  const at = ORDER.indexOf(puzzleId)
  const from = (p: string) => at < 0 || at >= ORDER.indexOf(p)
  const b = (type: string, fields?: Record<string, unknown>): ToolboxBlock => ({ kind: 'block', type, ...(fields ? { fields } : {}) })
  const see: ToolboxGroup = {
    label: 'catVSee',
    style: 'data',
    blocks: [
      ...(from('p4') ? [b('kk_v_exposure')] : []),
      b('kk_v_dark', { N: '3' }),
      ...(from('p2') ? [b('kk_v_edges', { N: '1' })] : []),
      ...(from('p5') ? [b('kk_v_depth')] : []),
    ],
  }
  const filter: ToolboxGroup = { label: 'catVFilter', style: 'events', blocks: [...(from('p2') ? [b('kk_v_inside')] : []), ...(from('p3') ? [b('kk_v_pair')] : [])] }
  const place: ToolboxGroup = { label: 'catVDo', style: 'model', blocks: [b('kk_v_glasses'), ...(at < 0 ? [b('kk_v_hat')] : [])] }
  return buildToolbox(lang, [WHEN_RUN_GROUP, see, ...(filter.blocks.length ? [filter] : []), place])
}

/** Puzzle 1 starts with a threshold that also catches the hair. */
export const VISION_STARTER: object = { blocks: visionProgram(['kk_v_dark', { N: '3' }], ['kk_v_glasses']) }

const level = (v: unknown, options: number[], fallback: number) => (options.includes(Number(v)) ? Number(v) : fallback)

export function readVisionProgram(ws: Blockly.Workspace): Step[] | null {
  const hat = findHat(ws)
  if (!hat) return null
  const steps: Step[] = []
  for (let bl = hat.getNextBlock(); bl; bl = bl.getNextBlock()) {
    if (!bl.isEnabled()) continue
    const id = bl.id
    if (bl.type === 'kk_v_dark') steps.push({ kind: 'dark', below: level(bl.getFieldValue('N'), DARK_LEVELS, 3), id })
    else if (bl.type === 'kk_v_edges') steps.push({ kind: 'edges', over: level(bl.getFieldValue('N'), EDGE_LEVELS, 1), id })
    else if (bl.type === 'kk_v_exposure') steps.push({ kind: 'exposure', id })
    else if (bl.type === 'kk_v_depth') steps.push({ kind: 'depth', id })
    else if (bl.type === 'kk_v_inside') steps.push({ kind: 'inside', id })
    else if (bl.type === 'kk_v_pair') steps.push({ kind: 'pair', id })
    else if (bl.type === 'kk_v_glasses') steps.push({ kind: 'glasses', id })
    else if (bl.type === 'kk_v_hat') steps.push({ kind: 'hat', id })
  }
  return steps
}
