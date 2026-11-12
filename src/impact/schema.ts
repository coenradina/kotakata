// What the game may send for impact data, and the check the server runs on
// every batch (docs/plan/03-technical.md, section 6). Shared by the browser
// and the `ingestImpact` function, so it must not import anything.
//
// Rules: no identifiers but the random research ID, no free text, no time of
// day (the server stamps the day), and durations rounded to 15 seconds.

export const SCHEMA_VERSION = 1
export const MAX_EVENTS = 50
/** Durations are rounded to this many milliseconds… */
export const MS_STEP = 15_000
/** …and capped here, so a tab left open overnight can't skew an average. */
export const MS_CAP = 30 * 60_000

export type Device = 'phone' | 'wide'
export type QuizResult = 'right' | 'wrong' | 'skip'

export type ImpactEvent =
  /** A page was shown. Sent for everyone: it carries no research ID. */
  | { t: 'page'; path: string; ref: string | null; firstPath: boolean; firstSite: boolean }
  /** The answer on the consent card. Sent for everyone, so the share who said no is known. */
  | { t: 'consent'; yes: boolean }
  /** The play screen for a session opened. `guide`: this browser opened the teacher guide for it first. */
  | { t: 'session_start'; session: string; guide: boolean }
  /** Time on the session's intro card, until Play. */
  | { t: 'intro'; session: string; ms: number }
  | { t: 'puzzle_start'; session: string; puzzle: string }
  /** `ms`: active time on the puzzle so far. */
  | { t: 'run'; session: string; puzzle: string; n: number; passed: boolean; prediction: number | null; outcome: number | null; hint: 0 | 1 | 2 | 3; ms: number }
  /** `ms`: active time from the puzzle opening to this pass. `msBuild`: the part before the first run. */
  | { t: 'puzzle_pass'; session: string; puzzle: string; runs: number; hint: 0 | 1 | 2 | 3; ms: number; msBuild: number }
  /** `ms`: active time from the session opening. `badges`: this session's badges the player holds now. */
  | { t: 'session_complete'; session: string; ms: number; badges: string[] }
  | { t: 'badge'; session: string; badge: string }
  | { t: 'quiz'; session: string; q: string; result: QuizResult }

export type EventType = ImpactEvent['t']

/** Events sent without a research ID, whatever the player chose. */
export const ANONYMOUS: ReadonlySet<EventType> = new Set(['page', 'consent'])

/** One POST to `ingestImpact`. */
export interface Batch {
  v: 1
  /** Random 128-bit hex ID, only after the player said yes. Null otherwise: then only ANONYMOUS events are sent. */
  rid: string | null
  lang: 'id' | 'en'
  device: Device
  app: string
  events: ImpactEvent[]
}

const ID = /^[A-Za-z0-9_-]{1,40}$/
const RID = /^[0-9a-f]{32}$/
const PATH = /^\/[A-Za-z0-9/_-]{0,80}$/
const DOMAIN = /^[a-z0-9.-]{1,100}$/
const APP = /^[0-9A-Za-z.+-]{1,24}$/

const isId = (x: unknown): x is string => typeof x === 'string' && ID.test(x)
const isInt = (x: unknown, max: number): x is number => typeof x === 'number' && Number.isInteger(x) && x >= 0 && x <= max
const isBool = (x: unknown): x is boolean => typeof x === 'boolean'
const isHint = (x: unknown): x is 0 | 1 | 2 | 3 => x === 0 || x === 1 || x === 2 || x === 3
const isChoice = (x: unknown): x is number | null => x === null || isInt(x, 9)

/** Rounds a duration to the nearest step and caps it. */
export function bucketMs(ms: number): number {
  if (!Number.isFinite(ms) || ms <= 0) return 0
  return Math.min(MS_CAP, Math.round(ms / MS_STEP) * MS_STEP)
}

/**
 * One event exactly as allowed, with every other field dropped, or null if
 * it doesn't fit. Durations are bucketed here too, whatever the client did.
 */
export function cleanEvent(raw: unknown): ImpactEvent | null {
  if (!raw || typeof raw !== 'object') return null
  const e = raw as Record<string, unknown>
  switch (e.t) {
    case 'page':
      if (typeof e.path !== 'string' || !PATH.test(e.path)) return null
      if (!(e.ref === null || (typeof e.ref === 'string' && DOMAIN.test(e.ref)))) return null
      if (!isBool(e.firstPath) || !isBool(e.firstSite)) return null
      return { t: 'page', path: e.path, ref: e.ref, firstPath: e.firstPath, firstSite: e.firstSite }
    case 'consent':
      if (!isBool(e.yes)) return null
      return { t: 'consent', yes: e.yes }
    case 'session_start':
      if (!isId(e.session) || !isBool(e.guide)) return null
      return { t: 'session_start', session: e.session, guide: e.guide }
    case 'intro':
      if (!isId(e.session) || !isInt(e.ms, 1e9)) return null
      return { t: 'intro', session: e.session, ms: bucketMs(e.ms) }
    case 'puzzle_start':
      if (!isId(e.session) || !isId(e.puzzle)) return null
      return { t: 'puzzle_start', session: e.session, puzzle: e.puzzle }
    case 'run':
      if (!isId(e.session) || !isId(e.puzzle) || !isInt(e.n, 9999) || !isBool(e.passed)) return null
      if (!isChoice(e.prediction) || !isChoice(e.outcome) || !isHint(e.hint) || !isInt(e.ms, 1e9)) return null
      return { t: 'run', session: e.session, puzzle: e.puzzle, n: e.n, passed: e.passed, prediction: e.prediction, outcome: e.outcome, hint: e.hint, ms: bucketMs(e.ms) }
    case 'puzzle_pass':
      if (!isId(e.session) || !isId(e.puzzle) || !isInt(e.runs, 9999) || !isHint(e.hint) || !isInt(e.ms, 1e9) || !isInt(e.msBuild, 1e9)) return null
      return { t: 'puzzle_pass', session: e.session, puzzle: e.puzzle, runs: e.runs, hint: e.hint, ms: bucketMs(e.ms), msBuild: bucketMs(Math.min(e.msBuild, e.ms)) }
    case 'session_complete':
      if (!isId(e.session) || !isInt(e.ms, 1e9) || !Array.isArray(e.badges) || e.badges.length > 20 || !e.badges.every(isId)) return null
      return { t: 'session_complete', session: e.session, ms: bucketMs(e.ms), badges: [...new Set(e.badges as string[])] }
    case 'badge':
      if (!isId(e.session) || !isId(e.badge)) return null
      return { t: 'badge', session: e.session, badge: e.badge }
    case 'quiz':
      if (!isId(e.session) || !isId(e.q) || !(e.result === 'right' || e.result === 'wrong' || e.result === 'skip')) return null
      return { t: 'quiz', session: e.session, q: e.q, result: e.result }
    default:
      return null
  }
}

/**
 * The batch as it may be stored, or null if its envelope is wrong. Events
 * that don't fit are dropped one by one. Without a research ID only page
 * views and consent answers are kept: they are counts, not a player's path
 * through the game.
 */
export function cleanBatch(raw: unknown): { batch: Batch; dropped: number } | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  if (b.v !== SCHEMA_VERSION) return null
  if (!(b.rid === null || (typeof b.rid === 'string' && RID.test(b.rid)))) return null
  if (b.lang !== 'id' && b.lang !== 'en') return null
  if (b.device !== 'phone' && b.device !== 'wide') return null
  if (typeof b.app !== 'string' || !APP.test(b.app)) return null
  if (!Array.isArray(b.events) || b.events.length === 0 || b.events.length > MAX_EVENTS) return null
  const events: ImpactEvent[] = []
  for (const raw of b.events) {
    const e = cleanEvent(raw)
    if (e && (b.rid !== null || ANONYMOUS.has(e.t))) events.push(e)
  }
  if (events.length === 0) return null
  return { batch: { v: 1, rid: b.rid, lang: b.lang, device: b.device, app: b.app, events }, dropped: b.events.length - events.length }
}
