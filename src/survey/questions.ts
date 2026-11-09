// The feedback survey: what it asks and what one answer looks like.
// firestore.rules checks the same shape, so a change here needs a change there.

export const ROLES = ['student', 'teacher', 'parent', 'other'] as const
export const STUCK = ['mission', 'blocks', 'run', 'result', 'words', 'none'] as const
export const AGAIN = ['yes', 'maybe', 'no'] as const
export const ESSAY_MAX = 600

export type Role = (typeof ROLES)[number]
export type Stuck = (typeof STUCK)[number]
export type Again = (typeof AGAIN)[number]

/** One answer as stored. No name, account or device id. */
export interface SurveyAnswer {
  v: 1
  role: Role
  /** The session the answer is about, or null for "haven't played". */
  session: string | null
  /** 1 (boring) to 5 (really fun). */
  fun: number
  /** 1 (confusing) to 5 (very clear). */
  clear: number
  stuck: Stuck[]
  again: Again
  /** Optional free text, at most ESSAY_MAX characters. */
  essay: string
  lang: 'id' | 'en'
  device: 'phone' | 'wide'
}

/** What the player has filled in so far. */
export interface Draft {
  role: Role | null
  session: string | null
  fun: number | null
  clear: number | null
  stuck: Stuck[]
  again: Again | null
  essay: string
}

const scale = (n: number | null): n is number => n !== null && Number.isInteger(n) && n >= 1 && n <= 5

/** The finished answer, or null while a required question is unanswered. */
export function toAnswer(d: Draft, lang: 'id' | 'en', device: 'phone' | 'wide'): SurveyAnswer | null {
  if (!d.role || !scale(d.fun) || !scale(d.clear) || !d.again) return null
  // "Nothing was confusing" and a confusing part can't both be true; the part wins.
  const stuck = d.stuck.length > 1 ? d.stuck.filter((s) => s !== 'none') : d.stuck
  return {
    v: 1,
    role: d.role,
    session: d.session,
    fun: d.fun,
    clear: d.clear,
    stuck: STUCK.filter((s) => stuck.includes(s)),
    again: d.again,
    essay: d.essay.trim().slice(0, ESSAY_MAX),
    lang,
    device,
  }
}
