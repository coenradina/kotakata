import * as Blockly from 'blockly/core'
import * as MsgEn from 'blockly/msg/en'
import * as MsgId from 'blockly/msg/id'
import { t, type Lang } from '../i18n'
import type { Label, Step } from '../levels/train/model'

// Block colours come from the aastr.id palette.
const COLOURS = {
  events: '#B58900', // gold
  data: '#0D9488', // tosca
  model: '#881337', // maroon
}

export const theme = Blockly.Theme.defineTheme('kotakata', {
  name: 'kotakata',
  base: Blockly.Themes.Classic,
  blockStyles: {
    events: { colourPrimary: COLOURS.events, colourSecondary: '#D4A72C', colourTertiary: '#0F172A', hat: 'cap' },
    data: { colourPrimary: COLOURS.data, colourSecondary: '#14B8A6', colourTertiary: '#0F172A' },
    model: { colourPrimary: COLOURS.model, colourSecondary: '#9F1239', colourTertiary: '#0F172A' },
  },
  categoryStyles: {
    events: { colour: COLOURS.events },
    data: { colour: COLOURS.data },
    model: { colour: COLOURS.model },
  },
  componentStyles: {
    workspaceBackgroundColour: '#FDF6E3',
    toolboxBackgroundColour: '#EEE8D5',
    toolboxForegroundColour: '#0F172A',
    flyoutBackgroundColour: '#EEE8D5',
    flyoutForegroundColour: '#0F172A',
    flyoutOpacity: 0.96,
    scrollbarColour: '#0F172A',
    scrollbarOpacity: 0.3,
    insertionMarkerColour: '#0F172A',
    insertionMarkerOpacity: 0.3,
    cursorColour: '#0D9488',
  },
  fontStyle: { family: "'JetBrains Mono', monospace", weight: '700', size: 12 },
  startHats: true,
})

/** (Re)defines the Level 1 blocks with text in the given language. */
export function defineBlocks(lang: Lang) {
  Blockly.setLocale((lang === 'id' ? MsgId : MsgEn) as unknown as Record<string, string>)
  for (const type of ['kk_when_run', 'kk_collect', 'kk_train', 'kk_test']) delete Blockly.Blocks[type]

  Blockly.common.defineBlocksWithJsonArray([
    {
      type: 'kk_when_run',
      message0: t(lang, 'blkWhenRun'),
      nextStatement: null,
      style: 'events',
    },
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

const EVENT_BLOCKS = [{ kind: 'block', type: 'kk_when_run' }]
const DATA_BLOCKS = [
  { kind: 'block', type: 'kk_collect', fields: { COUNT: 3, LABEL: 'apple' } },
  { kind: 'block', type: 'kk_collect', fields: { COUNT: 3, LABEL: 'banana' } },
]
const MODEL_BLOCKS = [
  { kind: 'block', type: 'kk_train' },
  { kind: 'block', type: 'kk_test' },
]

/**
 * "All" comes first and shows every block, in sections. The other
 * categories filter the panel down to one kind of block.
 */
export function toolbox(lang: Lang): Blockly.utils.toolbox.ToolboxDefinition {
  const section = (key: 'catEvents' | 'catData' | 'catModel', style: string) => ({
    kind: 'label',
    text: t(lang, key).toUpperCase(),
    'web-class': `kk-section kk-section-${style}`,
  })
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: t(lang, 'catAll'),
        colour: '#0F172A',
        contents: [
          section('catEvents', 'events'),
          ...EVENT_BLOCKS,
          section('catData', 'data'),
          ...DATA_BLOCKS,
          section('catModel', 'model'),
          ...MODEL_BLOCKS,
        ],
      },
      { kind: 'category', name: t(lang, 'catEvents'), categorystyle: 'events', contents: EVENT_BLOCKS },
      { kind: 'category', name: t(lang, 'catData'), categorystyle: 'data', contents: DATA_BLOCKS },
      { kind: 'category', name: t(lang, 'catModel'), categorystyle: 'model', contents: MODEL_BLOCKS },
    ],
  }
}

/** Starter program: deliberately incomplete, so the first run teaches something. */
export const STARTER: object = {
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
 * Reads the steps attached under the first "when run" block. Blocks are read
 * as data, never turned into code and evaluated.
 */
export function readProgram(ws: Blockly.Workspace): Step[] | null {
  const hat = ws.getTopBlocks(true).find((b) => b.type === 'kk_when_run' && b.isEnabled())
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
