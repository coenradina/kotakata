import type * as Blockly from 'blockly/core'
import type { SessionScene } from '../game/types'
import type { Hint } from '../hints'
import type { CardId, Key, Lang, TermCard } from '../i18n'
import type { RunContext } from '../quiz/questions'

export type SessionId = 's1' | 's3' | 's5' | 'train' | 'tree' | 'hill' | 'tavern'

/** What running a level's program produced, in a shape the app understands. */
export interface Run {
  /** Level-specific events the scene animates. */
  events: unknown[]
  accuracy: number | null
  passed: boolean
  /** Numbers for quiz questions about the player's own run. */
  context: RunContext | null
}

/**
 * Where a puzzle sits in its session's arc (docs/plan/02-sessions.md):
 * introduce an idea safely, develop it, twist it so the obvious move
 * fails, then free play.
 */
export type Beat = 'introduce' | 'develop' | 'twist' | 'sandbox'

/**
 * A question the player answers before running, so they have a guess the
 * result can prove wrong. Nothing is graded: the guess is evidence of what
 * the player expected.
 */
export interface Prediction<P> {
  questionKey: Key
  /** Two to four answers, in the order shown. */
  choices: Key[]
  /** Which choice this run turned out to match, or null if it doesn't answer the question. */
  outcome: (program: P, run: Run) => number | null
}

/**
 * One step of a session. The main puzzles run in order; a bonus (sandbox)
 * puzzle opens once they're all done.
 */
export interface Puzzle<P> {
  id: string
  beat: Beat
  /**
   * Share of players who should pass on their first run, 0 to 1. Playtests
   * and the impact data compare against it.
   */
  firstRunTarget: number
  titleKey: Key
  missionKey: Key
  bonus?: boolean
  /** Asked before the first run of this puzzle. */
  prediction?: Prediction<P>
  /** Hint rung 1: a question about the idea, after the first failed run. */
  nudgeKey: Key
  /** Hint rung 3: part of a working program, after four failed runs. */
  exampleKey: Key
  /** Did this run complete the stage? */
  check: (program: P, run: Run) => boolean
  /** What the log says when it didn't. Can use {acc}, and anything `failVars` adds. */
  failKey: (program: P, run: Run) => Key | null
  /** Numbers for the fail line, such as how many messages were right. */
  failVars?: (program: P, run: Run) => Record<string, string | number>
  /**
   * Blocks to load and run once when the player reaches this stage, so they
   * see the problem the stage is about before fixing it.
   */
  /** `autoRun: false` only loads the blocks, for a demo whose program already solves the puzzle. */
  demo?: { blocks: object | ((lang: Lang) => object); messageKey: Key; autoRun?: boolean }
}

/** A small badge for something nice the player did. */
export interface BadgeDef<P> {
  id: string
  icon: string
  titleKey: Key
  descKey: Key
  check: (program: P, run: Run, stage: Puzzle<P>, stagePassed: boolean) => boolean
}

/**
 * Everything the app needs from a level. `P` is the level's program: what
 * its blocks mean, read as data.
 */
export interface Session<P = unknown> {
  id: SessionId
  title: Record<Lang, string>
  /** Short topic label; the technical term stays in brackets in Indonesian. */
  topic: Record<Lang, string>
  /** Name of the blocks file in the editor header. */
  fileKey: Key
  cards: TermCard[]
  /** The card shown when the last main stage is complete. */
  winCard: CardId
  /** What the log says on a win. Can use {acc}. */
  winKey: Key
  /** The block palette. Sessions that add blocks puzzle by puzzle use `puzzleId`. */
  toolbox: (lang: Lang, puzzleId?: string) => Blockly.utils.toolbox.ToolboxDefinition
  starter: object | ((lang: Lang) => object)
  /** Null when there's no "when run" block at all. */
  read: (ws: Blockly.Workspace) => P | null
  isEmpty: (program: P) => boolean
  puzzles: Puzzle<P>[]
  /**
   * Stages with the same group are played with the same run, so one strong
   * program can clear several of them at once (bonus included).
   */
  runGroup: (stageId: string) => string
  badgeDefs: BadgeDef<P>[]
  run: (program: P, seed: number, stageId: string, lang: Lang) => Run
  hint: (program: P | null, result: Run | null, stageId: string) => Hint | null
  createScene: () => SessionScene
  /** What the scene's live preview should show for the current blocks and stage. */
  previewData?: (program: P | null, stageId: string) => unknown
}
