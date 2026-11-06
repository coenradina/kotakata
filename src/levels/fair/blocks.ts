import type * as Blockly from 'blockly/core'
import { buildToolbox, defineJsonBlocks, findHat, WHEN_RUN_GROUP, type ToolboxBlock, type ToolboxGroup } from '../../blocks/common'
import { t, type Key, type Lang } from '../../i18n'
import { fairProgram } from './program'
import { MAX_COLLECT, MAX_HOLDOUT, SOURCES, TEST_SETS, type Label, type Source, type Step, type TestSet } from './model'

const SOURCE_KEY: Record<Source, Key> = { '8a': 'src8a', '8c': 'src8c', donated: 'srcDonated', bimo: 'srcBimo' }
const SET_KEY: Record<TestSet, Key> = { '8c': 'set8c', '8a': 'set8a', train: 'setTrain', holdout: 'setHoldout' }
export const sourceName = (lang: Lang, s: Source) => t(lang, SOURCE_KEY[s])
export const setName = (lang: Lang, s: TestSet) => t(lang, SET_KEY[s])

export function defineFairBlocks(lang: Lang) {
  defineJsonBlocks([
    {
      type: 'kk_f_collect',
      message0: t(lang, 'blkFCollect'),
      args0: [
        { type: 'field_number', name: 'COUNT', value: 10, min: 1, max: MAX_COLLECT, precision: 1 },
        {
          type: 'field_dropdown',
          name: 'LABEL',
          options: [
            [t(lang, 'cPenting'), 'penting'],
            [t(lang, 'cSantai'), 'santai'],
          ],
        },
        { type: 'field_dropdown', name: 'SOURCE', options: SOURCES.map((s) => [sourceName(lang, s), s]) },
      ],
      previousStatement: null,
      nextStatement: null,
      style: 'data',
    },
    { type: 'kk_f_check', message0: t(lang, 'blkFCheck'), previousStatement: null, nextStatement: null, style: 'data' },
    {
      type: 'kk_f_holdout',
      message0: t(lang, 'blkFHoldout'),
      args0: [{ type: 'field_number', name: 'COUNT', value: 10, min: 1, max: MAX_HOLDOUT, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      style: 'data',
    },
    {
      type: 'kk_f_test',
      message0: t(lang, 'blkFTest'),
      args0: [{ type: 'field_dropdown', name: 'ON', options: TEST_SETS.map((s) => [setName(lang, s), s]) }],
      previousStatement: null,
      nextStatement: null,
      style: 'model',
    },
    { type: 'kk_f_inspect', message0: t(lang, 'blkFInspect'), previousStatement: null, nextStatement: null, style: 'events' },
    { type: 'kk_f_sender', message0: t(lang, 'blkFSender'), previousStatement: null, nextStatement: null, style: 'events' },
  ])
}

const ORDER = ['p1', 'p2', 'p3', 'p4', 'p5']

/** Blocks arrive one idea at a time: checking labels in P3, setting aside in P4, scoring by sender in P5. */
export function fairToolbox(lang: Lang, puzzleId = 'p1') {
  const at = ORDER.indexOf(puzzleId)
  const from = (p: string) => at < 0 || at >= ORDER.indexOf(p)
  const collect = (source: Source, label: Label): ToolboxBlock => ({ kind: 'block', type: 'kk_f_collect', fields: { COUNT: 10, LABEL: label, SOURCE: source } })
  const data: ToolboxGroup = {
    label: 'catFData',
    style: 'data',
    blocks: [
      collect('8a', 'penting'),
      collect('8c', 'penting'),
      ...(from('p5') ? [collect('bimo', 'penting')] : []),
      ...(from('p3') ? [{ kind: 'block' as const, type: 'kk_f_check' }] : []),
      ...(from('p4') ? [{ kind: 'block' as const, type: 'kk_f_holdout', fields: { COUNT: 10 } }] : []),
    ],
  }
  const kata: ToolboxGroup = {
    label: 'catCKata',
    style: 'model',
    blocks: [
      { kind: 'block', type: 'kk_c_train' },
      { kind: 'block', type: 'kk_f_test', fields: { ON: '8c' } },
    ],
  }
  const check: ToolboxGroup = {
    label: 'catFCheck',
    style: 'events',
    blocks: [{ kind: 'block', type: 'kk_f_inspect' }, ...(from('p5') ? [{ kind: 'block' as const, type: 'kk_f_sender' }] : [])],
  }
  return buildToolbox(lang, [WHEN_RUN_GROUP, data, kata, check])
}

/** Session 3 starts where Session 1 ended: Kata trained on 8A, now tested on 8C. */
export const FAIR_STARTER: object = {
  blocks: fairProgram(
    ['kk_f_collect', { COUNT: 10, LABEL: 'penting', SOURCE: '8a' }],
    ['kk_f_collect', { COUNT: 10, LABEL: 'santai', SOURCE: '8a' }],
    ['kk_c_train'],
    ['kk_f_test', { ON: '8c' }],
  ),
}

const asLabel = (v: unknown): Label => (v === 'santai' ? 'santai' : 'penting')
const num = (v: unknown, max: number) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)))
const asSource = (v: unknown): Source => (SOURCES.includes(v as Source) ? (v as Source) : '8a')
const asSet = (v: unknown): TestSet => (TEST_SETS.includes(v as TestSet) ? (v as TestSet) : '8c')

/** Reads the steps under "when run", as data. */
export function readFairProgram(ws: Blockly.Workspace): Step[] | null {
  const hat = findHat(ws)
  if (!hat) return null
  const steps: Step[] = []
  for (let b = hat.getNextBlock(); b; b = b.getNextBlock()) {
    if (!b.isEnabled()) continue
    if (b.type === 'kk_f_collect')
      steps.push({ kind: 'collect', count: num(b.getFieldValue('COUNT'), MAX_COLLECT), label: asLabel(b.getFieldValue('LABEL')), source: asSource(b.getFieldValue('SOURCE')), id: b.id })
    else if (b.type === 'kk_f_check') steps.push({ kind: 'checkLabels', id: b.id })
    else if (b.type === 'kk_f_holdout') steps.push({ kind: 'holdout', count: num(b.getFieldValue('COUNT'), MAX_HOLDOUT), id: b.id })
    else if (b.type === 'kk_c_train') steps.push({ kind: 'train', id: b.id })
    else if (b.type === 'kk_f_test') steps.push({ kind: 'test', on: asSet(b.getFieldValue('ON')), id: b.id })
    else if (b.type === 'kk_f_inspect') steps.push({ kind: 'inspect', id: b.id })
    else if (b.type === 'kk_f_sender') steps.push({ kind: 'bySender', id: b.id })
  }
  return steps
}
