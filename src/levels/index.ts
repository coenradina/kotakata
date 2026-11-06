import { defineTrainBlocks } from './train/blocks'
import { trainLevel } from './train'
import { defineTreeBlocks } from './tree/blocks'
import { treeLevel } from './tree'
import { defineHillBlocks } from './hill/blocks'
import { hillLevel } from './hill'
import { defineTavernBlocks } from './tavern/blocks'
import { tavernLevel } from './tavern'
import { defineChatBlocks } from './chat/blocks'
import { chatSession } from './chat'
import { defineFairBlocks } from './fair/blocks'
import { fairSession } from './fair'
import { defineVisionBlocks } from './vision/blocks'
import { visionSession } from './vision'
import { defineEkskulBlocks } from './ekskul/blocks'
import { ekskulSession } from './ekskul'
import { defineOsisBlocks } from './osis/blocks'
import { osisSession } from './osis'
import { defineBoardBlocks } from './board/blocks'
import { boardSession } from './board'
import { defineWhenRun, setBlocklyLocale } from '../blocks/common'
import type { Lang } from '../i18n'
import type { Session, SessionId } from './types'

/** The new one-hour sessions that are built so far (docs/plan/02-sessions.md). Every one is open. */
export const SESSIONS: Session[] = [chatSession as Session, visionSession as Session, fairSession as Session, ekskulSession as Session, boardSession as Session, osisSession as Session]

/** The classic levels, in order. Each one unlocks when the one before is passed. */
export const LEVELS: Session[] = [trainLevel as Session, treeLevel as Session, hillLevel as Session, tavernLevel as Session]

/** Everything playable. */
export const ALL: Session[] = [...SESSIONS, ...LEVELS]

export type Track = 'sessions' | 'classic'

/** The number players see: a session's number from the plan, or a classic level's place in line. */
export function numberOf(id: string): number {
  const n = Number(/^s(\d+)$/.exec(id)?.[1])
  return n || LEVELS.findIndex((l) => l.id === id) + 1
}

/** Which list a session belongs to, and that list. */
export function trackOf(id: string): { track: Track; list: Session[]; index: number } {
  const i = SESSIONS.findIndex((s) => s.id === id)
  if (i >= 0) return { track: 'sessions', list: SESSIONS, index: i }
  return { track: 'classic', list: LEVELS, index: Math.max(0, LEVELS.findIndex((l) => l.id === id)) }
}

/** Shown in the level list as "coming soon". */
export const UPCOMING: { title: Record<Lang, string>; topic: Record<Lang, string> }[] = []

/** A level is open once the one before it is passed. */
export function isUnlocked(id: string, passed: ReadonlySet<string>): boolean {
  // New sessions stand alone, like an Hour of Code: none is locked.
  if (SESSIONS.some((s) => s.id === id)) return true
  const i = LEVELS.findIndex((l) => l.id === id)
  return i === 0 || (i > 0 && passed.has(LEVELS[i - 1].id))
}

export function levelById(id: SessionId): Session {
  return ALL.find((l) => l.id === id) ?? LEVELS[0]
}

/** Defines every level's blocks in the given language. */
export function defineAllBlocks(lang: Lang) {
  setBlocklyLocale(lang)
  defineWhenRun(lang)
  defineTrainBlocks(lang)
  defineTreeBlocks(lang)
  defineHillBlocks(lang)
  defineTavernBlocks(lang)
  defineChatBlocks(lang)
  defineFairBlocks(lang)
  defineBoardBlocks(lang)
  defineVisionBlocks(lang)
  defineEkskulBlocks(lang)
  defineOsisBlocks(lang)
}

export type { Session, SessionId }
