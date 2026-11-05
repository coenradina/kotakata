import type * as Blockly from 'blockly/core'
import type { LevelScene } from '../game/types'
import type { Hint } from '../hints'
import type { CardId, Key, Lang, TermCard } from '../i18n'
import type { RunContext } from '../quiz/questions'

export type LevelId = 'train' | 'tree'

/** What running a level's program produced, in a shape the app understands. */
export interface LevelRun {
  /** Level-specific events the scene animates. */
  events: unknown[]
  accuracy: number | null
  passed: boolean
  /** Numbers for quiz questions about the player's own run. */
  context: RunContext | null
}

/**
 * One step of a level's mission. The main stages run in order; a bonus
 * stage opens once they're all done.
 */
export interface StageDef<P> {
  id: string
  titleKey: Key
  missionKey: Key
  bonus?: boolean
  /** Did this run complete the stage? */
  check: (program: P, run: LevelRun) => boolean
  /** What the log says when it didn't. Can use {acc}. */
  failKey: (program: P, run: LevelRun) => Key | null
}

/** A small badge for something nice the player did. */
export interface AchievementDef<P> {
  id: string
  icon: string
  titleKey: Key
  descKey: Key
  check: (program: P, run: LevelRun, stage: StageDef<P>, stagePassed: boolean) => boolean
}

/**
 * Everything the app needs from a level. `P` is the level's program: what
 * its blocks mean, read as data.
 */
export interface Level<P = unknown> {
  id: LevelId
  title: Record<Lang, string>
  topic: string
  /** Name of the blocks file in the editor header. */
  fileKey: Key
  cards: TermCard[]
  /** The card shown when the last main stage is complete. */
  winCard: CardId
  /** What the log says on a win. Can use {acc}. */
  winKey: Key
  storageKey: string
  toolbox: (lang: Lang) => Blockly.utils.toolbox.ToolboxDefinition
  starter: object
  /** Null when there's no "when run" block at all. */
  read: (ws: Blockly.Workspace) => P | null
  isEmpty: (program: P) => boolean
  stages: StageDef<P>[]
  /**
   * Stages with the same group are played with the same run, so one strong
   * program can clear several of them at once (bonus included).
   */
  runGroup: (stageId: string) => string
  achievements: AchievementDef<P>[]
  run: (program: P, seed: number, stageId: string) => LevelRun
  hint: (program: P | null, result: LevelRun | null, stageId: string) => Hint | null
  createScene: () => LevelScene
  /** What the scene's live preview should show for the current blocks. */
  previewData?: (program: P | null) => unknown
}
