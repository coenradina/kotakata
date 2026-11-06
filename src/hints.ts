// Hint bubbles: after a run that didn't pass, point at ONE thing to change.
// Each session decides what to point at; these are the shared shapes.

import type { Key } from './i18n'

/** A block in the palette, or a field on a block in the player's program. */
export type HintTarget =
  | { where: 'palette'; type: string; fields?: Record<string, string> }
  | { where: 'field'; type: string; field: string; blockId?: string }
  | { where: 'block'; blockId: string }
  /** Any element on the page marked data-hint-anchor="<id>". */
  | { where: 'element'; id: string }

export type Rung = 1 | 2 | 3

export interface Hint {
  /** Identifies the hint. Unless `textKey` is set, the text is `hint_${key}`. */
  key: string
  target: HintTarget
  textKey?: Key
  /** A partial working program, shown on the last rung. */
  exampleKey?: Key
  /** Which rung of the ladder this is. Hints about a program that can't run have none. */
  rung?: Rung
}

/**
 * Hints get stronger in steps, so a player who's stuck isn't handed the
 * answer straight away (docs/plan/02-sessions.md, section 2):
 * 1 failed run: a question about the idea, no pointer;
 * 2 to 3: the pointer at the block or number to change;
 * 4 or more: the pointer plus a partial example.
 */
export function rungFor(failedRuns: number): Rung {
  return failedRuns >= 4 ? 3 : failedRuns >= 2 ? 2 : 1
}

/** Where rung-1 hints point: the mission panel. */
export const MISSION_ANCHOR = 'mission'

export function ladderHint(rung: Rung, puzzle: { id: string; nudgeKey: Key; exampleKey: Key }, pointer: Hint | null): Hint {
  const mission: HintTarget = { where: 'element', id: MISSION_ANCHOR }
  if (rung === 1 || !pointer) {
    return rung === 3
      ? { key: `example_${puzzle.id}`, target: mission, textKey: puzzle.nudgeKey, exampleKey: puzzle.exampleKey, rung }
      : { key: `nudge_${puzzle.id}`, target: mission, textKey: puzzle.nudgeKey, rung }
  }
  return rung === 3 ? { ...pointer, exampleKey: puzzle.exampleKey, rung } : { ...pointer, rung }
}

export const palette = (type: string, fields?: Record<string, string>): HintTarget => ({ where: 'palette', type, fields })

/** Hints the player has ignored twice in a row stop showing. */
export const MAX_REPEATS = 2
