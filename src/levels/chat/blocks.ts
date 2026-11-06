import type * as Blockly from 'blockly/core'
import { buildToolbox, defineJsonBlocks, findHat, WHEN_RUN_GROUP, type ToolboxGroup } from '../../blocks/common'
import { t, type Lang } from '../../i18n'
import { MAX_COLLECT, MAX_DAYS, MAX_RULE_WORD, cleanRuleWord, type Label, type Step } from './model'

const labelOptions = (lang: Lang) => [
  [t(lang, 'cPenting'), 'penting'],
  [t(lang, 'cSantai'), 'santai'],
]

export function defineChatBlocks(lang: Lang) {
  defineJsonBlocks([
    {
      type: 'kk_c_rule',
      message0: t(lang, 'blkCRule'),
      args0: [
        { type: 'field_input', name: 'WORD', text: lang === 'id' ? 'ulangan' : 'test', maxLength: MAX_RULE_WORD, spellcheck: false },
        { type: 'field_dropdown', name: 'LABEL', options: labelOptions(lang) },
      ],
      previousStatement: null,
      nextStatement: null,
      style: 'events',
    },
    {
      type: 'kk_c_else',
      message0: t(lang, 'blkCElse'),
      args0: [{ type: 'field_dropdown', name: 'LABEL', options: [...labelOptions(lang)].reverse() }],
      previousStatement: null,
      nextStatement: null,
      style: 'events',
    },
    {
      type: 'kk_c_collect',
      message0: t(lang, 'blkCCollect'),
      args0: [
        { type: 'field_number', name: 'COUNT', value: 10, min: 1, max: MAX_COLLECT, precision: 1 },
        { type: 'field_dropdown', name: 'LABEL', options: labelOptions(lang) },
      ],
      previousStatement: null,
      nextStatement: null,
      style: 'data',
    },
    { type: 'kk_c_train', message0: t(lang, 'blkCTrain'), previousStatement: null, nextStatement: null, style: 'model' },
    { type: 'kk_c_test', message0: t(lang, 'blkCTest'), previousStatement: null, nextStatement: null, style: 'model' },
    {
      type: 'kk_c_work',
      message0: t(lang, 'blkCWork'),
      args0: [{ type: 'field_number', name: 'DAYS', value: 3, min: 1, max: MAX_DAYS, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      style: 'model',
    },
  ])
}

/** Which blocks each puzzle offers: rules first, examples from puzzle 3, working days from puzzle 5. */
export function chatToolbox(lang: Lang, puzzleId = 'p1') {
  const rules: ToolboxGroup = {
    label: 'catCRules',
    style: 'events',
    blocks: [
      { kind: 'block', type: 'kk_c_rule', fields: { WORD: lang === 'id' ? 'ulangan' : 'test', LABEL: 'penting' } },
      { kind: 'block', type: 'kk_c_else', fields: { LABEL: 'santai' } },
    ],
  }
  const data: ToolboxGroup = {
    label: 'catCData',
    style: 'data',
    blocks: [
      { kind: 'block', type: 'kk_c_collect', fields: { COUNT: 10, LABEL: 'penting' } },
      { kind: 'block', type: 'kk_c_collect', fields: { COUNT: 10, LABEL: 'santai' } },
    ],
  }
  const kata = (withWork: boolean, withTrain: boolean): ToolboxGroup => ({
    label: 'catCKata',
    style: 'model',
    blocks: [
      ...(withTrain ? [{ kind: 'block' as const, type: 'kk_c_train' }] : []),
      { kind: 'block', type: 'kk_c_test' },
      ...(withWork ? [{ kind: 'block' as const, type: 'kk_c_work', fields: { DAYS: 3 } }] : []),
    ],
  })
  const stage = ['p1', 'p2', 'p3', 'p4', 'p5'].indexOf(puzzleId)
  const learns = stage < 0 || stage >= 2
  const works = stage < 0 || stage >= 4
  return buildToolbox(lang, [WHEN_RUN_GROUP, rules, ...(learns ? [data] : []), kata(works, learns)])
}

/** Puzzle 1 starts with one rule and the test, so the first run shows what's missing. */
export function chatStarter(lang: Lang): object {
  return {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'kk_when_run',
          x: 24,
          y: 24,
          next: {
            block: {
              type: 'kk_c_rule',
              fields: { WORD: lang === 'id' ? 'ulangan' : 'test', LABEL: 'penting' },
              next: { block: { type: 'kk_c_test' } },
            },
          },
        },
      ],
    },
  }
}

const asLabel = (v: unknown): Label => (v === 'santai' ? 'santai' : 'penting')
const count = (v: unknown, max: number) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)))

/** Reads the steps under "when run", as data. */
export function readChatProgram(ws: Blockly.Workspace): Step[] | null {
  const hat = findHat(ws)
  if (!hat) return null
  const steps: Step[] = []
  for (let b = hat.getNextBlock(); b; b = b.getNextBlock()) {
    if (!b.isEnabled()) continue
    if (b.type === 'kk_c_rule') steps.push({ kind: 'rule', word: cleanRuleWord(String(b.getFieldValue('WORD') ?? '')), label: asLabel(b.getFieldValue('LABEL')), id: b.id })
    else if (b.type === 'kk_c_else') steps.push({ kind: 'else', label: asLabel(b.getFieldValue('LABEL')), id: b.id })
    else if (b.type === 'kk_c_collect') steps.push({ kind: 'collect', count: count(b.getFieldValue('COUNT'), MAX_COLLECT), label: asLabel(b.getFieldValue('LABEL')), id: b.id })
    else if (b.type === 'kk_c_train') steps.push({ kind: 'train', id: b.id })
    else if (b.type === 'kk_c_test') steps.push({ kind: 'test', count: 20, id: b.id })
    else if (b.type === 'kk_c_work') steps.push({ kind: 'work', days: count(b.getFieldValue('DAYS'), MAX_DAYS), id: b.id })
  }
  return steps
}
