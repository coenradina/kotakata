// Accounts for educators and parents (docs/plan/07-accounts-and-classes.md,
// sections 3 and 4): what sign-up asks and the check the `completeSignup`
// function runs. Shared by the browser and functions, so it must not import
// anything.

export const ROLES = ['educator', 'parent'] as const
export type Role = (typeof ROLES)[number]

export const INSTITUTIONS = ['smp', 'sd', 'sma', 'campus', 'community', 'other'] as const
export const GRADES = ['7', '8', '9', 'other'] as const
export const SOURCES = ['colleague', 'social', 'search', 'event', 'school', 'other'] as const
export const TRAINING = ['yes', 'no'] as const

export type Institution = (typeof INSTITUTIONS)[number]
export type Grade = (typeof GRADES)[number]
export type Source = (typeof SOURCES)[number]

/** The three sign-up questions for educators. They prefill the class request form. */
export interface Survey {
  institution: Institution
  city: string
  grades: Grade[]
  source: Source
}

/** What the sign-up form sends to `completeSignup`. */
export interface SignupInput {
  role: Role
  displayName: string
  lang: 'id' | 'en'
  /** Educators only. */
  survey: Survey | null
  /** Ticked: 18 or older. */
  adult: true
  /** Ticked: the terms (and, for educators, collecting parental consent letters). */
  terms: true
  /** Educators only: want further training? Null when skipped. */
  training: 'yes' | 'no' | null
  /** The mailing list: a separate, unticked opt-in. */
  mailing: boolean
}

/** Child profiles per parent; their ids are c1…c6, so Firestore rules can cap the number. */
export const MAX_CHILDREN = 6
export const CHILD_IDS = Array.from({ length: MAX_CHILDREN }, (_, i) => `c${i + 1}`)

/** Avatars for child profiles (and later class members): emoji the pixel icon font draws. */
export const AVATARS = ['🐝', '🐦', '🐸', '🦅', '🤖', '🌈', '🌙', '🌳', '🍎', '🏀', '🎲', '⭐'] as const

export const NAME_MAX = 60
export const CITY_MAX = 60
export const NICKNAME_MAX = 20

const text = (x: unknown, max: number): string | null => {
  if (typeof x !== 'string') return null
  const s = x.trim().replace(/\s+/g, ' ')
  return s.length >= 1 && s.length <= max ? s : null
}
const oneOf = <T extends string>(list: readonly T[], x: unknown): x is T => typeof x === 'string' && (list as readonly string[]).includes(x)

export function cleanSurvey(raw: unknown): Survey | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  const city = text(s.city, CITY_MAX)
  if (!oneOf(INSTITUTIONS, s.institution) || !city || !oneOf(SOURCES, s.source)) return null
  if (!Array.isArray(s.grades) || s.grades.length === 0 || !s.grades.every((g) => oneOf(GRADES, g))) return null
  return { institution: s.institution, city, grades: GRADES.filter((g) => (s.grades as string[]).includes(g)), source: s.source }
}

/** The sign-up as it may be stored, or a reason it can't be. Unknown fields are dropped. */
export function cleanSignup(raw: unknown): { ok: true; value: SignupInput } | { ok: false; reason: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, reason: 'not an object' }
  const d = raw as Record<string, unknown>
  if (!oneOf(ROLES, d.role)) return { ok: false, reason: 'role' }
  const displayName = text(d.displayName, NAME_MAX)
  if (!displayName) return { ok: false, reason: 'displayName' }
  if (d.lang !== 'id' && d.lang !== 'en') return { ok: false, reason: 'lang' }
  if (d.adult !== true) return { ok: false, reason: 'adult' }
  if (d.terms !== true) return { ok: false, reason: 'terms' }
  if (typeof d.mailing !== 'boolean') return { ok: false, reason: 'mailing' }
  if (d.role === 'educator') {
    const survey = cleanSurvey(d.survey)
    if (!survey) return { ok: false, reason: 'survey' }
    if (!(d.training === null || oneOf(TRAINING, d.training))) return { ok: false, reason: 'training' }
    return { ok: true, value: { role: 'educator', displayName, lang: d.lang, survey, adult: true, terms: true, training: d.training, mailing: d.mailing } }
  }
  return { ok: true, value: { role: 'parent', displayName, lang: d.lang, survey: null, adult: true, terms: true, training: null, mailing: d.mailing } }
}

export interface Child {
  nickname: string
  avatar: string
}

export function cleanChild(raw: unknown): Child | null {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Record<string, unknown>
  const nickname = text(c.nickname, NICKNAME_MAX)
  if (!nickname || !oneOf(AVATARS, c.avatar)) return null
  return { nickname, avatar: c.avatar }
}

/** A users/{uid} document as the browser reads it (timestamps as ms). */
export interface Profile {
  role: Role
  displayName: string
  email: string | null
  lang: 'id' | 'en'
  survey: Survey | null
  training: 'yes' | 'no' | null
  mailing: { optIn: boolean; at: number | null }
  /** Set by functions only: can this account play the locked sessions? */
  access: { sessions: boolean; grantedAt: number | null }
  createdAt: number | null
}
