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
  /** What to say in the log when the run didn't pass. */
  failKey: Key | null
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
  missionKey: Key
  cards: TermCard[]
  /** The card shown when the mission is complete. */
  winCard: CardId
  /** What the log says on a win. Can use {acc}. */
  winKey: Key
  storageKey: string
  toolbox: (lang: Lang) => Blockly.utils.toolbox.ToolboxDefinition
  starter: object
  /** Null when there's no "when run" block at all. */
  read: (ws: Blockly.Workspace) => P | null
  isEmpty: (program: P) => boolean
  run: (program: P, seed: number) => LevelRun
  hint: (program: P | null, result: LevelRun | null) => Hint | null
  createScene: () => LevelScene
  /** What the scene's live preview should show for the current blocks. */
  previewData?: (program: P | null) => unknown
}
