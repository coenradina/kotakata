import type * as Blockly from 'blockly/core'
import { buildToolbox, defineJsonBlocks, findHat, WHEN_RUN_GROUP, type ToolboxBlock, type ToolboxGroup } from '../../blocks/common'
import { t, type Key, type Lang } from '../../i18n'
import { STRICT_LEVELS, type Program, type Settings } from './model'
import { PROPOSALS } from './program'

/** Each decision block: its setting, field and choices. */
const DECISIONS: { type: string; key: Key; setting: keyof Settings; options: [Key | null, string][]; style: string }[] = [
  { type: 'kk_o_attend', key: 'blkOAttend', setting: 'attend', style: 'data', options: [['oAttendCamera', 'camera'], ['oAttendQr', 'qr'], ['oAttendCall', 'call']] },
  { type: 'kk_o_strict', key: 'blkOStrict', setting: 'strict', style: 'data', options: STRICT_LEVELS.map((n) => [null, String(n)]) },
  { type: 'kk_o_flag', key: 'blkOFlag', setting: 'flag', style: 'model', options: [['oFlagZero', 'zero'], ['oFlagTalk', 'talk']] },
  { type: 'kk_o_unsure', key: 'blkOUnsure', setting: 'unsure', style: 'data', options: [['oUnsureAnswer', 'answer'], ['oUnsureHandoff', 'handoff']] },
  { type: 'kk_o_review', key: 'blkOReview', setting: 'review', style: 'model', options: [['oReviewDirect', 'direct'], ['oReviewAll', 'all']] },
  { type: 'kk_o_recog', key: 'blkORecog', setting: 'recog', style: 'data', options: [['oRecogOn', 'on'], ['oRecogOff', 'off']] },
  { type: 'kk_o_keep', key: 'blkOKeep', setting: 'keep', style: 'model', options: [['oKeepForever', 'forever'], ['oKeepWeek', 'week']] },
  { type: 'kk_o_access', key: 'blkOAccess', setting: 'access', style: 'model', options: [['oAccessAnyone', 'anyone'], ['oAccessIncident', 'incident']] },
]
const BY_TYPE = new Map(DECISIONS.map((d) => [d.type, d]))

export function defineOsisBlocks(lang: Lang) {
  defineJsonBlocks(
    DECISIONS.map((d) => ({
      type: d.type,
      message0: t(lang, d.key),
      args0: [{ type: 'field_dropdown', name: 'V', options: d.options.map(([k, v]) => [k ? t(lang, k) : v, v]) }],
      previousStatement: null,
      nextStatement: null,
      style: d.style,
    })),
  )
}

export function osisToolbox(lang: Lang, puzzleId = 'p1') {
  const b = (type: string, v: string): ToolboxBlock => ({ kind: 'block', type, fields: { V: v } })
  const groups: Record<string, ToolboxGroup> = {
    attend: { label: 'catOAttend', style: 'data', blocks: [b('kk_o_attend', 'camera')] },
    essay: { label: 'catOEssay', style: 'data', blocks: [b('kk_o_strict', '5'), ...(puzzleId !== 'p2' ? [b('kk_o_flag', 'zero')] : [])] },
    chat: { label: 'catOChat', style: 'data', blocks: [b('kk_o_unsure', 'answer'), b('kk_o_review', 'direct')] },
    gate: { label: 'catOGate', style: 'data', blocks: [b('kk_o_recog', 'on'), b('kk_o_keep', 'forever'), b('kk_o_access', 'anyone')] },
  }
  const pick = { p1: ['attend'], p2: ['essay'], p3: ['essay'], p4: ['chat'], p5: ['gate'] }[puzzleId] ?? ['attend', 'essay', 'chat', 'gate']
  return buildToolbox(lang, [WHEN_RUN_GROUP, ...pick.map((k) => groups[k])])
}

export const OSIS_STARTER: object = { blocks: PROPOSALS.p1 }

/** Reads the decisions. The last block for a setting wins. */
export function readOsisProgram(ws: Blockly.Workspace): Program | null {
  const hat = findHat(ws)
  if (!hat) return null
  const p: Program = { ids: {} }
  for (let bl = hat.getNextBlock(); bl; bl = bl.getNextBlock()) {
    if (!bl.isEnabled()) continue
    const d = BY_TYPE.get(bl.type)
    if (!d) continue
    const v = String(bl.getFieldValue('V'))
    ;(p as Record<string, unknown>)[d.setting] = d.setting === 'strict' ? Number(v) : v
    p.ids[d.setting] = bl.id
  }
  return p
}
