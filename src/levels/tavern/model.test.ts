import { describe, expect, it } from 'vitest'
import { boringStory, nextProbabilities, runTavern, type Step, type Token } from './model'

const start = (token: Token): Step => ({ kind: 'start', token, id: 'st' })
const temp = (value: number): Step => ({ kind: 'temp', value, id: 't' })
const ctx = (value: number): Step => ({ kind: 'context', value, id: 'c' })
const write = (n: number): Step => ({ kind: 'write', n, id: 'w' })

describe('token tavern', () => {
  it('turns counts into probabilities that add up to 1', () => {
    const { candidates } = nextProbabilities(['the'], 1, 1)
    expect(candidates[0].token).toBe('cat')
    expect(candidates[0].p).toBeCloseTo(3 / 8)
    expect(candidates.reduce((a, c) => a + c.p, 0)).toBeCloseTo(1)
  })

  it('puts everything on the top token at temperature 0', () => {
    const { candidates } = nextProbabilities(['the'], 1, 0)
    expect(candidates[0]).toEqual({ token: 'cat', p: 1 })
  })

  it('flattens the odds at a high temperature', () => {
    const cold = nextProbabilities(['the'], 1, 0.5).candidates[0].p
    const hot = nextProbabilities(['the'], 1, 2).candidates[0].p
    expect(cold).toBeGreaterThan(hot)
  })

  it('loops with a one-word memory at temperature 0', () => {
    const r = runTavern([start('the'), temp(0), ctx(1), write(8)], 1)
    expect(r.story.slice(0, 6)).toEqual(['the', 'cat', 'sleeps', 'by', 'the', 'cat'])
    expect(r.looped).toBe(true)
    expect(r.finished).toBe(false)
  })

  it('finishes the sentence with a two-word memory', () => {
    const r = runTavern([start('the'), temp(0), ctx(2), write(8)], 1)
    expect(r.story).toEqual(['the', 'cat', 'sleeps', 'by', 'the', 'fire', 'end'])
    expect(r.finished).toBe(true)
    expect(r.looped).toBe(false)
  })

  it('tells the same story every time at temperature 0', () => {
    const p = [start('the'), temp(0), write(5)]
    expect(runTavern(p, 1).story).toEqual(runTavern(p, 99).story)
    expect(boringStory(p)).toEqual(runTavern(p, 7).story)
  })

  it('tells different stories at temperature 1, depending on luck', () => {
    const p = [start('the'), temp(1), ctx(2), write(6)]
    const stories = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((seed) => runTavern(p, seed).story.join(' ')))
    expect(stories.size).toBeGreaterThan(1)
  })

  it('stops at the full stop even when more tokens were asked for', () => {
    const r = runTavern([start('the'), temp(0), ctx(2), write(20)], 1)
    expect(r.picks).toHaveLength(6)
  })
})
