// Hint bubbles: after a run that didn't pass, point at ONE thing to change.
// Each level decides what to point at; these are the shared shapes.

/** A block in the palette, or a field on a block in the player's program. */
export type HintTarget =
  | { where: 'palette'; type: string; fields?: Record<string, string> }
  | { where: 'field'; type: string; field: string; blockId?: string }
  | { where: 'block'; blockId: string }

export interface Hint {
  /** Also the i18n key suffix: the text is `hint_${key}`. */
  key: string
  target: HintTarget
}

export const palette = (type: string, fields?: Record<string, string>): HintTarget => ({ where: 'palette', type, fields })

/** Hints the player has ignored twice in a row stop showing. */
export const MAX_REPEATS = 2
