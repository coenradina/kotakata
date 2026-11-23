// The educator's feedback after a class (docs/plan/07-accounts-and-classes.md,
// section 7), the check `sendClassFeedback` runs on it, the stage numbers
// shown next to it, and the mailing list export. Shared by the browser and
// functions, so it must not import anything.

/** Parts of a class that can be hard to deliver. */
export const HARD_PARTS = ['intro', 'mission', 'blocks', 'run', 'result', 'words', 'time', 'devices', 'other'] as const
export const AGAIN = ['yes', 'maybe', 'no'] as const
/** Further training: "yes" or "not now", the same values as `users/{uid}.training`. */
export const TRAINING = ['yes', 'no'] as const
export const FEEDBACK_TEXT_MAX = 600
/** At most this many stages can be marked as confusing. */
export const MAX_CONFUSED = 40

export type HardPart = (typeof HARD_PARTS)[number]
export type Again = (typeof AGAIN)[number]
export type Training = (typeof TRAINING)[number]

/** What the form sends with the class id. */
export interface ClassFeedbackInput {
  /** How the class went, 1 to 5. */
  rating: number
  hard: HardPart[]
  /** Stages students got confused on, as `${session}:${puzzle}`. */
  confused: string[]
  confusedText: string
  moment: string
  again: Again
  training: Training
  /** Join the mailing list. Only asked when the educator hasn't yet. */
  mailing: boolean
}

const oneOf = <T extends string>(list: readonly T[], x: unknown): x is T => typeof x === 'string' && (list as readonly string[]).includes(x)

/** Optional text: trimmed, at most FEEDBACK_TEXT_MAX characters. Null when it isn't text or is too long. */
function optionalText(x: unknown): string | null {
  if (x === undefined || x === null) return ''
  if (typeof x !== 'string') return null
  const s = x.trim()
  return s.length <= FEEDBACK_TEXT_MAX ? s : null
}

const STAGE = /^([a-z0-9]{1,12}):([A-Za-z0-9_-]{1,24})$/

/**
 * The feedback as it may be stored, or a reason it can't be. `sessions` are
 * the class's sessions: a confusing stage must be in one of them. Unknown
 * fields are dropped.
 */
export function cleanClassFeedback(raw: unknown, sessions: readonly string[]): { ok: true; value: ClassFeedbackInput } | { ok: false; reason: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, reason: 'not an object' }
  const d = raw as Record<string, unknown>
  if (typeof d.rating !== 'number' || !Number.isInteger(d.rating) || d.rating < 1 || d.rating > 5) return { ok: false, reason: 'rating' }
  if (!Array.isArray(d.hard) || !d.hard.every((h) => oneOf(HARD_PARTS, h))) return { ok: false, reason: 'hard' }
  const hard = HARD_PARTS.filter((h) => (d.hard as unknown[]).includes(h))
  if (!Array.isArray(d.confused) || d.confused.length > MAX_CONFUSED) return { ok: false, reason: 'confused' }
  const confused: string[] = []
  for (const c of d.confused) {
    const m = typeof c === 'string' ? STAGE.exec(c) : null
    if (!m || !sessions.includes(m[1])) return { ok: false, reason: 'confused' }
    if (!confused.includes(c as string)) confused.push(c as string)
  }
  const confusedText = optionalText(d.confusedText)
  if (confusedText === null) return { ok: false, reason: 'confusedText' }
  const moment = optionalText(d.moment)
  if (moment === null) return { ok: false, reason: 'moment' }
  if (!oneOf(AGAIN, d.again)) return { ok: false, reason: 'again' }
  if (!oneOf(TRAINING, d.training)) return { ok: false, reason: 'training' }
  if (d.mailing !== undefined && typeof d.mailing !== 'boolean') return { ok: false, reason: 'mailing' }
  return { ok: true, value: { rating: d.rating, hard, confused, confusedText, moment, again: d.again, training: d.training, mailing: d.mailing === true } }
}

/** The form opens on the class's start date (YYYY-MM-DD in Jakarta) and closes with the class. */
export const canSendFeedback = (c: { start: string; status: string }, today: string) => c.status !== 'closed' && today >= c.start

/**
 * How many students finished each stage, as `${session}:${puzzle}` → count.
 * Only counts; no nicknames, so it can be kept with the feedback after the
 * class is deleted.
 */
export function stageCounts(members: readonly { done: Record<string, readonly string[]> }[], sessions: readonly string[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const m of members) {
    for (const s of sessions) {
      for (const p of new Set(m.done[s] ?? [])) {
        if (typeof p !== 'string' || !/^[A-Za-z0-9_-]{1,24}$/.test(p)) continue
        const key = `${s}:${p}`
        counts[key] = (counts[key] ?? 0) + 1
      }
    }
  }
  return counts
}

/** One person on the mailing list, as `mailingList` returns them. `optInAt` is ms. */
export interface MailingRow {
  name: string
  email: string
  role: string
  institution: string
  city: string
  training: string
  lang: string
  optInAt: number | null
}

/** One CSV cell. A cell a spreadsheet would read as a formula gets a leading quote mark. */
function cell(x: string): string {
  const s = /^[=+\-@\t\r]/.test(x) ? `'${x}` : x
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** The mailing list as CSV, with a header row. Times are written in UTC. */
export function mailingCsv(rows: readonly MailingRow[]): string {
  const head = ['name', 'email', 'role', 'institution', 'city', 'training', 'lang', 'opt_in_at']
  const lines = rows.map((r) => [r.name, r.email, r.role, r.institution, r.city, r.training, r.lang, r.optInAt === null ? '' : new Date(r.optInAt).toISOString()].map(cell).join(','))
  return [head.join(','), ...lines].join('\r\n') + '\r\n'
}
