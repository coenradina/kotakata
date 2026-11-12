import { describe, expect, it } from 'vitest'
import { createImpact, type ImpactDeps } from './client'
import { addDays, aggregateDay, buildReport, daysBetween, emptyDay, jakartaDay, medianMs, isHidden, type StoredBatch } from './report'
import { cleanBatch, cleanEvent, MS_CAP, type Batch, type ImpactEvent } from './schema'

const RID = 'a'.repeat(32)
const RID2 = 'b'.repeat(32)

describe('cleanEvent', () => {
  it('keeps only the allowed fields', () => {
    expect(cleanEvent({ t: 'badge', session: 's1', badge: 'first', name: 'Dinda' })).toEqual({ t: 'badge', session: 's1', badge: 'first' })
  })
  it('rounds durations to 15 seconds and caps them', () => {
    const e = cleanEvent({ t: 'intro', session: 's1', ms: 22_000 })
    expect(e).toEqual({ t: 'intro', session: 's1', ms: 15_000 })
    expect(cleanEvent({ t: 'intro', session: 's1', ms: 99 * 60_000 })).toMatchObject({ ms: MS_CAP })
  })
  it('never lets the build time exceed the total', () => {
    expect(cleanEvent({ t: 'puzzle_pass', session: 's1', puzzle: 'p1', runs: 2, hint: 0, ms: 30_000, msBuild: 90_000 })).toMatchObject({ ms: 30_000, msBuild: 30_000 })
  })
  it('rejects free text and odd values', () => {
    expect(cleanEvent({ t: 'badge', session: 'Dinda Putri', badge: 'x' })).toBeNull()
    expect(cleanEvent({ t: 'page', path: 'https://evil.example', ref: null, firstPath: true, firstSite: true })).toBeNull()
    expect(cleanEvent({ t: 'run', session: 's1', puzzle: 'p1', n: 1, passed: true, prediction: null, outcome: null, hint: 5, ms: 0 })).toBeNull()
    expect(cleanEvent({ t: 'nope' })).toBeNull()
  })
})

describe('cleanBatch', () => {
  const envelope = { v: 1, lang: 'id', device: 'wide', app: 'abc123' }
  const page: ImpactEvent = { t: 'page', path: '/', ref: null, firstPath: true, firstSite: true }
  const badge: ImpactEvent = { t: 'badge', session: 's1', badge: 'first' }

  it('keeps only anonymous events without a research ID', () => {
    const out = cleanBatch({ ...envelope, rid: null, events: [page, badge] })
    expect(out?.batch.events).toEqual([page])
    expect(out?.dropped).toBe(1)
  })
  it('keeps play events with a research ID', () => {
    expect(cleanBatch({ ...envelope, rid: RID, events: [page, badge] })?.batch.events).toHaveLength(2)
  })
  it('rejects a bad envelope', () => {
    expect(cleanBatch({ ...envelope, rid: 'not-hex', events: [page] })).toBeNull()
    expect(cleanBatch({ ...envelope, rid: null, events: [] })).toBeNull()
    expect(cleanBatch({ ...envelope, v: 2, rid: null, events: [page] })).toBeNull()
    expect(cleanBatch({ ...envelope, rid: null, events: Array(51).fill(page) })).toBeNull()
  })
})

const batch = (rid: string | null, at: number, events: ImpactEvent[], device: 'phone' | 'wide' = 'wide'): StoredBatch => ({ rid, lang: 'id', device, events, at })
const pass = (puzzle: string, runs: number, hint: 0 | 1 | 2 | 3, ms: number, msBuild = 0): ImpactEvent => ({ t: 'puzzle_pass', session: 's1', puzzle, runs, hint, ms, msBuild })

describe('aggregateDay', () => {
  // Player A finishes S1; player B stops on p2; player C passes p1 then leaves; player D leaves at the intro.
  const day = aggregateDay(
    '2026-11-12',
    [
      batch(null, 1, [
        { t: 'page', path: '/', ref: 'google.com', firstPath: true, firstSite: true },
        { t: 'page', path: '/main/s1', ref: null, firstPath: true, firstSite: false },
        { t: 'page', path: '/main/s1', ref: null, firstPath: false, firstSite: false },
        { t: 'consent', yes: true },
      ]),
      batch(RID, 2, [
        { t: 'session_start', session: 's1', guide: true },
        { t: 'intro', session: 's1', ms: 30_000 },
        { t: 'puzzle_start', session: 's1', puzzle: 'p1' },
        { t: 'run', session: 's1', puzzle: 'p1', n: 1, passed: true, prediction: 0, outcome: 1, hint: 0, ms: 60_000 },
        pass('p1', 1, 0, 60_000, 45_000),
        { t: 'puzzle_start', session: 's1', puzzle: 'p2' },
        pass('p2', 3, 2, 120_000),
        { t: 'badge', session: 's1', badge: 'first' },
        { t: 'session_complete', session: 's1', ms: 600_000, badges: ['first'] },
        { t: 'quiz', session: 's1', q: 'dataset-what', result: 'wrong' },
      ]),
      batch(RID2, 3, [
        { t: 'session_start', session: 's1', guide: false },
        { t: 'puzzle_start', session: 's1', puzzle: 'p1' },
        pass('p1', 2, 1, 90_000),
        { t: 'puzzle_start', session: 's1', puzzle: 'p2' },
        { t: 'run', session: 's1', puzzle: 'p2', n: 1, passed: false, prediction: 1, outcome: 1, hint: 0, ms: 30_000 },
        { t: 'quiz', session: 's1', q: 'dataset-what', result: 'skip' },
      ]),
      batch('c'.repeat(32), 4, [{ t: 'session_start', session: 's1', guide: false }, { t: 'puzzle_start', session: 's1', puzzle: 'p1' }, pass('p1', 1, 0, 15_000)]),
      batch('d'.repeat(32), 5, [{ t: 'session_start', session: 's1', guide: false }]),
    ],
    [
      { role: 'student', session: 's1', fun: 5, clear: 3, stuck: ['blocks'], again: 'yes', essay: 'seru!', at: 10 },
      { role: 'teacher', session: null, fun: 4, clear: 4, stuck: [], again: 'maybe', essay: '  ', at: 11 },
    ],
  )

  it('counts traffic without IDs', () => {
    expect(day.traffic.views).toBe(3)
    expect(day.traffic.visitors).toBe(1)
    expect(day.traffic.paths['/main/s1']).toEqual({ views: 2, visitors: 1 })
    expect(day.traffic.refs).toEqual({ 'google.com': 1 })
    expect(day.consent).toEqual({ yes: 1, no: 0 })
  })

  it('counts each player once per session', () => {
    expect(day.players).toBe(4)
    expect(day.sessions.s1).toMatchObject({ started: 4, completed: 1, guide: 1, leftAtIntro: 1 })
    expect(day.sessions.s1.badges).toEqual({ first: 1 })
  })

  it('says where players stopped', () => {
    expect(day.puzzles['s1:p2']).toMatchObject({ reached: 2, passed: 1, stopped: 1 })
    expect(day.puzzles['s1:p1']).toMatchObject({ reached: 3, passed: 3, leftAfterPass: 1, firstTry: 2, runs: 4, hinted: 1 })
    expect(day.puzzles['s1:p1'].rungs).toEqual([2, 1, 0, 0])
  })

  it('counts wrong guesses', () => {
    expect(day.puzzles['s1:p1']).toMatchObject({ predicted: 1, predictedWrong: 1 })
    expect(day.puzzles['s1:p2']).toMatchObject({ predicted: 1, predictedWrong: 0 })
  })

  it('counts quiz answers and skips', () => {
    expect(day.quiz['s1:dataset-what']).toEqual({ right: 0, wrong: 1, skip: 1 })
  })

  it('sums the survey and keeps only real essays', () => {
    expect(day.survey.n).toBe(2)
    expect(day.survey.sessions.s1).toMatchObject({ n: 1, fun: 5, clear: 3, stuck: { blocks: 1 } })
    expect(day.survey.sessions.none.again).toEqual({ yes: 0, maybe: 1, no: 0 })
    expect(day.survey.essays.map((e) => e.text)).toEqual(['seru!'])
  })

  it('keeps durations as histograms', () => {
    expect(medianMs(day.puzzles['s1:p1'].time)).toBe(60_000)
    expect(medianMs(day.sessions.s1.time)).toBe(600_000)
    expect(medianMs({})).toBeNull()
  })

  it('adds days field by field', () => {
    const two = addDays([day, day])
    expect(two.sessions.s1.started).toBe(8)
    expect(two.puzzles['s1:p1'].rungs).toEqual([4, 2, 0, 0])
    expect(two.survey.essays).toHaveLength(2)
    expect(two.traffic.paths['/']).toEqual({ views: 2, visitors: 2 })
    expect(addDays([emptyDay(), day]).survey.essays).toHaveLength(1)
  })

  it('hides cells under K players', () => {
    const r = buildReport('2026-11-12', '2026-11-12', [{ day: '2026-11-12', agg: day }])
    expect(isHidden(r.sessions.s1)).toBe(true)
    expect(isHidden(r.puzzles['s1:p1'])).toBe(true)
    expect(isHidden(r.quiz['s1:dataset-what'])).toBe(true)
    expect(r.daily[0]).toMatchObject({ players: 0, views: 3 })
    const loose = buildReport('2026-11-12', '2026-11-12', [{ day: '2026-11-12', agg: day }], 2)
    expect(loose.sessions.s1).toMatchObject({ started: 4 })
    expect(isHidden(loose.puzzles['s1:p2'])).toBe(false)
  })
})

describe('days', () => {
  it('lists the days in a range', () => {
    expect(daysBetween('2026-02-27', '2026-03-01')).toEqual(['2026-02-27', '2026-02-28', '2026-03-01'])
  })
  it('uses Jakarta time', () => {
    expect(jakartaDay(Date.parse('2026-11-12T18:00:00Z'))).toBe('2026-11-13')
  })
})

function client(sendOk = true) {
  const store = new Map<string, string>()
  const sent: Batch[] = []
  let ok = sendOk
  let id = 0
  const deps: ImpactDeps = {
    storage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => void store.set(k, v), removeItem: (k) => void store.delete(k) },
    send: async (b) => {
      if (!ok) return false
      sent.push(b)
      return true
    },
    newId: () => String(++id).padStart(32, '0'),
    now: () => Date.parse('2026-11-12T03:00:00Z'),
    lang: () => 'id',
    device: () => 'phone',
    app: 'test',
  }
  return { impact: createImpact(deps), sent, store, setOk: (v: boolean) => (ok = v), deps }
}
const start: ImpactEvent = { t: 'session_start', session: 's1', guide: false }

describe('impact client', () => {
  it('sends nothing about play before a yes', async () => {
    const c = client()
    c.impact.track(start)
    c.impact.page('/', null)
    await c.impact.flush()
    expect(c.sent).toHaveLength(1)
    expect(c.sent[0].rid).toBeNull()
    expect(c.sent[0].events.map((e) => e.t)).toEqual(['page'])
  })

  it('sends play under a research ID and pages without one', async () => {
    const c = client()
    c.impact.setConsent(true)
    c.impact.page('/main/s1', 'google.com')
    c.impact.track(start)
    await c.impact.flush()
    expect(c.sent.map((b) => [b.rid, b.events.map((e) => e.t)])).toEqual([
      [null, ['consent', 'page']],
      ['0'.repeat(31) + '1', ['session_start']],
    ])
  })

  it('drops queued play events when the player says no', async () => {
    const c = client(false)
    c.impact.setConsent(true)
    c.impact.track(start)
    c.impact.setConsent(false)
    c.setOk(true)
    await c.impact.flush()
    expect(c.sent.flatMap((b) => b.events.map((e) => e.t))).toEqual(['consent', 'consent'])
  })

  it('keeps the queue when sending fails, across reloads', async () => {
    const c = client(false)
    c.impact.setConsent(true)
    c.impact.track(start)
    await c.impact.flush()
    expect(c.impact.pending()).toBe(2)
    const again = createImpact(c.deps)
    c.setOk(true)
    await again.flush()
    expect(again.pending()).toBe(0)
    expect(c.sent).toHaveLength(2)
  })

  it('marks the first visit of the day', async () => {
    const c = client()
    c.impact.page('/', null)
    c.impact.page('/main', null)
    c.impact.page('/', null)
    await c.impact.flush()
    expect(c.sent[0].events.map((e) => (e.t === 'page' ? [e.firstSite, e.firstPath] : null))).toEqual([
      [true, true],
      [false, true],
      [false, false],
    ])
  })

  it('remembers teacher guides, and forgets everything on request', async () => {
    const c = client()
    c.impact.setConsent(true)
    c.impact.rememberGuide('s1')
    expect(c.impact.guideSeen('s1')).toBe(true)
    c.impact.track(start)
    await c.impact.flush()
    const firstRid = c.sent.at(-1)!.rid
    c.impact.forget()
    expect(c.impact.guideSeen('s1')).toBe(false)
    c.impact.track(start)
    await c.impact.flush()
    expect(c.sent.at(-1)!.rid).not.toBe(firstRid)
  })
})
