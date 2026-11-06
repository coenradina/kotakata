import { describe, expect, it } from 'vitest'
import { EMPTY, STRICT_LEVELS, moodOf, runOsis, runPlan, DEFAULTS, type Program, type Settings } from './model'
import { OSIS_STAGES, runPuzzle, worst } from './stages'
import { chooseOsisHint } from './hints'
import type { Run } from '../types'

const set = (s: Partial<Settings>): Program => ({ ...s, ids: {} })
const asRun = (p: Program, puzzle: string) => {
  const raw = runPuzzle(p, puzzle)
  return { raw, lang: 'id', events: [raw], accuracy: null, passed: false, context: null } as Run
}
const stage = (id: string) => OSIS_STAGES.find((s) => s.id === id)!
const passes = (p: Program, puzzle: string) => stage(puzzle).check(p, asRun(p, puzzle))
const BEST: Partial<Settings> = { attend: 'qr', strict: 8, flag: 'talk', unsure: 'handoff', review: 'direct', recog: 'off', keep: 'week', access: 'incident' }

describe('Session 6 balance', () => {
  it('P1: only the QR card is acceptable; the camera and the roll call are not', () => {
    expect(passes(set({ attend: 'camera' }), 'p1')).toBe(false)
    expect(passes(set({ attend: 'call' }), 'p1')).toBe(false)
    expect(passes(set({ attend: 'qr' }), 'p1')).toBe(true)
    expect(passes(EMPTY, 'p1')).toBe(false)
  })
  it('P2: with automatic zeros, only strictness 8 balances catching and accusing', () => {
    const ok = STRICT_LEVELS.filter((n) => passes(set({ strict: n }), 'p2'))
    expect(ok).toEqual([8])
  })
  it('P3: in the formal class no strictness works with automatic zeros; a teacher talking first makes 7 or 8 work', () => {
    expect(STRICT_LEVELS.filter((n) => passes(set({ strict: n }), 'p3'))).toEqual([])
    expect(STRICT_LEVELS.filter((n) => passes(set({ strict: n, flag: 'talk' }), 'p3'))).toEqual([7, 8])
  })
  it('P4: hand the unknown questions to a teacher, without checking every answer', () => {
    expect(passes(set({ unsure: 'handoff' }), 'p4')).toBe(true)
    expect(passes(set({}), 'p4')).toBe(false)
    expect(passes(set({ review: 'all' }), 'p4')).toBe(false)
    expect(passes(set({ unsure: 'handoff', review: 'all' }), 'p4')).toBe(false)
  })
  it('P5: a gate camera passes only without face recognition, kept 7 days, watched after incidents', () => {
    const combos = (['on', 'off'] as const).flatMap((recog) => (['forever', 'week'] as const).flatMap((keep) => (['anyone', 'incident'] as const).map((access) => ({ recog, keep, access }))))
    const ok = combos.filter((c) => passes(set(c), 'p5'))
    expect(ok).toEqual([{ recog: 'off', keep: 'week', access: 'incident' }])
  })
  it('Sandbox: the stage answers together pass; any one wrong fails', () => {
    expect(passes(set(BEST), 'sandbox')).toBe(true)
    expect(passes(set({ ...BEST, attend: 'camera' }), 'sandbox')).toBe(false)
    expect(passes(set({ ...BEST, flag: 'zero' }), 'sandbox')).toBe(false)
  })
  it('no plan fills every meter', () => {
    for (const plan of ['attend', 'essay2', 'chat', 'gate'] as const) {
      const r = runPlan(plan, { ...DEFAULTS, ...BEST })
      expect(r.meters.some((m) => m.value < 100), plan).toBe(true)
    }
  })
})

describe('Session 6 characters', () => {
  it('the parent is the most upset by the first gate plan', () => {
    expect(worst(runOsis(EMPTY, 'p5'))?.who).toBe('joko')
  })
  it('someone who watches none of the meters has no view', () => {
    expect(moodOf('udin', runPlan('chat', DEFAULTS))).toBe('none')
  })
  it('the person watching the lowest meter is the one who objects', () => {
    expect(worst(runOsis(set({ attend: 'camera' }), 'p1'))).toMatchObject({ meter: 'privacy', value: 20 })
  })
})

describe('Session 6 predictions', () => {
  it('each is answered by the program the stage loads', () => {
    expect(stage('p1').prediction!.outcome(EMPTY, asRun(set({ attend: 'camera' }), 'p1'))).toBe(1)
    expect(stage('p2').prediction!.outcome(EMPTY, asRun(set({ strict: 5 }), 'p2'))).toBe(2)
    expect(stage('p3').prediction!.outcome(EMPTY, asRun(set({ strict: 8 }), 'p3'))).toBe(1)
    expect(stage('p4').prediction!.outcome(EMPTY, asRun(EMPTY, 'p4'))).toBe(1)
    expect(stage('p5').prediction!.outcome(EMPTY, asRun(EMPTY, 'p5'))).toBe(1)
  })
})

describe('Session 6 hints point at the decision behind the red meter', () => {
  const hint = (p: Program | null, puzzle: string) => chooseOsisHint(p, p ? runOsis(p, puzzle) : null)?.key
  it('follows the arc', () => {
    expect(hint(null, 'p1')).toBe('o_start')
    expect(hint(set({ attend: 'camera' }), 'p1')).toBe('o_attend')
    expect(hint(set({ strict: 5 }), 'p2')).toBe('o_strict')
    expect(hint(set({ strict: 8 }), 'p3')).toBe('o_flag')
    expect(hint({ strict: 8, flag: 'zero', ids: { flag: 'b1' } }, 'p3')).toBe('o_flagSet')
    expect(hint(set({ strict: 5, flag: 'talk' }), 'p3')).toBe('o_strict')
    expect(hint(EMPTY, 'p4')).toBe('o_unsure')
    expect(hint(set({ unsure: 'handoff', review: 'all' }), 'p4')).toBe('o_review')
    expect(hint(EMPTY, 'p5')).toBe('o_recog')
    expect(hint(set({ recog: 'off' }), 'p5')).toBe('o_access')
    expect(hint(set({ recog: 'off', access: 'incident' }), 'p5')).toBe('o_keep')
  })
})

describe('rung-3 examples pass their puzzles, Session 6', () => {
  // The programs the xO* texts describe.
  const examples: Record<string, Program> = {
    p1: set({ attend: 'qr' }),
    p2: set({ strict: 8 }),
    p3: set({ strict: 8, flag: 'talk' }),
    p4: set({ unsure: 'handoff', review: 'direct' }),
    p5: set({ keep: 'week', access: 'incident', recog: 'off' }),
    sandbox: set(BEST),
  }
  for (const st of OSIS_STAGES) it(st.id, () => expect(passes(examples[st.id], st.id)).toBe(true))
})
