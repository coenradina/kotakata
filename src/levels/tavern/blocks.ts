import type * as Blockly from 'blockly/core'
import { buildToolbox, defineJsonBlocks, findHat, WHEN_RUN_GROUP } from '../../blocks/common'
import { t, type Key, type Lang } from '../../i18n'
import { CONTEXTS, START_TOKENS, TEMPERATURES, type Step, type Token } from './model'

/** The word for a token in the player's language. */
export function tokenWord(lang: Lang, token: Token) {
  return t(lang, `tok_${token}` as Key)
}

export function defineTavernBlocks(lang: Lang) {
  defineJsonBlocks([
    {
      type: 'kk_tok_start',
      message0: t(lang, 'blkTokStart'),
      args0: [{ type: 'field_dropdown', name: 'TOKEN', options: START_TOKENS.map((tk) => [tokenWord(lang, tk), tk]) }],
      previousStatement: null,
      nextStatement: null,
      style: 'events',
    },
    {
      type: 'kk_tok_temp',
      message0: t(lang, 'blkTokTemp'),
      args0: [{ type: 'field_dropdown', name: 'T', options: TEMPERATURES.map((v) => [String(v), String(v)]) }],
      previousStatement: null,
      nextStatement: null,
      style: 'data',
    },
    {
      type: 'kk_tok_context',
      message0: t(lang, 'blkTokContext'),
      args0: [{ type: 'field_dropdown', name: 'C', options: CONTEXTS.map((v) => [String(v), String(v)]) }],
      previousStatement: null,
      nextStatement: null,
      style: 'data',
    },
    {
      type: 'kk_tok_write',
      message0: t(lang, 'blkTokWrite'),
      args0: [{ type: 'field_number', name: 'N', value: 4, min: 1, max: 12, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      style: 'model',
    },
  ])
}

export function tavernToolbox(lang: Lang) {
  return buildToolbox(lang, [
    WHEN_RUN_GROUP,
    {
      label: 'catTokSettings',
      style: 'data',
      blocks: [
        { kind: 'block', type: 'kk_tok_start', fields: { TOKEN: 'the' } },
        { kind: 'block', type: 'kk_tok_temp', fields: { T: '1' } },
        { kind: 'block', type: 'kk_tok_context', fields: { C: '2' } },
      ],
    },
    { label: 'catTokWrite', style: 'model', blocks: [{ kind: 'block', type: 'kk_tok_write', fields: { N: 4 } }] },
  ])
}

/** Starter: a start word and a single token, so run one asks for more. */
export const TAVERN_STARTER: object = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'kk_when_run',
        x: 24,
        y: 24,
        next: { block: { type: 'kk_tok_start', fields: { TOKEN: 'the' }, next: { block: { type: 'kk_tok_write', fields: { N: 1 } } } } },
      },
    ],
  },
}

/** Reads the settings and writes under "when run", as data. */
export function readTavernProgram(ws: Blockly.Workspace): Step[] | null {
  const hat = findHat(ws)
  if (!hat) return null
  const steps: Step[] = []
  for (let b = hat.getNextBlock(); b; b = b.getNextBlock()) {
    if (!b.isEnabled()) continue
    if (b.type === 'kk_tok_start') steps.push({ kind: 'start', token: b.getFieldValue('TOKEN') as Token, id: b.id })
    else if (b.type === 'kk_tok_temp') steps.push({ kind: 'temp', value: Number(b.getFieldValue('T')), id: b.id })
    else if (b.type === 'kk_tok_context') steps.push({ kind: 'context', value: Number(b.getFieldValue('C')), id: b.id })
    else if (b.type === 'kk_tok_write') steps.push({ kind: 'write', n: Math.round(Number(b.getFieldValue('N')) || 0), id: b.id })
  }
  return steps
}
