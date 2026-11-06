// The block panel's contents, as plain data. Kept apart from common.ts so
// tests can use it without loading Blockly or the theme.

import type * as Blockly from 'blockly/core'
import { t, type Key, type Lang } from '../i18n'

export type ToolboxBlock = { kind: 'block'; type: string; fields?: Record<string, unknown> }
export interface ToolboxGroup {
  label: Key
  style: 'events' | 'data' | 'model'
  blocks: ToolboxBlock[]
}

/** One icon per section, for the folded panel. Unlisted sections use their colour's icon. */
const SECTION_ICON: Partial<Record<Key, string>> = {
  catEvents: '▶',
  catAsk: '❓',
  catPens: '🏠',
  catData: '📦',
  catModel: '🧠',
  catHill: '⛰',
  catTokSettings: '⚙',
  catTokWrite: '✍',
  catCData: '💬',
  catCKata: '🤖',
  catCRules: '📏',
  catFData: '📦',
  catFCheck: '🔍',
  catWAsk: '❓',
  catWSettings: '⚙',
  catWWrite: '✍',
  catWCheck: '🔍',
  catVSee: '👁',
  catVFilter: '🧹',
  catVDo: '🕶',
  catEAsk: '❓',
  catERec: '🏷',
  catELearn: '🌱',
  catEExplain: '💬',
  catOAttend: '📋',
  catOEssay: '📝',
  catOChat: '💬',
  catOGate: '🚪',
}
const STYLE_ICON = { events: '⚡', data: '🔷', model: '🔶' }
export const sectionIcon = (g: Pick<ToolboxGroup, 'label' | 'style'>) => SECTION_ICON[g.label] ?? STYLE_ICON[g.style]

/** What the panel shows: open or folded, which sections are closed, and which one is peeking out of a folded panel. */
export interface PanelState {
  open: boolean
  closed: ReadonlySet<string>
  peek: string | null
  /** Sections with a block that's new in this stage. */
  fresh: ReadonlySet<string>
}

export const PANEL_TOGGLE = 'kk-panel'
export const SECTION_PREFIX = 'kk-section:'

type Item = Blockly.utils.toolbox.ToolboxItemInfo

/**
 * The panel as one list. Each section starts with a header button: tap it
 * to open or close the section. Folded, the panel shows only the section
 * icons, plus the blocks of the section the player tapped.
 */
export function panelContents(lang: Lang, groups: ToolboxGroup[], state: PanelState): Item[] {
  const items: Item[] = [
    { kind: 'button', text: state.open ? '«' : '»', callbackKey: PANEL_TOGGLE, 'web-class': 'kk-panel-toggle' } as Item,
  ]
  for (const g of groups) {
    const showing = state.open ? !state.closed.has(g.label) : state.peek === g.label
    const icon = sectionIcon(g)
    const isNew = state.fresh.has(g.label)
    const text = state.open ? `${showing ? '▾' : '▸'} ${icon} ${t(lang, g.label).toUpperCase()}${showing ? '' : ` · ${g.blocks.length}`}${isNew ? ' ✨' : ''}` : `${icon}${isNew ? '✨' : ''}`
    items.push({ kind: 'button', text, callbackKey: `${SECTION_PREFIX}${g.label}`, 'web-class': `kk-section kk-section-${g.style}${state.open ? '' : ' kk-icon'}${showing ? ' kk-open' : ''}` } as Item)
    if (showing) items.push(...(g.blocks as Item[]))
  }
  return items
}

/** The section a block type is in, if any. */
export function sectionOf(groups: ToolboxGroup[], type: string): string | null {
  return groups.find((g) => g.blocks.some((b) => b.type === type))?.label ?? null
}

/** Sections holding a block type that the previous stage's panel didn't have. */
export function freshSections(before: ToolboxGroup[] | null, after: ToolboxGroup[]): Set<string> {
  if (!before) return new Set()
  const had = new Set(before.flatMap((g) => g.blocks.map((b) => `${b.type}|${JSON.stringify(b.fields ?? {})}`)))
  return new Set(after.filter((g) => g.blocks.some((b) => !had.has(`${b.type}|${JSON.stringify(b.fields ?? {})}`))).map((g) => g.label))
}

/**
 * Sessions describe their panel as groups. The editor turns them into the
 * flyout with `panelContents`; the groups travel inside the definition.
 */
export type GroupedToolbox = Blockly.utils.toolbox.ToolboxDefinition & { groups: ToolboxGroup[] }

export function buildToolbox(lang: Lang, groups: ToolboxGroup[]): GroupedToolbox {
  return { kind: 'flyoutToolbox', contents: panelContents(lang, groups, { open: true, closed: new Set(), peek: null, fresh: new Set() }), groups } as GroupedToolbox
}

export const WHEN_RUN_GROUP: ToolboxGroup = { label: 'catEvents', style: 'events', blocks: [{ kind: 'block', type: 'kk_when_run' }] }
