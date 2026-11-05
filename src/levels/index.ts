import { defineTrainBlocks } from './train/blocks'
import { trainLevel } from './train'
import { defineTreeBlocks } from './tree/blocks'
import { treeLevel } from './tree'
import { defineHillBlocks } from './hill/blocks'
import { hillLevel } from './hill'
import { defineWhenRun, setBlocklyLocale } from '../blocks/common'
import type { Lang } from '../i18n'
import type { Level, LevelId } from './types'

/** Playable levels, in order. Each one unlocks when the one before is passed. */
export const LEVELS: Level[] = [trainLevel as Level, treeLevel as Level, hillLevel as Level]

/** Shown in the level list as "coming soon". */
export const UPCOMING: { title: Record<Lang, string>; topic: string }[] = [
  { title: { id: 'Kedai Token', en: 'Token Tavern' }, topic: 'LLMs' },
]

export function levelById(id: LevelId): Level {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0]
}

/** Defines every level's blocks in the given language. */
export function defineAllBlocks(lang: Lang) {
  setBlocklyLocale(lang)
  defineWhenRun(lang)
  defineTrainBlocks(lang)
  defineTreeBlocks(lang)
  defineHillBlocks(lang)
}

export type { Level, LevelId }
