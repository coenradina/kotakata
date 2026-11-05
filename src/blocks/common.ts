import * as Blockly from 'blockly/core'
import * as MsgEn from 'blockly/msg/en'
import * as MsgId from 'blockly/msg/id'
import { t, type Key, type Lang } from '../i18n'

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

/** Blockly's own UI text (context menus and so on) in the player's language. */
export function setBlocklyLocale(lang: Lang) {
  Blockly.setLocale((lang === 'id' ? MsgId : MsgEn) as unknown as Record<string, string>)
}

/** Defines blocks from JSON, replacing any earlier definition of the same type. */
export function defineJsonBlocks(defs: { type: string; [k: string]: unknown }[]) {
  for (const d of defs) delete Blockly.Blocks[d.type]
  Blockly.common.defineBlocksWithJsonArray(defs)
}

/** The "when ▶ clicked" block every level starts from. */
export function defineWhenRun(lang: Lang) {
  defineJsonBlocks([{ type: 'kk_when_run', message0: t(lang, 'blkWhenRun'), nextStatement: null, style: 'events' }])
}

export type ToolboxBlock = { kind: 'block'; type: string; fields?: Record<string, unknown> }
export interface ToolboxGroup {
  label: Key
  style: 'events' | 'data' | 'model'
  blocks: ToolboxBlock[]
}

/**
 * "All" comes first and shows every block, in coloured sections. The other
 * categories filter the panel down to one group.
 */
export function buildToolbox(lang: Lang, groups: ToolboxGroup[]): Blockly.utils.toolbox.ToolboxDefinition {
  const section = (g: ToolboxGroup) => ({
    kind: 'label',
    text: t(lang, g.label).toUpperCase(),
    'web-class': `kk-section kk-section-${g.style}`,
  })
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: t(lang, 'catAll'),
        colour: '#0F172A',
        contents: groups.flatMap((g) => [section(g), ...g.blocks]),
      },
      ...groups.map((g) => ({ kind: 'category', name: t(lang, g.label), categorystyle: g.style, contents: g.blocks })),
    ],
  }
}

export const WHEN_RUN_GROUP: ToolboxGroup = { label: 'catEvents', style: 'events', blocks: [{ kind: 'block', type: 'kk_when_run' }] }

/** The enabled "when run" block the program hangs from, if there is one. */
export function findHat(ws: Blockly.Workspace) {
  return ws.getTopBlocks(true).find((b) => b.type === 'kk_when_run' && b.isEnabled()) ?? null
}
