// Turns stored impact batches and survey answers into counts for the admin
// dashboard (docs/plan/03-technical.md, section 6). Shared by the
// `impactReport` function and its tests, so it must not import anything
// except the schema.
//
// One day becomes one `DayAgg`: only counts and histograms, no research IDs.
// Days add up field by field (`addDays`). `buildReport` can hide every cell
// fewer than K players make; `impactReport` passes 0, because only the
// admin reads the report.

import { MS_STEP, type Batch, type ImpactEvent } from './schema'

/** Bump when `aggregateDay` changes, so cached days are counted again. */
export const AGG_VERSION = 1
/** Cells with fewer players than this are hidden (k-anonymity). */
export const K = 5
/** Survey essays kept per day; the dashboard shows the newest. */
export const ESSAYS_PER_DAY = 100

/** Duration histogram: `MS_STEP`-sized bucket index → how many. */
export type Hist = Record<string, number>

export interface PageCount {
  views: number
  /** Browsers that opened this page for the first time that day. */
  visitors: number
}

export interface SessionAgg {
  /** Players (research IDs) who opened the session. */
  started: number
  completed: number
  /** Players who opened the teacher guide for this session on the same browser before playing it. */
  guide: number
  /** Players who left on the intro card, before the first puzzle. */
  leftAtIntro: number
  /** Active time from opening the session to completing it. */
  time: Hist
  intro: Hist
  /** Completers holding each badge at the end. */
  badges: Record<string, number>
}

export interface PuzzleAgg {
  reached: number
  passed: number
  /** Players whose last puzzle that day was this one, unpassed, in a session they didn't complete. */
  stopped: number
  /** Passed this one, then left before the next, in a session they didn't complete. */
  leftAfterPass: number
  /** Passed on their first run. */
  firstTry: number
  /** Runs it took, summed over passes. */
  runs: number
  /** Passes where a hint rung 1 to 3 had been shown. */
  hinted: number
  /** Passes by the strongest hint rung shown: [none, question, pointer, example]. */
  rungs: [number, number, number, number]
  /** Time to pass, and the part of it before the first run. */
  time: Hist
  build: Hist
  /** Runs that answered a prediction, and how many of those guesses were wrong. */
  predicted: number
  predictedWrong: number
}

export interface QuizAgg {
  right: number
  wrong: number
  skip: number
}

export interface SurveyAgg {
  n: number
  fun: number
  clear: number
  again: { yes: number; maybe: number; no: number }
  stuck: Record<string, number>
}

export interface Essay {
  day: string
  role: string
  session: string | null
  text: string
}

export interface DayAgg {
  traffic: {
    views: number
    visitors: number
    paths: Record<string, PageCount>
    refs: Record<string, number>
    device: { phone: number; wide: number }
    lang: { id: number; en: number }
  }
  consent: { yes: number; no: number }
  /** Distinct research IDs seen. */
  players: number
  sessions: Record<string, SessionAgg>
  /** Keyed `session:puzzle`. */
  puzzles: Record<string, PuzzleAgg>
  /** Keyed `session:badge`: players who earned it that day. */
  badges: Record<string, number>
  /** Keyed `session:question`. */
  quiz: Record<string, QuizAgg>
  survey: {
    n: number
    roles: Record<string, number>
    /** By the session the answer is about; `none` for "haven't played". */
    sessions: Record<string, SurveyAgg>
    essays: Essay[]
  }
}

/** A batch as read back from Firestore: the stored batch plus when it arrived. */
export interface StoredBatch extends Pick<Batch, 'rid' | 'lang' | 'device' | 'events'> {
  /** Arrival time in ms, to put a player's batches in order. */
  at: number
}

/** A survey answer as stored in `feedback` (src/survey/questions.ts). */
export interface StoredAnswer {
  role: string
  session: string | null
  fun: number
  clear: number
  stuck: string[]
  again: 'yes' | 'maybe' | 'no'
  essay: string
  at: number
}

export function emptyDay(): DayAgg {
  return {
    traffic: { views: 0, visitors: 0, paths: {}, refs: {}, device: { phone: 0, wide: 0 }, lang: { id: 0, en: 0 } },
    consent: { yes: 0, no: 0 },
    players: 0,
    sessions: {},
    puzzles: {},
    badges: {},
    quiz: {},
    survey: { n: 0, roles: {}, sessions: {}, essays: [] },
  }
}

const emptySession = (): SessionAgg => ({ started: 0, completed: 0, guide: 0, leftAtIntro: 0, time: {}, intro: {}, badges: {} })
const emptyPuzzle = (): PuzzleAgg => ({
  reached: 0,
  passed: 0,
  stopped: 0,
  leftAfterPass: 0,
  firstTry: 0,
  runs: 0,
  hinted: 0,
  rungs: [0, 0, 0, 0],
  time: {},
  build: {},
  predicted: 0,
  predictedWrong: 0,
})
const emptySurvey = (): SurveyAgg => ({ n: 0, fun: 0, clear: 0, again: { yes: 0, maybe: 0, no: 0 }, stuck: {} })

const bump = (rec: Record<string, number>, key: string, by = 1) => {
  rec[key] = (rec[key] ?? 0) + by
}
const addMs = (h: Hist, ms: number) => bump(h, String(Math.round(ms / MS_STEP)))

/** What one player did in one session that day. */
interface Path {
  started: boolean
  guide: boolean
  completed: boolean
  /** Puzzles in the order they opened. */
  opened: string[]
  passed: Set<string>
  badges: Set<string>
}

/** One day's counts from that day's batches and survey answers. */
export function aggregateDay(day: string, batches: StoredBatch[], answers: StoredAnswer[]): DayAgg {
  const agg = emptyDay()
  const players = new Set<string>()
  // rid → session → path, to count each player once per cell.
  const paths = new Map<string, Map<string, Path>>()
  const pathOf = (rid: string, session: string) => {
    let byRid = paths.get(rid)
    if (!byRid) paths.set(rid, (byRid = new Map()))
    let p = byRid.get(session)
    if (!p) byRid.set(session, (p = { started: false, guide: false, completed: false, opened: [], passed: new Set(), badges: new Set() }))
    return p
  }
  const session = (id: string) => (agg.sessions[id] ??= emptySession())
  const puzzle = (s: string, p: string) => (agg.puzzles[`${s}:${p}`] ??= emptyPuzzle())
  // Distinct players per cell: earned badges, puzzles reached.
  const seen = new Set<string>()
  const once = (key: string) => {
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }

  for (const b of [...batches].sort((x, y) => x.at - y.at)) {
    // Device and language once per batch that showed a page, as a rough mix of who visits.
    if (b.events.some((e) => e.t === 'page' && e.firstSite)) {
      agg.traffic.device[b.device]++
      agg.traffic.lang[b.lang]++
    }
    if (b.rid) players.add(b.rid)
    for (const e of b.events) countEvent(e, b.rid)
  }

  function countEvent(e: ImpactEvent, rid: string | null) {
    if (e.t === 'page') {
      const page = (agg.traffic.paths[e.path] ??= { views: 0, visitors: 0 })
      page.views++
      agg.traffic.views++
      if (e.firstPath) page.visitors++
      if (e.firstSite) agg.traffic.visitors++
      if (e.ref) bump(agg.traffic.refs, e.ref)
      return
    }
    if (e.t === 'consent') {
      agg.consent[e.yes ? 'yes' : 'no']++
      return
    }
    if (!rid) return
    switch (e.t) {
      case 'session_start': {
        const p = pathOf(rid, e.session)
        p.started = true
        if (e.guide) p.guide = true
        break
      }
      case 'intro':
        if (once(`intro:${rid}:${e.session}`)) addMs(session(e.session).intro, e.ms)
        break
      case 'puzzle_start': {
        const p = pathOf(rid, e.session)
        p.opened = [...p.opened.filter((x) => x !== e.puzzle), e.puzzle]
        if (once(`reach:${rid}:${e.session}:${e.puzzle}`)) puzzle(e.session, e.puzzle).reached++
        break
      }
      case 'run':
        if (e.prediction !== null && e.outcome !== null) {
          const pz = puzzle(e.session, e.puzzle)
          pz.predicted++
          if (e.prediction !== e.outcome) pz.predictedWrong++
        }
        break
      case 'puzzle_pass': {
        const p = pathOf(rid, e.session)
        p.passed.add(e.puzzle)
        if (!once(`pass:${rid}:${e.session}:${e.puzzle}`)) break
        const pz = puzzle(e.session, e.puzzle)
        pz.passed++
        if (e.runs === 1) pz.firstTry++
        pz.runs += e.runs
        if (e.hint > 0) pz.hinted++
        pz.rungs[e.hint]++
        addMs(pz.time, e.ms)
        addMs(pz.build, e.msBuild)
        break
      }
      case 'session_complete': {
        const p = pathOf(rid, e.session)
        if (p.completed) break
        p.completed = true
        for (const b of e.badges) p.badges.add(b)
        addMs(session(e.session).time, e.ms)
        break
      }
      case 'badge': {
        pathOf(rid, e.session).badges.add(e.badge)
        if (once(`badge:${rid}:${e.session}:${e.badge}`)) bump(agg.badges, `${e.session}:${e.badge}`)
        break
      }
      case 'quiz': {
        const q = (agg.quiz[`${e.session}:${e.q}`] ??= { right: 0, wrong: 0, skip: 0 })
        q[e.result]++
        break
      }
    }
  }

  for (const byRid of paths.values()) {
    for (const [id, p] of byRid) {
      const s = session(id)
      if (p.started) s.started++
      if (p.guide) s.guide++
      if (p.completed) {
        s.completed++
        for (const b of p.badges) bump(s.badges, b)
        continue
      }
      const last = p.opened.at(-1)
      if (!last) {
        if (p.started) s.leftAtIntro++
        continue
      }
      const pz = puzzle(id, last)
      if (p.passed.has(last)) pz.leftAfterPass++
      else pz.stopped++
    }
  }
  agg.players = players.size

  for (const a of answers) {
    const sv = agg.survey
    sv.n++
    bump(sv.roles, a.role)
    const s = (sv.sessions[a.session ?? 'none'] ??= emptySurvey())
    s.n++
    s.fun += a.fun
    s.clear += a.clear
    s.again[a.again]++
    for (const x of a.stuck) bump(s.stuck, x)
  }
  agg.survey.essays = answers
    .filter((a) => a.essay.trim())
    .sort((x, y) => y.at - x.at)
    .slice(0, ESSAYS_PER_DAY)
    .map((a) => ({ day, role: a.role, session: a.session, text: a.essay }))
  return agg
}

/**
 * Adds `b` into `a`: numbers add, objects add key by key, lists join.
 * Every field of a `DayAgg` is a count, so days add up this way.
 */
export function addInto<T>(a: T, b: T): T {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length === 0) return [...b] as T
    if (b.length === 0) return [...a] as T
    // Fixed-length count tuples add; lists of records join.
    if (a.every((x) => typeof x === 'number')) return a.map((x, i) => x + ((b[i] as number) ?? 0)) as T
    return [...a, ...b] as T
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const out: Record<string, unknown> = { ...(a as Record<string, unknown>) }
    for (const [k, v] of Object.entries(b as Record<string, unknown>)) out[k] = k in out ? addInto(out[k], v) : v
    return out as T
  }
  if (typeof a === 'number' && typeof b === 'number') return (a + b) as T
  return (b ?? a) as T
}

/** Several days as one. Counts of players are per day, so a player on two days counts twice. */
export function addDays(days: DayAgg[]): DayAgg {
  return days.reduce((sum, d) => addInto(sum, d), emptyDay())
}

/** A hidden cell: fewer than K players. */
export type Hidden = { hidden: true }
export const HIDDEN: Hidden = { hidden: true }
export const isHidden = (x: unknown): x is Hidden => Boolean(x && typeof x === 'object' && (x as Hidden).hidden === true)

export interface Report extends Omit<DayAgg, 'sessions' | 'puzzles' | 'badges' | 'quiz'> {
  sessions: Record<string, SessionAgg | Hidden>
  puzzles: Record<string, PuzzleAgg | Hidden>
  badges: Record<string, number | Hidden>
  quiz: Record<string, QuizAgg | Hidden>
  /** One row per day, for the trend chart. */
  daily: { day: string; views: number; visitors: number; players: number; started: number; completed: number }[]
  from: string
  to: string
}

/** The range's report, with every cell fewer than K players make hidden. */
export function buildReport(from: string, to: string, days: { day: string; agg: DayAgg }[], k = K): Report {
  const sum = addDays(days.map((d) => d.agg))
  const sessions: Report['sessions'] = {}
  for (const [id, s] of Object.entries(sum.sessions)) sessions[id] = s.started < k ? HIDDEN : s
  const puzzles: Report['puzzles'] = {}
  for (const [id, p] of Object.entries(sum.puzzles)) puzzles[id] = p.reached < k ? HIDDEN : p
  const badges: Report['badges'] = {}
  for (const [id, n] of Object.entries(sum.badges)) badges[id] = n < k ? HIDDEN : n
  const quiz: Report['quiz'] = {}
  for (const [id, q] of Object.entries(sum.quiz)) quiz[id] = q.right + q.wrong + q.skip < k ? HIDDEN : q
  const daily = days.map(({ day, agg }) => {
    const ss = Object.values(agg.sessions)
    return {
      day,
      views: agg.traffic.views,
      visitors: agg.traffic.visitors,
      players: agg.players,
      started: ss.reduce((n, s) => n + s.started, 0),
      completed: ss.reduce((n, s) => n + s.completed, 0),
    }
  })
  // Daily totals of players are small numbers too: hide the ones under K.
  for (const d of daily) {
    if (d.players < k) d.players = d.started = d.completed = 0
  }
  return { ...sum, sessions, puzzles, badges, quiz, daily, from, to }
}

/** The median of a duration histogram, in ms, or null when it's empty. */
export function medianMs(h: Hist): number | null {
  const rows = Object.entries(h)
    .map(([b, n]) => [Number(b) * MS_STEP, n] as const)
    .sort((x, y) => x[0] - y[0])
  const total = rows.reduce((s, [, n]) => s + n, 0)
  if (total === 0) return null
  let seen = 0
  for (const [ms, n] of rows) {
    seen += n
    if (seen * 2 >= total) return ms
  }
  return rows.at(-1)![0]
}

/** Days from `from` to `to`, both included, as YYYY-MM-DD. */
export function daysBetween(from: string, to: string): string[] {
  const out: string[] = []
  const d = new Date(`${from}T00:00:00Z`)
  const end = new Date(`${to}T00:00:00Z`)
  while (d <= end && out.length < 800) {
    out.push(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return out
}

/** The day in Jakarta (UTC+7) for a time in ms. Indonesia's classes run on WIB. */
export function jakartaDay(ms: number): string {
  return new Date(ms + 7 * 3600_000).toISOString().slice(0, 10)
}
