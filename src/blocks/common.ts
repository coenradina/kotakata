import * as Blockly from 'blockly/core'
import * as MsgEn from 'blockly/msg/en'
import * as MsgId from 'blockly/msg/id'
import { t, type Key, type Lang } from '../i18n'
import { css } from '../theme'

// Block colours come from the aastr.id palette.
const COLOURS = {
  events: css('gold'), // gold
  data: css('tosca'), // tosca
  model: css('maroon'), // maroon
}

export const theme = Blockly.Theme.defineTheme('kotakata', {
  name: 'kotakata',
  base: Blockly.Themes.Classic,
  blockStyles: {
    events: { colourPrimary: COLOURS.events, colourSecondary: css('block-events-2'), colourTertiary: css('ink'), hat: 'cap' },
    data: { colourPrimary: COLOURS.data, colourSecondary: css('block-data-2'), colourTertiary: css('ink') },
    model: { colourPrimary: COLOURS.model, colourSecondary: css('block-model-2'), colourTertiary: css('ink') },
  },
  categoryStyles: {
    events: { colour: COLOURS.events },
    data: { colour: COLOURS.data },
    model: { colour: COLOURS.model },
  },
  componentStyles: {
    workspaceBackgroundColour: css('cream'),
    toolboxBackgroundColour: css('parchment'),
    toolboxForegroundColour: css('ink'),
    flyoutBackgroundColour: css('parchment'),
    flyoutForegroundColour: css('ink'),
    flyoutOpacity: 0.96,
    scrollbarColour: css('ink'),
    scrollbarOpacity: 0.3,
    insertionMarkerColour: css('ink'),
    insertionMarkerOpacity: 0.3,
    cursorColour: css('tosca'),
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
 * One always-open list of every block, in coloured sections. There is no
 * category column: sessions have few blocks, and the column took space the
 * player's program needs (usability finding M2).
 */
export function buildToolbox(lang: Lang, groups: ToolboxGroup[]): Blockly.utils.toolbox.ToolboxDefinition {
  const section = (g: ToolboxGroup) => ({
    kind: 'label',
    text: t(lang, g.label).toUpperCase(),
    'web-class': `kk-section kk-section-${g.style}`,
  })
  return { kind: 'flyoutToolbox', contents: groups.flatMap((g) => [section(g), ...g.blocks]) } as Blockly.utils.toolbox.ToolboxDefinition
}

export const WHEN_RUN_GROUP: ToolboxGroup = { label: 'catEvents', style: 'events', blocks: [{ kind: 'block', type: 'kk_when_run' }] }

/** The enabled "when run" block the program hangs from, if there is one. */
export function findHat(ws: Blockly.Workspace) {
  return ws.getTopBlocks(true).find((b) => b.type === 'kk_when_run' && b.isEnabled()) ?? null
}
