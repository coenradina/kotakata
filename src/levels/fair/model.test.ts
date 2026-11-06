import { describe, expect, it } from 'vitest'
import { FAIR_CORPUS } from './messages'
import { fairToAll, runFair, SENDERS, type Lang, type Source, type Step } from './model'
import { FAIR_STAGES, p1Passes, type FairRun } from './stages'
import { chooseFairHint } from './hints'

const LANGS: Lang[] = ['id', 'en']
const SEEDS = Array.from({ length: 60 }, (_, i) => i + 1)
const c = (label: 'penting' | 'santai', count: number, source: Source): Step => ({ kind: 'collect', label, count, source, id: `${label}-${count}-${source}` })
const both = (n: number, source: Source) => [c('penting', n, source), c('santai', n, source)]
const T: Step = { kind: 'train', id: 'train' }
const test = (on: Extract<Step, { kind: 'test' }>['on']): Step => ({ kind: 'test', on, id: `test-${on}` })
const check: Step = { kind: 'checkLabels', id: 'check' }
const holdout = (count: number): Step => ({ kind: 'holdout', count, id: 'hold' })
const inspect: Step = { kind: 'inspect', id: 'inspect' }
const bySender: Step = { kind: 'bySender', id: 'senders' }

const stage = (id: string) => FAIR_STAGES.find((s) => s.id === id)!
const asRun = (p: Step[], seed: number, lang: Lang): FairRun => {
  const raw = runFair(p, seed, lang)
  return { raw, events: [raw], accuracy: raw.accuracy, passed: false, context: null }
}
const rate = (p: Step[], lang: Lang, puzzle: string) => SEEDS.filter((s) => stage(puzzle).check(p, asRun(p, s, lang))).length / SEEDS.length
const median = (p: Step[], lang: Lang, f: (r: ReturnType<typeof runFair>) => number) => {
  const xs = SEEDS.map((s) => f(runFair(p, s, lang))).sort((a, b) => a - b)
  return xs[Math.floor(xs.length / 2)]
}

describe('the Session 3 corpus', () => {
  for (const lang of LANGS) {
    it(`${lang}: has the pools the puzzles need`, () => {
      const f = FAIR_CORPUS[lang]
      expect(f.cousin.test).toHaveLength(20)
      expect(f.cousin.history.length).toBeGreaterThanOrEqual(20)
      expect(f.donated.filter((d) => d.wrong).length).toBeGreaterThanOrEqual(8)
      for (const s of SENDERS) expect(f.everyone.filter((m) => m.from === s)).toHaveLength(6)
    })
  }
})

describe('the learner never changes, only its data', () => {
  it('checking labels fixes every wrong label it collected', () => {
    const r = runFair([...both(16, 'donated'), check, T, test('8a')], 1, 'id')
    expect(r.trainedOnWrong).toBe(0)
  })
  it('set-aside examples are not trained on', () => {
    const r = runFair([...both(10, '8a'), holdout(6), T, test('holdout')], 1, 'id')
    expect(r.examples).toBe(14)
    expect(r.lastTest?.size).toBe(6)
  })
})

// The balance targets from docs/plan/02-sessions.md, section 4.
describe('Session 3 balance', () => {
  for (const lang of LANGS) {
    const base = [...both(10, '8a'), T]
    it(`${lang} P1: Kata from 8A does clearly worse in 8C`, () => {
      expect(median([...base, test('8a')], lang, (r) => r.lastTest!.right)).toBeGreaterThanOrEqual(18)
      expect(median([...base, test('8c')], lang, (r) => r.lastTest!.right)).toBeLessThanOrEqual(15)
      expect(p1Passes([...base, test('8c'), inspect])).toBe(true)
      expect(p1Passes([...base, inspect, test('8c')])).toBe(false)
    })

    it(`${lang} P2: more of the same barely helps; a few 8C examples do`, () => {
      expect(rate([...both(20, '8a'), T, test('8c')], lang, 'p2')).toBeLessThanOrEqual(0.25)
      expect(rate([...both(10, '8a'), ...both(8, '8c'), T, test('8c')], lang, 'p2')).toBeGreaterThanOrEqual(0.95)
    })

    it(`${lang} P3: the joke labels break Kata; checking them fixes it`, () => {
      expect(rate([...both(16, 'donated'), T, test('8a')], lang, 'p3')).toBeLessThanOrEqual(0.05)
      expect(rate([...both(16, 'donated'), check, T, test('8a')], lang, 'p3')).toBe(1)
    })

    it(`${lang} P4: training data scores 100%, next week does not`, () => {
      const cheat = [...both(10, '8a'), ...both(8, '8c'), T, test('train')]
      expect(median(cheat, lang, (r) => r.lastTest!.right / r.lastTest!.size)).toBe(1)
      const lower = SEEDS.filter((s) => {
        const nw = runFair(cheat, s, lang).nextWeek!
        return nw.right < nw.size
      }).length
      expect(lower / SEEDS.length).toBeGreaterThanOrEqual(0.5)
      expect(rate(cheat, lang, 'p4')).toBe(0)
      expect(rate([...both(10, '8a'), ...both(8, '8c'), holdout(10), T, test('holdout')], lang, 'p4')).toBe(1)
    })

    it(`${lang} P5: a high average hides Bimo; Bimo's examples fix it`, () => {
      const unfair = [...both(10, '8a'), ...both(8, '8c'), T, bySender]
      for (const s of SEEDS) {
        const r = runFair(unfair, s, lang)
        expect(fairToAll(r.bySender)).toBe(false)
        expect(r.bySender!.bimo.right).toBeLessThan(5)
      }
      expect(rate([...both(10, '8a'), ...both(10, '8c'), ...both(5, 'bimo'), T, bySender], lang, 'p5')).toBeGreaterThanOrEqual(0.95)
    })

    it(`${lang} sandbox: 40 well-chosen examples are fair to everyone`, () => {
      expect(rate([...both(5, '8a'), ...both(10, '8c'), ...both(5, 'bimo'), T, bySender], lang, 'sandbox')).toBeGreaterThanOrEqual(0.95)
      expect(rate([...both(10, '8a'), ...both(10, '8c'), ...both(5, 'bimo'), T, bySender], lang, 'sandbox')).toBe(0)
    })
  }
})

describe('Session 3 hints', () => {
  const hint = (p: Step[] | null, puzzle: string) => chooseFairHint(p, p ? runFair(p, 1, 'id') : null, puzzle)?.key
  it('point at what each puzzle is missing', () => {
    expect(hint(null, 'p1')).toBe('f_start')
    expect(hint([...both(10, '8a'), test('8c')], 'p1')).toBe('f_train')
    expect(hint([...both(10, '8a'), T, test('8c')], 'p1')).toBe('f_inspect')
    expect(hint([...both(20, '8a'), T, test('8c')], 'p2')).toBe('f_collect8c')
    expect(hint([...both(16, 'donated'), T, test('8a')], 'p3')).toBe('f_check')
    expect(hint([...both(10, '8a'), T, test('train')], 'p4')).toBe('f_holdout')
    expect(hint([...both(10, '8a'), holdout(5), T, test('train')], 'p4')).toBe('f_testHoldout')
    expect(hint([...both(10, '8a'), T], 'p5')).toBe('f_sender')
    expect(hint([...both(10, '8a'), ...both(8, '8c'), T, bySender], 'p5')).toBe('f_collectBimo')
  })
})
