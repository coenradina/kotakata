import { defineTrainBlocks } from './train/blocks'
import { trainLevel } from './train'
import { defineTreeBlocks } from './tree/blocks'
import { treeLevel } from './tree'
import { defineHillBlocks } from './hill/blocks'
import { hillLevel } from './hill'
import { defineTavernBlocks } from './tavern/blocks'
import { tavernLevel } from './tavern'
import { defineWhenRun, setBlocklyLocale } from '../blocks/common'
import type { Lang } from '../i18n'
import type { Session, SessionId } from './types'

/** Playable levels, in order. Each one unlocks when the one before is passed. */
export const LEVELS: Session[] = [trainLevel as Session, treeLevel as Session, hillLevel as Session, tavernLevel as Session]

/** Shown in the level list as "coming soon". */
export const UPCOMING: { title: Record<Lang, string>; topic: Record<Lang, string> }[] = []

/** A level is open once the one before it is passed. */
export function isUnlocked(id: string, passed: ReadonlySet<string>): boolean {
  const i = LEVELS.findIndex((l) => l.id === id)
  return i === 0 || (i > 0 && passed.has(LEVELS[i - 1].id))
}

export function levelById(id: SessionId): Session {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0]
}

/** Defines every level's blocks in the given language. */
export function defineAllBlocks(lang: Lang) {
  setBlocklyLocale(lang)
  defineWhenRun(lang)
  defineTrainBlocks(lang)
  defineTreeBlocks(lang)
  defineHillBlocks(lang)
  defineTavernBlocks(lang)
}

export type { Session, SessionId }
