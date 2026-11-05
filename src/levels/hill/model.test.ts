import { describe, expect, it } from 'vitest'
import { inValleyAfter, overshot, runHill, type Step } from './model'

const lr = (value: number): Step => ({ kind: 'lr', value, id: `lr${value}` })
const steps = (n: number): Step => ({ kind: 'steps', n, id: `s${n}` })

describe('hill of loss', () => {
  it('gets down the gentle hill with a small learning rate, given enough steps', () => {
    expect(inValleyAfter(runHill([lr(0.1), steps(3)], 'gentle', 30), 30)).toBe(false)
    expect(inValleyAfter(runHill([lr(0.1), steps(15)], 'gentle', 30), 30)).toBe(true)
  })

  it('needs a bigger learning rate when energy is short', () => {
    expect(inValleyAfter(runHill([lr(0.1), steps(20)], 'gentle', 6), 6)).toBe(false)
    expect(inValleyAfter(runHill([lr(0.2), steps(6)], 'gentle', 6), 6)).toBe(false)
    expect(inValleyAfter(runHill([lr(0.4), steps(6)], 'gentle', 6), 6)).toBe(true)
    expect(runHill([lr(0.1), steps(20)], 'gentle', 6).tired).toBe(true)
  })

  it('lands in one step with exactly the right learning rate', () => {
    expect(inValleyAfter(runHill([lr(0.5), steps(1)], 'gentle', 1), 1)).toBe(true)
    expect(inValleyAfter(runHill([lr(0.4), steps(1)], 'gentle', 1), 1)).toBe(false)
  })

  it('flies off the hill when the learning rate is far too big', () => {
    const r = runHill([lr(1.1), steps(10)], 'gentle', 30)
    expect(r.flewOff).toBe(true)
    expect(inValleyAfter(r, 30)).toBe(false)
    expect(overshot(r)).toBe(true)
  })

  it('on the steep hill, 0.4 bounces forever but 0.1 gets there', () => {
    const bouncy = runHill([lr(0.4), steps(10)], 'steep', 10)
    expect(inValleyAfter(bouncy, 10)).toBe(false)
    expect(overshot(bouncy)).toBe(true)
    expect(inValleyAfter(runHill([lr(0.1), steps(10)], 'steep', 10), 10)).toBe(true)
    expect(inValleyAfter(runHill([lr(0.5), steps(10)], 'steep', 10), 10)).toBe(false)
  })

  it('uses the default learning rate, and says so, when none is set', () => {
    const r = runHill([steps(2)], 'gentle', 30)
    expect(r.noLr).toBe(true)
    expect(r.moves[0].lr).toBe(0.1)
  })

  it('applies a learning-rate change to the steps after it', () => {
    const r = runHill([lr(0.4), steps(2), lr(0.02), steps(1)], 'gentle', 30)
    expect(r.moves.map((m) => m.lr)).toEqual([0.4, 0.4, 0.02])
  })

  it('checks a shorter energy budget on the same run', () => {
    const r = runHill([lr(0.4), steps(5)], 'gentle', 30)
    expect(inValleyAfter(r, 6)).toBe(true)
    expect(inValleyAfter(r, 1)).toBe(false)
  })
})
