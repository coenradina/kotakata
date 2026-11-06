import type * as Phaser from 'phaser'
import type { CardId, Lang } from '../i18n'

export type LogFn = (line: string, tone?: 'info' | 'good' | 'bad') => void

/** Which side of the stage a term card sits on, away from what it explains. */
export type PopupSide = 'left' | 'right'

/**
 * Lets a level pause on a term the player meets for the first time.
 * `show` resolves when the player closes the card.
 */
export interface Milestones {
  isNew: (id: CardId) => boolean
  show: (id: CardId, side: PopupSide, vars?: Record<string, string | number>) => Promise<void>
}

export const NO_MILESTONES: Milestones = { isNew: () => false, show: () => Promise.resolve() }

/** What every level's Phaser scene offers the React app. */
export interface SessionScene extends Phaser.Scene {
  readyPromise: Promise<void>
  setLang: (lang: Lang) => void
  play: (events: unknown[], log: LogFn, milestones?: Milestones) => Promise<void>
  reset: () => void
  celebrate: () => void
  /** Optional live preview of the player's program while they edit. */
  preview?: (data: unknown) => void
}

export const STAGE_WIDTH = 640
export const STAGE_HEIGHT = 400
