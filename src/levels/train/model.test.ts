import { describe, expect, it } from 'vitest'
import { predict, run, train, type Step } from './model'

const good: Step[] = [
  { kind: 'collect', label: 'apple', count: 5 },
  { kind: 'collect', label: 'banana', count: 5 },
  { kind: 'train', rounds: 4 },
  { kind: 'test', count: 20 },
]

describe('train the robot', () => {
  it('passes with balanced data, enough rounds and a real test', () => {
    for (const seed of [1, 2, 3, 42, 99]) expect(run(good, seed).passed).toBe(true)
  })

  it('fails with only one round, because the robot starts with its guesses swapped', () => {
    const oneRound = good.map((s) => (s.kind === 'train' ? { ...s, rounds: 1 } : s))
    const passes = [1, 2, 3, 42, 99].filter((seed) => run(oneRound, seed).passed).length
    expect(passes).toBeLessThan(2)
  })

  it('calls everything an apple when it only ever saw apples', () => {
    const r = run(
      [{ kind: 'collect', label: 'apple', count: 8 }, { kind: 'train', rounds: 5 }, { kind: 'test', count: 20 }],
      7,
    )
    expect(r.accuracy).toBe(0.5)
    expect(r.passed).toBe(false)
    expect(r.events.some((e) => e.kind === 'warn' && e.code === 'one-label-only')).toBe(true)
  })

  it('warns when testing before training, and guesses nothing', () => {
    const r = run([{ kind: 'test', count: 10 }], 1)
    expect(r.events[0]).toEqual({ kind: 'warn', code: 'test-before-train' })
    expect(r.accuracy).toBe(0)
  })

  it('needs a test of at least 10 items to count as a pass', () => {
    const small = good.map((s) => (s.kind === 'test' ? { ...s, count: 5 } : s))
    expect(run(small, 1).passed).toBe(false)
  })

  it('keeps learning across separate train blocks', () => {
    const split: Step[] = [good[0], good[1], { kind: 'train', rounds: 2 }, { kind: 'train', rounds: 2 }, good[3]]
    expect(run(split, 1).accuracy).toBe(run(good, 1).accuracy)
  })

  it('predicts nothing before any training', () => {
    expect(predict({}, { x: 0.5, y: 0.5 })).toBeNull()
    expect(train([], 3)).toHaveLength(4)
  })
})
