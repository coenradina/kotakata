import { describe, expect, it } from 'vitest'
import { PANEL_TOGGLE, SECTION_PREFIX, freshSections, panelContents, sectionOf, type ToolboxGroup } from './toolbox'

const groups: ToolboxGroup[] = [
  { label: 'catEvents', style: 'events', blocks: [{ kind: 'block', type: 'kk_when_run' }] },
  { label: 'catVSee', style: 'data', blocks: [{ kind: 'block', type: 'kk_v_dark' }, { kind: 'block', type: 'kk_v_edges' }] },
  { label: 'catVDo', style: 'model', blocks: [{ kind: 'block', type: 'kk_v_glasses' }] },
]
const state = (over = {}) => ({ open: true, closed: new Set<string>(), peek: null, fresh: new Set<string>(), ...over })
const types = (items: { kind: string; type?: string }[]) => items.filter((i) => i.kind === 'block').map((i) => i.type)
const headers = (items: { kind: string; text?: string; callbackKey?: string }[]) => items.filter((i) => i.kind === 'button').map((i) => i.text)

describe('the block panel', () => {
  it('starts with the fold button, then a header for each section and its blocks', () => {
    const items = panelContents('en', groups, state()) as { kind: string; type?: string; text?: string; callbackKey?: string }[]
    expect(items[0]).toMatchObject({ kind: 'button', callbackKey: PANEL_TOGGLE, text: '«' })
    expect(items.filter((i) => i.callbackKey?.startsWith(SECTION_PREFIX))).toHaveLength(3)
    expect(types(items)).toEqual(['kk_when_run', 'kk_v_dark', 'kk_v_edges', 'kk_v_glasses'])
  })
  it('hides a closed section and says how many blocks it holds', () => {
    const items = panelContents('en', groups, state({ closed: new Set(['catVSee']) })) as { kind: string; type?: string; text?: string }[]
    expect(types(items)).toEqual(['kk_when_run', 'kk_v_glasses'])
    expect(headers(items)[2]).toMatch(/^▸ .* · 2$/)
    expect(headers(items)[1]).toMatch(/^▾ /)
  })
  it('folded, shows only icons, plus the section the player tapped', () => {
    const folded = panelContents('en', groups, state({ open: false })) as { kind: string; type?: string; text?: string }[]
    expect(types(folded)).toEqual([])
    expect(headers(folded)).toEqual(['»', '▶', '👁', '🕶'])
    const peeking = panelContents('en', groups, state({ open: false, peek: 'catVDo' })) as { kind: string; type?: string }[]
    expect(types(peeking)).toEqual(['kk_v_glasses'])
  })
  it('marks sections with a new block', () => {
    const items = panelContents('en', groups, state({ fresh: new Set(['catVSee']) })) as { kind: string; text?: string }[]
    expect(headers(items)[2]).toMatch(/✨$/)
  })
  it('finds the section a block is in', () => {
    expect(sectionOf(groups, 'kk_v_edges')).toBe('catVSee')
    expect(sectionOf(groups, 'nope')).toBeNull()
  })
  it('knows which sections gained a block since the last stage', () => {
    const before = [groups[0], { ...groups[1], blocks: [groups[1].blocks[0]] }, groups[2]]
    expect([...freshSections(before, groups)]).toEqual(['catVSee'])
    expect([...freshSections(null, groups)]).toEqual([])
  })
})
