import type * as Blockly from 'blockly/core'
import { buildToolbox, defineJsonBlocks, findHat, WHEN_RUN_GROUP } from '../../blocks/common'
import { t, type Lang } from '../../i18n'
import type { Label, Step } from './model'

export function defineTrainBlocks(lang: Lang) {
  defineJsonBlocks([
    {
      type: 'kk_collect',
      message0: t(lang, 'blkCollect'),
      args0: [
        { type: 'field_number', name: 'COUNT', value: 5, min: 1, max: 20, precision: 1 },
        {
          type: 'field_dropdown',
          name: 'LABEL',
          options: [
            [t(lang, 'apple'), 'apple'],
            [t(lang, 'banana'), 'banana'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      style: 'data',
    },
    {
      type: 'kk_train',
      message0: t(lang, 'blkTrain'),
      args0: [{ type: 'field_number', name: 'ROUNDS', value: 1, min: 1, max: 10, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      style: 'model',
    },
    {
      type: 'kk_test',
      message0: t(lang, 'blkTest'),
      args0: [{ type: 'field_number', name: 'COUNT', value: 5, min: 1, max: 30, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      style: 'model',
    },
  ])
}

export function trainToolbox(lang: Lang) {
  return buildToolbox(lang, [
    WHEN_RUN_GROUP,
    {
      label: 'catData',
      style: 'data',
      blocks: [
        { kind: 'block', type: 'kk_collect', fields: { COUNT: 3, LABEL: 'apple' } },
        { kind: 'block', type: 'kk_collect', fields: { COUNT: 3, LABEL: 'banana' } },
      ],
    },
    {
      label: 'catModel',
      style: 'model',
      blocks: [
        { kind: 'block', type: 'kk_train' },
        { kind: 'block', type: 'kk_test' },
      ],
    },
  ])
}

/** Starter program: deliberately incomplete, so the first run teaches something. */
export const TRAIN_STARTER: object = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'kk_when_run',
        x: 24,
        y: 24,
        next: {
          block: {
            type: 'kk_collect',
            fields: { COUNT: 3, LABEL: 'apple' },
            next: { block: { type: 'kk_test', fields: { COUNT: 10 } } },
          },
        },
      },
    ],
  },
}

/**
 * Reads the steps under the "when run" block, as data. Blocks are never
 * turned into code and evaluated.
 */
export function readTrainProgram(ws: Blockly.Workspace): Step[] | null {
  const hat = findHat(ws)
  if (!hat) return null
  const steps: Step[] = []
  for (let b = hat.getNextBlock(); b; b = b.getNextBlock()) {
    if (!b.isEnabled()) continue
    const num = (name: string) => Math.round(Number(b!.getFieldValue(name)) || 0)
    if (b.type === 'kk_collect') steps.push({ kind: 'collect', label: b.getFieldValue('LABEL') as Label, count: num('COUNT') })
    else if (b.type === 'kk_train') steps.push({ kind: 'train', rounds: num('ROUNDS') })
    else if (b.type === 'kk_test') steps.push({ kind: 'test', count: num('COUNT') })
  }
  return steps
}
