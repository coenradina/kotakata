import type * as Blockly from 'blockly/core'
import { buildToolbox, defineJsonBlocks, findHat, WHEN_RUN_GROUP } from '../../blocks/common'
import { t, type Key, type Lang } from '../../i18n'
import { QUESTIONS, type Critter, type Question, type Tree } from './model'

const QUESTION_KEY: Record<Question, Key> = { wings: 'qWings', big: 'qBig', green: 'qGreen', yellow: 'qYellow', brown: 'qBrown' }
const PEN_KEY: Record<Critter, Key> = { bird: 'penBird', bee: 'penBee', frog: 'penFrog' }

export function questionText(lang: Lang, q: Question) {
  return t(lang, QUESTION_KEY[q])
}

export function defineTreeBlocks(lang: Lang) {
  defineJsonBlocks([
    {
      // A split: one yes/no question, with a branch for each answer. No
      // "next" connection, so each branch holds exactly one block.
      type: 'kk_ask',
      message0: t(lang, 'blkAsk'),
      args0: [
        { type: 'field_dropdown', name: 'Q', options: QUESTIONS.map((q) => [questionText(lang, q), q]) },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'YES' },
        { type: 'input_statement', name: 'NO' },
      ],
      previousStatement: null,
      style: 'data',
    },
    {
      // A leaf: where a critter ends up.
      type: 'kk_pen',
      message0: t(lang, 'blkPen'),
      args0: [
        {
          type: 'field_dropdown',
          name: 'PEN',
          options: (['bird', 'bee', 'frog'] as Critter[]).map((c) => [t(lang, PEN_KEY[c]), c]),
        },
      ],
      previousStatement: null,
      style: 'model',
    },
  ])
}

export function treeToolbox(lang: Lang) {
  return buildToolbox(lang, [
    WHEN_RUN_GROUP,
    {
      label: 'catAsk',
      style: 'data',
      blocks: [
        { kind: 'block', type: 'kk_ask', fields: { Q: 'wings' } },
        { kind: 'block', type: 'kk_ask', fields: { Q: 'big' } },
        { kind: 'block', type: 'kk_ask', fields: { Q: 'yellow' } },
      ],
    },
    {
      label: 'catPens',
      style: 'model',
      blocks: [
        { kind: 'block', type: 'kk_pen', fields: { PEN: 'bird' } },
        { kind: 'block', type: 'kk_pen', fields: { PEN: 'bee' } },
        { kind: 'block', type: 'kk_pen', fields: { PEN: 'frog' } },
      ],
    },
  ])
}

/** Starter for stage 1: just the start block, so the player places the first question. */
export const TREE_STARTER: object = {
  blocks: { languageVersion: 0, blocks: [{ type: 'kk_when_run', x: 24, y: 24 }] },
}

/** What's under "when run": the tree (null if nothing is attached yet). */
export interface TreeProgram {
  tree: Tree | null
}

function readNode(block: Blockly.Block | null): Tree | null {
  if (!block || !block.isEnabled()) return null
  if (block.type === 'kk_pen') return { kind: 'leaf', id: block.id, pen: block.getFieldValue('PEN') as Critter }
  if (block.type === 'kk_ask') {
    return {
      kind: 'split',
      id: block.id,
      q: block.getFieldValue('Q') as Question,
      yes: readNode(block.getInputTargetBlock('YES')),
      no: readNode(block.getInputTargetBlock('NO')),
    }
  }
  return null
}

/** Reads the tree as data. Blocks are never turned into code and evaluated. */
export function readTreeProgram(ws: Blockly.Workspace): TreeProgram | null {
  const hat = findHat(ws)
  if (!hat) return null
  return { tree: readNode(hat.getNextBlock()) }
}
