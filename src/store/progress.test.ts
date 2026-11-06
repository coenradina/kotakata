import { describe, expect, it } from 'vitest'
import type { CardId } from '../i18n'
import { createLocalStore, memoryStorage, type Legacy } from './progress'

const legacy: Legacy = {
  level1Cards: ['dataset', 'label'],
  mainPuzzles: (id) => (id === 'train' ? ['collect', 'train', 'test'] : ['a', 'b']),
}
const valid: CardId[] = ['dataset', 'label', 'classification', 'token']

function setup(seed: Record<string, string> = {}) {
  const kv = memoryStorage()
  for (const [k, v] of Object.entries(seed)) kv.setItem(k, v)
  return { kv, store: createLocalStore(kv, legacy, valid) }
}

describe('local progress store', () => {
  it('starts empty', () => {
    const p = setup().store.load()
    expect(p.cards).toEqual([])
    expect(p.passed).toEqual([])
    expect(p.lastSession).toBeNull()
  })

  it('reads the keys older versions wrote', () => {
    const { store } = setup({
      'kotakata.cards': JSON.stringify(['dataset', 'token']),
      'kotakata.stages': JSON.stringify({ tavern: ['write'] }),
      'kotakata.level': JSON.stringify('tavern'),
      'kotakata.badges': JSON.stringify(['train:balanced']),
    })
    const p = store.load()
    expect(p.cards).toEqual(['dataset', 'token'])
    expect(p.puzzlesDone.tavern).toEqual(['write'])
    expect(p.lastSession).toBe('tavern')
    expect(p.badges).toEqual(['train:balanced'])
  })

  it("upgrades the old 'level1' card marker", () => {
    expect(setup({ 'kotakata.cards': 'level1' }).store.load().cards).toEqual(['dataset', 'label'])
  })

  it('drops card ids it no longer knows', () => {
    expect(setup({ 'kotakata.cards': JSON.stringify(['dataset', 'gone']) }).store.load().cards).toEqual(['dataset'])
  })

  it('treats the classification card as Level 1 passed, with its main puzzles done', () => {
    const p = setup({ 'kotakata.cards': JSON.stringify(['classification']) }).store.load()
    expect(p.passed).toContain('train')
    expect(p.puzzlesDone.train).toEqual(['collect', 'train', 'test'])
  })

  it('survives broken JSON', () => {
    const p = setup({ 'kotakata.cards': '{oops', 'kotakata.stars': '[' }).store.load()
    expect(p.cards).toEqual([])
    expect(p.stars).toEqual({})
  })

  it('saves a patch and reads it back', () => {
    const { store } = setup()
    store.save({ cards: ['token'], moments: { token: { n: 4 } }, lastSession: 'tree' })
    const p = store.load()
    expect(p.cards).toEqual(['token'])
    expect(p.moments.token).toEqual({ n: 4 })
    expect(p.lastSession).toBe('tree')
  })

  it('keeps blocks per session under the old key names', () => {
    const { kv, store } = setup()
    store.saveBlocks('train', { blocks: 1 })
    expect(kv.getItem('kotakata.level1.blocks')).toBe('{"blocks":1}')
    expect(store.loadBlocks('train')).toEqual({ blocks: 1 })
    expect(store.loadBlocks('s1')).toBeNull()
  })

  it('clears progress and blocks, but not the language', () => {
    const { kv, store } = setup({ 'kotakata.lang': 'en' })
    store.save({ cards: ['token'] })
    store.saveBlocks('tree', {})
    store.clear()
    expect(store.load().cards).toEqual([])
    expect(store.loadBlocks('tree')).toBeNull()
    expect(kv.getItem('kotakata.lang')).toBe('en')
  })
})
