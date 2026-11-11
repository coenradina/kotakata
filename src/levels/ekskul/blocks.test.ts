import { beforeAll, describe, expect, it, vi } from 'vitest'
import * as Blockly from 'blockly/core'

// Vitest loads CSS files empty, so the block theme gets a stand-in colour.
vi.mock('../../theme', async (actual) => ({ ...(await actual<typeof import('../../theme')>()), css: () => '#000000' }))
import { defineWhenRun } from '../../blocks/common'
import { defineEkskulBlocks, readEkskulProgram } from './blocks'
import { ekskulProgram, type Node } from './program'
import { EKSKUL_STAGES, runPuzzle } from './stages'
import type { Program, Tree } from './model'
import type { Run } from '../types'

const TEAM_FIRST: Node = { ask: 'team', yes: { rec: 'basket' }, no: { ask: 'music', yes: { rec: 'choir' }, no: { rec: 'robot' } } }
const EXPLAIN: [string, Record<string, unknown>] = ['kk_e_explain', { WHO: 'dinda' }]

/** Hat, then the steps before the tree, the tree, and the steps after it. */
function chain(before: [string, Record<string, unknown>?][], tree: Node | null, after: [string, Record<string, unknown>?][] = []) {
  const state = ekskulProgram(before, tree ?? undefined)
  if (!after.length) return state
  const tail = ekskulProgram(after).blocks[0] as { next: object }
  let end = state.blocks[0] as { next?: { block: { next?: unknown } } }
  while (end.next) end = end.next.block as typeof end
  ;(end as { next?: unknown }).next = tail.next
  return state
}

const settle = () => new Promise((r) => setTimeout(r, 0))
/** Loads a saved workspace, or a program from `ekskulProgram`. */
async function load(state: object) {
  const ws = new Blockly.Workspace()
  Blockly.serialization.workspaces.load('languageVersion' in state ? { blocks: state } : state, ws)
  await settle()
  return ws
}
const byType = (ws: Blockly.Workspace, type: string) => ws.getAllBlocks(true).filter((b) => b.type === type)
const canConnect = (ws: Blockly.Workspace, a: Blockly.Connection | null, b: Blockly.Connection | null) => !!a && !!b && ws.connectionChecker.canConnect(a, b, false)

/** The program without block ids, to compare two layouts. */
function shape(p: Program | null) {
  const strip = (t: Tree | null): unknown => (!t ? null : t.kind === 'leaf' ? t.ekskul : { q: t.q, yes: strip(t.yes), no: strip(t.no) })
  return p && { ...p, tree: strip(p.tree), ids: {} }
}

beforeAll(() => {
  defineWhenRun('en')
  defineEkskulBlocks('en')
})

describe('Session 4 block placement', () => {
  it('reads "explain" after the tree the same as before it', async () => {
    const before = readEkskulProgram(await load(chain([EXPLAIN], TEAM_FIRST)))
    const after = readEkskulProgram(await load(chain([], TEAM_FIRST, [EXPLAIN])))
    expect(after?.explain).toEqual(['dinda'])
    expect(shape(after)).toEqual(shape(before))
  })

  it('passes stage 2 with "explain" under the tree', async () => {
    const p = readEkskulProgram(await load(chain([], TEAM_FIRST, [EXPLAIN])))!
    const raw = runPuzzle(p, 'p2')
    const run = { raw, events: [raw], accuracy: null, passed: false, context: null } as Run
    expect(EKSKUL_STAGES.find((s) => s.id === 'p2')!.check(p, run)).toBe(true)
  })

  it('lets settings go under the tree, but not under a question or suggestion in a branch', async () => {
    const ws = await load(chain([], TEAM_FIRST))
    const [root, inner] = byType(ws, 'kk_e_ask')
    const explain = ws.newBlock('kk_e_explain')
    expect(canConnect(ws, explain.previousConnection, root.nextConnection)).toBe(true)
    // Branch blocks have no notch underneath.
    expect(inner.nextConnection).toBeNull()
    for (const rec of byType(ws, 'kk_e_rec')) expect(rec.nextConnection).toBeNull()
    // And settings don't fit in a branch.
    expect(canConnect(ws, explain.previousConnection, inner.getInput('YES')!.connection)).toBe(false)
  })

  it('keeps one tree: a question fits a branch or the chain, never under another question', async () => {
    const ws = await load(chain([], TEAM_FIRST, [EXPLAIN]))
    const [root] = byType(ws, 'kk_e_ask')
    const explain = byType(ws, 'kk_e_explain')[0]
    const spare = ws.newBlock('kk_e_ask')
    expect(canConnect(ws, spare.previousConnection, root.nextConnection)).toBe(false)
    // "explain" sits after the tree, so a second tree can't hang under it.
    expect(canConnect(ws, spare.previousConnection, explain.nextConnection)).toBe(false)
    // Before the tree, a setting can still take it.
    const top = await load(chain([EXPLAIN], null))
    expect(canConnect(top, top.newBlock('kk_e_ask').previousConnection, byType(top, 'kk_e_explain')[0].nextConnection)).toBe(true)
  })

  it('moves a tree into a branch without what was stacked under it', async () => {
    const ws = await load(chain([], TEAM_FIRST, [EXPLAIN]))
    const [root] = byType(ws, 'kk_e_ask')
    const outer = ws.newBlock('kk_e_ask')
    root.unplug()
    outer.getInput('NO')!.connection!.connect(root.previousConnection!)
    await settle()
    expect(root.nextConnection).toBeNull()
    const explain = byType(ws, 'kk_e_explain')[0]
    expect(explain.getParent()).toBeNull()
    // Taken back out, it starts a tree again and takes settings under it.
    root.unplug()
    await settle()
    expect(root.nextConnection).not.toBeNull()
  })

  it('saves a branch block without its notch, and loads it back the same', async () => {
    const ws = await load(chain([], TEAM_FIRST))
    const again = await load(Blockly.serialization.workspaces.save(ws))
    expect(byType(again, 'kk_e_rec').every((b) => b.nextConnection === null)).toBe(true)
    expect(byType(again, 'kk_e_ask')[0].nextConnection).not.toBeNull()
  })
})
