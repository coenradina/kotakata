import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CardId } from '../i18n'
import { EMPTY, createLocalStore, memoryStorage, type Progress } from './progress'
import { createSyncedStore, mergeProgress, prefixed, pullInto, type Remote } from './sync'

const legacy = { level1Cards: [] as CardId[], mainPuzzles: () => [] }
const valid: CardId[] = ['dataset', 'label', 'token']
const local = (kv = memoryStorage()) => createLocalStore(kv, legacy, valid)

function fakeRemote(progress: Partial<Progress> | null = null, blocks: Record<string, string> = {}) {
  const saved: { progress: Progress[]; blocks: [string, string][] } = { progress: [], blocks: [] }
  const remote: Remote = {
    load: async () => ({ progress, blocks }),
    saveProgress: async (p) => void saved.progress.push(p),
    saveBlocks: async (id, json) => void saved.blocks.push([id, json]),
  }
  return { remote, saved }
}

describe('mergeProgress', () => {
  it('keeps everything either copy has, and this device’s settings', () => {
    const here: Progress = { ...EMPTY, cards: ['dataset'], passed: ['s1'], puzzlesDone: { s1: ['a'] }, stars: { dataset: 1 }, speed: 2 }
    const there: Partial<Progress> = { cards: ['label', 'dataset'], passed: ['s2'], puzzlesDone: { s1: ['b'], s2: ['x'] }, stars: { dataset: 3, label: 2 }, speed: 0.5, tourDone: true }
    const m = mergeProgress(here, there)
    expect(m.cards).toEqual(['dataset', 'label'])
    expect(m.passed).toEqual(['s1', 's2'])
    expect(m.puzzlesDone).toEqual({ s1: ['a', 'b'], s2: ['x'] })
    expect(m.stars).toEqual({ dataset: 3, label: 2 })
    expect(m.speed).toBe(2)
    expect(m.tourDone).toBe(true)
  })
  it('leaves the local copy alone when the server has none', () => {
    const here = { ...EMPTY, cards: ['token'] as CardId[] }
    expect(mergeProgress(here, null)).toBe(here)
  })
})

describe('prefixed storage', () => {
  it('keeps each profile apart on one device', () => {
    const kv = memoryStorage()
    const a = local(prefixed(kv, 'p.a.'))
    const b = local(prefixed(kv, 'p.b.'))
    a.save({ cards: ['dataset'] })
    expect(b.load().cards).toEqual([])
    expect(local(kv).load().cards).toEqual([])
    expect(a.load().cards).toEqual(['dataset'])
  })
})

describe('pullInto', () => {
  it('fills a new device from the server, blocks included, and says when the server is behind', async () => {
    const store = local()
    const { remote } = fakeRemote({ cards: ['label'], passed: ['s1'] }, { s1: JSON.stringify({ blocks: 1 }), s2: 'not json' })
    expect(await pullInto(store, remote)).toBe(false)
    expect(store.load().cards).toEqual(['label'])
    expect(store.loadBlocks('s1')).toEqual({ blocks: 1 })
    expect(store.loadBlocks('s2')).toBeNull()

    store.save({ cards: ['label', 'token'] })
    expect(await pullInto(store, remote)).toBe(true)
  })
  it('keeps this device’s blocks over the server’s', async () => {
    const store = local()
    store.saveBlocks('s1', { mine: true })
    await pullInto(store, fakeRemote(null, { s1: JSON.stringify({ theirs: true }) }).remote)
    expect(store.loadBlocks('s1')).toEqual({ mine: true })
  })
})

describe('createSyncedStore', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('saves locally at once and sends one copy a moment later', async () => {
    const { remote, saved } = fakeRemote()
    const s = createSyncedStore(local(), remote, 1000)
    s.save({ cards: ['dataset'] })
    s.save({ passed: ['s1'] })
    s.saveBlocks('s1', { a: 1 })
    expect(s.load().cards).toEqual(['dataset'])
    expect(saved.progress).toHaveLength(0)
    await vi.advanceTimersByTimeAsync(1000)
    expect(saved.progress).toHaveLength(1)
    expect(saved.progress[0]).toMatchObject({ cards: ['dataset'], passed: ['s1'] })
    expect(saved.blocks).toEqual([['s1', '{"a":1}']])
  })

  it('retries a failed write with the next flush', async () => {
    let fail = true
    const sent: Progress[] = []
    const remote: Remote = {
      load: async () => ({ progress: null, blocks: {} }),
      saveProgress: async (p) => {
        if (fail) throw new Error('offline')
        sent.push(p)
      },
      saveBlocks: async () => {},
    }
    const s = createSyncedStore(local(), remote, 1000)
    s.save({ cards: ['token'] })
    await s.flush()
    expect(sent).toHaveLength(0)
    fail = false
    await s.flush()
    expect(sent[0].cards).toEqual(['token'])
  })

  it('clears the server copy too when the player starts over', async () => {
    const { remote, saved } = fakeRemote()
    const s = createSyncedStore(local(), remote, 1000)
    s.save({ cards: ['token'] })
    s.clear(['s1'])
    await s.flush()
    expect(saved.progress.at(-1)?.cards).toEqual([])
    expect(saved.blocks).toEqual([['s1', 'null']])
  })
})
