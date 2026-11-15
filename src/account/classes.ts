// Classes and their students (docs/plan/07-accounts-and-classes.md, section 6):
// nicknames, picture passwords, when a class is open, and when a student
// counts as stuck. Shared by the browser and functions, so it must not import
// anything.

/** The pictures a picture password is made of: the same 12 as child avatars. */
export const PICTURES = ['🐝', '🐦', '🐸', '🦅', '🤖', '🌈', '🌙', '🌳', '🍎', '🏀', '🎲', '⭐'] as const
/** A picture password is this many pictures, in order. */
export const PICTURE_LENGTH = 2

export const MAX_MEMBERS = 60
export const NICKNAME_MAX = 20
/** Wrong joins to a class before it locks, and for how long. */
export const MAX_FAILS = 20
export const LOCK_MS = 10 * 60_000
/** A student is stuck after this long on one stage, or once they reach this hint rung. */
export const STUCK_MS = 5 * 60_000
export const STUCK_HINT = 3

/** A class code: 6 characters from CODE_ALPHABET in src/account/classRequest.ts. */
export const isCode = (x: unknown): x is string => typeof x === 'string' && /^[A-HJ-NP-Z2-9]{6}$/.test(x)

/** Letters (any script), digits, spaces and a few marks; 1 to 20 characters once spaces are tidied. */
export function cleanNickname(x: unknown): string | null {
  if (typeof x !== 'string') return null
  const s = x.normalize('NFC').trim().replace(/\s+/g, ' ')
  if (s.length < 1 || s.length > NICKNAME_MAX) return null
  return /^[\p{L}\p{N} .'_-]+$/u.test(s) ? s : null
}

/** Two nicknames are the same if they differ only in case. */
export const nicknameKey = (nickname: string) => nickname.toLocaleLowerCase('id')

/** A picture password as indexes into PICTURES, or null if it isn't one. */
export function cleanPicture(x: unknown): number[] | null {
  if (!Array.isArray(x) || x.length !== PICTURE_LENGTH) return null
  return x.every((i) => Number.isInteger(i) && i >= 0 && i < PICTURES.length) ? (x as number[]) : null
}

export type ClassState = 'notYet' | 'open' | 'ended' | 'closed'

/** Whether a class link works today (YYYY-MM-DD in Jakarta). It works on both the start and the end date. */
export function classState(c: { start: string; end: string; status: string }, today: string): ClassState {
  if (c.status === 'closed') return 'closed'
  if (today < c.start) return 'notYet'
  if (today > c.end) return 'ended'
  return 'open'
}

/** Where a student is now, as the game reports it. `since` and `at` are ms. */
export interface Live {
  session: string | null
  puzzle: string | null
  since: number | null
  runs: number
  hint: number
  /** Last report from the student's device. */
  at: number | null
}

export const isStuck = (live: Live, now: number) => live.puzzle !== null && (live.hint >= STUCK_HINT || (live.since !== null && now - live.since >= STUCK_MS))

/** What a class page shows for one student. */
export interface Member {
  id: string
  nickname: string
  joinedAt: number | null
  live: Live
  /** Sessions whose main puzzles are all done. */
  passed: string[]
}

/** What `classInfo` tells the join page. */
export interface ClassInfo {
  state: ClassState
  start: string
  end: string
  institution: string
}
