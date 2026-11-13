// Class requests (docs/plan/07-accounts-and-classes.md, section 5): the form
// an educator sends, the check `requestClass` runs on it, and the rules for
// dates and statuses. Shared by the browser and functions, so it must not
// import anything.

export const MODES = ['offline', 'online'] as const
export const PARTICIPANTS = ['students', 'teachers', 'parents'] as const
export const CLASS_GRADES = ['7', '8', '9'] as const
/** Sessions a class can open: the six sessions and classic levels 3 and 4. Classic 1 and 2 stay public. */
export const CLASS_SESSIONS = ['s1', 's2', 's3', 's4', 's5', 's6', 'hill', 'tavern'] as const
export const STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const

export type Mode = (typeof MODES)[number]
export type Participant = (typeof PARTICIPANTS)[number]
export type ClassGrade = (typeof CLASS_GRADES)[number]
export type ClassSession = (typeof CLASS_SESSIONS)[number]
export type RequestStatus = (typeof STATUSES)[number]

/** At most this many active requests per educator: pending, or approved and not yet closed. */
export const MAX_ACTIVE = 3
export const MIN_COUNT = 1
export const MAX_COUNT = 60
/** The end date is this many days after the start date. */
export const MIN_DAYS = 7
export const MAX_DAYS = 31
/** How far ahead a class may start. */
export const MAX_LEAD_DAYS = 180
export const INSTITUTION_MAX = 100
export const CITY_MAX = 60
export const PURPOSE_MAX = 600
export const NOTE_MAX = 600

/** What the request form sends to `requestClass`. Dates are days in Jakarta, YYYY-MM-DD. */
export interface ClassRequestInput {
  institution: string
  city: string
  mode: Mode
  participants: Participant[]
  count: number
  /** Only when students take part; empty otherwise. */
  grades: ClassGrade[]
  sessions: ClassSession[]
  start: string
  end: string
  purpose: string
}

const DAY_MS = 86_400_000

/** Today in Jakarta (UTC+7, no daylight saving), as YYYY-MM-DD. */
export const jakartaToday = (now: number) => new Date(now + 7 * 3_600_000).toISOString().slice(0, 10)

export const isDay = (x: unknown): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && new Date(`${x}T00:00:00Z`).toISOString().slice(0, 10) === x

/** Whole days from a to b (both YYYY-MM-DD). */
export const daysFrom = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS)

export const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10)

const text = (x: unknown, max: number): string | null => {
  if (typeof x !== 'string') return null
  const s = x.trim().replace(/[ \t]+/g, ' ')
  return s.length >= 1 && s.length <= max ? s : null
}
const oneOf = <T extends string>(list: readonly T[], x: unknown): x is T => typeof x === 'string' && (list as readonly string[]).includes(x)
/** A non-empty list from `list`, without repeats, in `list`'s order. */
const someOf = <T extends string>(list: readonly T[], x: unknown): T[] | null => {
  if (!Array.isArray(x) || x.length === 0 || !x.every((v) => oneOf(list, v))) return null
  return list.filter((v) => x.includes(v))
}

/** The request as it may be stored, or a reason it can't be. `today` is Jakarta's. Unknown fields are dropped. */
export function cleanClassRequest(raw: unknown, today: string): { ok: true; value: ClassRequestInput } | { ok: false; reason: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, reason: 'not an object' }
  const d = raw as Record<string, unknown>
  const institution = text(d.institution, INSTITUTION_MAX)
  if (!institution) return { ok: false, reason: 'institution' }
  const city = text(d.city, CITY_MAX)
  if (!city) return { ok: false, reason: 'city' }
  if (!oneOf(MODES, d.mode)) return { ok: false, reason: 'mode' }
  const participants = someOf(PARTICIPANTS, d.participants)
  if (!participants) return { ok: false, reason: 'participants' }
  if (typeof d.count !== 'number' || !Number.isInteger(d.count) || d.count < MIN_COUNT || d.count > MAX_COUNT) return { ok: false, reason: 'count' }
  let grades: ClassGrade[] = []
  if (participants.includes('students')) {
    const g = someOf(CLASS_GRADES, d.grades)
    if (!g) return { ok: false, reason: 'grades' }
    grades = g
  }
  const sessions = someOf(CLASS_SESSIONS, d.sessions)
  if (!sessions) return { ok: false, reason: 'sessions' }
  if (!isDay(d.start) || !isDay(d.end)) return { ok: false, reason: 'dates' }
  const lead = daysFrom(today, d.start)
  if (lead < 0 || lead > MAX_LEAD_DAYS) return { ok: false, reason: 'start' }
  const length = daysFrom(d.start, d.end)
  if (length < MIN_DAYS || length > MAX_DAYS) return { ok: false, reason: 'end' }
  if (typeof d.purpose !== 'string') return { ok: false, reason: 'purpose' }
  const purpose = d.purpose.trim()
  if (purpose.length < 1 || purpose.length > PURPOSE_MAX) return { ok: false, reason: 'purpose' }
  return { ok: true, value: { institution, city, mode: d.mode, participants, count: d.count, grades, sessions, start: d.start, end: d.end, purpose } }
}

/** A review note: optional, trimmed, at most NOTE_MAX characters. Null when it isn't text. */
export function cleanNote(x: unknown): string | null {
  if (x === undefined || x === null) return ''
  if (typeof x !== 'string') return null
  const s = x.trim()
  return s.length <= NOTE_MAX ? s : null
}

/** Class codes: 6 characters, without O, 0, I or 1, which are easy to mix up. */
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const CODE_LENGTH = 6

/** A class code from random bytes (one byte per character). */
export function codeFrom(bytes: ArrayLike<number>): string {
  let s = ''
  for (let i = 0; i < CODE_LENGTH; i++) s += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
  return s
}

/** A classRequests document as the browser reads it (timestamps as ms). */
export interface ClassRequest extends ClassRequestInput {
  id: string
  ownerUid: string
  ownerName: string
  ownerEmail: string | null
  status: RequestStatus
  /** True while it counts toward the limit: pending, or approved and the class not closed. */
  active: boolean
  createdAt: number | null
  reviewedAt: number | null
  note: string
  classId: string | null
}
