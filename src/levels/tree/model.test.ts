import { describe, expect, it } from 'vitest'
import { depth, runTree, walk, GARDEN, type Question, type Tree } from './model'

let n = 0
const leaf = (pen: 'bird' | 'bee' | 'frog'): Tree => ({ kind: 'leaf', id: `l${n++}`, pen })
const ask = (q: Question, yes: Tree | null, no: Tree | null): Tree => ({
  kind: 'split',
  id: `s${n++}`,
  q,
  yes,
  no,
})

describe('decision tree garden', () => {
  it('passes with wings, then size', () => {
    const tree = ask('wings', ask('big', leaf('bird'), leaf('bee')), leaf('frog'))
    for (const seed of [1, 2, 3]) expect(runTree(tree, seed).passed).toBe(true)
    expect(depth(tree)).toBe(2)
  })

  it('fails when colour is used to tell birds from bees, because some birds are yellow', () => {
    const tree = ask('wings', ask('yellow', leaf('bee'), leaf('bird')), leaf('frog'))
    const r = runTree(tree, 1)
    expect(r.passed).toBe(false)
    expect(r.accuracy).toBe(10 / 12)
  })

  it('fails when "big" alone is used, because one frog is big', () => {
    const tree = ask('big', leaf('bird'), ask('wings', leaf('bee'), leaf('frog')))
    expect(runTree(tree, 1).accuracy).toBe(11 / 12)
  })

  it('sends critters on an empty branch nowhere, and warns', () => {
    const tree = ask('wings', ask('big', leaf('bird'), leaf('bee')), null)
    const r = runTree(tree, 1)
    expect(r.events.some((e) => e.kind === 'warn' && e.code === 'empty-branch')).toBe(true)
    expect(r.walks.filter((w) => w.pen === null)).toHaveLength(4)
  })

  it('warns when everything goes to one pen', () => {
    const r = runTree(leaf('bee'), 1)
    expect(r.events[0]).toEqual({ kind: 'warn', code: 'one-pen' })
    expect(r.accuracy).toBe(4 / 12)
  })

  it('records the path each critter took', () => {
    const tree = ask('wings', ask('big', leaf('bird'), leaf('bee')), leaf('frog'))
    const w = walk(tree, GARDEN[0])
    expect(w.path.map((p) => [p.q, p.yes])).toEqual([
      ['wings', true],
      ['big', true],
    ])
    expect(w.pen).toBe('bird')
  })

  it('has 4 of each critter, with overlapping colours', () => {
    expect(GARDEN.filter((c) => c.kind === 'bird' && c.colour === 'yellow')).toHaveLength(2)
    expect(GARDEN.filter((c) => c.kind === 'frog' && c.colour === 'brown')).toHaveLength(1)
    expect(GARDEN.filter((c) => c.kind === 'frog' && c.big)).toHaveLength(1)
  })
})
