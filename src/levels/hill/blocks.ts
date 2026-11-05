import type * as Blockly from 'blockly/core'
import { buildToolbox, defineJsonBlocks, findHat, WHEN_RUN_GROUP } from '../../blocks/common'
import { num, t, type Lang } from '../../i18n'
import { LEARNING_RATES, type Step } from './model'

export function defineHillBlocks(lang: Lang) {
  defineJsonBlocks([
    {
      type: 'kk_lr',
      message0: t(lang, 'blkLr'),
      args0: [{ type: 'field_dropdown', name: 'LR', options: LEARNING_RATES.map((v) => [num(lang, v), String(v)]) }],
      previousStatement: null,
      nextStatement: null,
      style: 'data',
    },
    {
      type: 'kk_steps',
      message0: t(lang, 'blkSteps'),
      args0: [{ type: 'field_number', name: 'N', value: 3, min: 1, max: 30, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      style: 'model',
    },
  ])
}

export function hillToolbox(lang: Lang) {
  return buildToolbox(lang, [
    WHEN_RUN_GROUP,
    {
      label: 'catHill',
      style: 'data',
      blocks: [
        { kind: 'block', type: 'kk_lr', fields: { LR: '0.1' } },
        { kind: 'block', type: 'kk_steps', fields: { N: 3 } },
      ],
    },
  ])
}

/** Starter: a small learning rate and too few steps, so run one stops short. */
export const HILL_STARTER: object = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'kk_when_run',
        x: 24,
        y: 24,
        next: { block: { type: 'kk_lr', fields: { LR: '0.1' }, next: { block: { type: 'kk_steps', fields: { N: 3 } } } } },
      },
    ],
  },
}

/** Reads the moves under "when run", as data. Blocks are never evaluated as code. */
export function readHillProgram(ws: Blockly.Workspace): Step[] | null {
  const hat = findHat(ws)
  if (!hat) return null
  const steps: Step[] = []
  for (let b = hat.getNextBlock(); b; b = b.getNextBlock()) {
    if (!b.isEnabled()) continue
    if (b.type === 'kk_lr') steps.push({ kind: 'lr', value: Number(b.getFieldValue('LR')), id: b.id })
    else if (b.type === 'kk_steps') steps.push({ kind: 'steps', n: Math.round(Number(b.getFieldValue('N')) || 0), id: b.id })
  }
  return steps
}
