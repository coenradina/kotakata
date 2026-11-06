// Teacher and parent guides (docs/plan/02-sessions.md, section 10). One
// guide per session holds both roles: the parts they share (goals, terms,
// exit ticket, misconceptions) are written once, and each role gets its own
// instructions. Written in Indonesian first, then English.

import type { Lang } from '../i18n'

export type L = Record<Lang, string>
export type Role = 'guru' | 'ortu'
export const ROLES: Role[] = ['guru', 'ortu']

export interface PuzzleNote {
  title: L
  /** What happens on screen. */
  happens: L
  /** Where students get stuck. */
  stuck: L
  /** What to say: a question, never the answer. */
  say: L
}

/** A printable card for the unplugged version. */
export interface Card {
  text: string
  /** Shown on the back, or kept off the card for students to decide. */
  label?: string
}

export interface CardSet {
  title: L
  /** Whether the label is printed on the card (for training cards) or left off (for test cards). */
  showLabel: boolean
  cards: (lang: Lang) => Card[]
}

export interface SessionGuide {
  session: 's1' | 's2' | 's3' | 's4' | 's5' | 's6'
  title: L
  bigQuestion: L
  kelas: string
  kka: { elements: L[]; materi: L[] }
  /** What students can do after the session (educator wording). */
  goals: L[]
  /** The same in three plain sentences for parents. */
  forParents: L
  terms: { term: string; def: L }[]
  prep: { guru: L[]; ortu: L[] }
  warmup: { guru: L[]; ortu: L }
  puzzles: PuzzleNote[]
  debrief: { guru: { q: L; a: L }[]; ortu: L[] }
  exitTicket: { q: L; a: L }[]
  misconceptions: { belief: L; reply: L }[]
  extension: { guru: L[]; ortu: L }
  unplugged: { guru: L[]; ortu: L[] }
  cardSets: CardSet[]
  mapping: { framework: string; covers: L }[]
}
