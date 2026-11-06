// Everything a player has done, behind one interface. Today the only
// implementation keeps it in the browser (localStore). A signed-in student
// will get a backend implementation of the same interface later, so the
// game never talks to localStorage directly.

import type { CardId } from '../i18n'

/** Numbers from the run where a term was first met, shown again in the notebook. */
export type MomentVars = Record<string, string | number>

export interface Progress {
  /** Term cards found, in the order they were found. */
  cards: CardId[]
  /** The run each card was found in, for the notebook's "your moment" line. */
  moments: Partial<Record<CardId, MomentVars>>
  /** Quiz stars per card, 0 to MAX_STARS. */
  stars: Partial<Record<CardId, number>>
  /** Sessions whose main puzzles are all done. */
  passed: string[]
  /** Puzzles done, per session. */
  puzzlesDone: Record<string, string[]>
  /** Badges, as `${sessionId}:${badgeId}`. */
  badges: string[]
  /** The session open last time. */
  lastSession: string | null
  /** Recent quiz question ids, newest first, so questions don't repeat. */
  quizRecent: string[]
  /** The tour of the game screen has been seen (or skipped). */
  tourDone: boolean
  /** Sessions whose intro card has been seen. */
  introSeen: string[]
  /** The block panel is open (true) or folded down to its section icons. */
  paletteOpen: boolean
}

export const EMPTY: Progress = {
  cards: [],
  moments: {},
  stars: {},
  passed: [],
  puzzlesDone: {},
  badges: [],
  lastSession: null,
  quizRecent: [],
  tourDone: false,
  introSeen: [],
  paletteOpen: true,
}

export interface ProgressStore {
  load(): Progress
  save(patch: Partial<Progress>): void
  loadBlocks(sessionId: string): object | null
  saveBlocks(sessionId: string, blocks: object): void
  /** Forgets everything: progress and every session's blocks. */
  clear(): void
}

/** The subset of Web Storage the store needs, so tests can pass a Map. */
export interface KeyValue {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

// Storage keys. These names predate the store and must not change, or
// players lose their progress.
const KEYS = {
  cards: 'kotakata.cards',
  moments: 'kotakata.moments',
  stars: 'kotakata.stars',
  passed: 'kotakata.passed',
  puzzlesDone: 'kotakata.stages',
  badges: 'kotakata.badges',
  lastSession: 'kotakata.level',
  quizRecent: 'kotakata.quizRecent',
  tourDone: 'kotakata.tourDone',
  introSeen: 'kotakata.introSeen',
  paletteOpen: 'kotakata.paletteOpen',
} satisfies Record<keyof Progress, string>

/** Where each session's blocks live. Level 1 kept its own older key name. */
export const BLOCKS_KEYS: Record<string, string> = {
  train: 'kotakata.level1.blocks',
  tree: 'kotakata.level2.blocks',
  hill: 'kotakata.level3.blocks',
  tavern: 'kotakata.level4.blocks',
}
const blocksKey = (id: string) => BLOCKS_KEYS[id] ?? `kotakata.${id}.blocks`

/**
 * Upgrades data saved by older versions:
 * - cards stored as the string 'level1' meant "every Level 1 card";
 * - finding the 'classification' card meant Level 1 was passed;
 * - a passed level from before stages existed has all its main stages done.
 */
export interface Legacy {
  level1Cards: CardId[]
  mainPuzzles: (sessionId: string) => string[]
}

export function createLocalStore(kv: KeyValue, legacy: Legacy, validCards: readonly CardId[]): ProgressStore {
  const read = <T>(key: string, fallback: T): T => {
    try {
      const raw = kv.getItem(key)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  }
  const write = (key: string, value: unknown) => {
    try {
      kv.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or blocked: not critical */
    }
  }

  const loadCards = (): CardId[] => {
    let raw: string | null = null
    try {
      raw = kv.getItem(KEYS.cards)
    } catch {
      return []
    }
    if (raw === 'level1') return [...legacy.level1Cards]
    try {
      const ids = raw ? (JSON.parse(raw) as unknown) : []
      return Array.isArray(ids) ? ids.filter((id): id is CardId => validCards.includes(id)) : []
    } catch {
      return []
    }
  }

  return {
    load() {
      const cards = loadCards()
      const passed = new Set(read<string[]>(KEYS.passed, []))
      if (cards.includes('classification')) passed.add('train')
      const puzzlesDone = read<Record<string, string[]>>(KEYS.puzzlesDone, {})
      for (const id of passed) if (!puzzlesDone[id]?.length) puzzlesDone[id] = legacy.mainPuzzles(id)
      return {
        cards,
        moments: read(KEYS.moments, {}),
        stars: read(KEYS.stars, {}),
        passed: [...passed],
        puzzlesDone,
        badges: read(KEYS.badges, []),
        lastSession: read(KEYS.lastSession, null),
        quizRecent: read(KEYS.quizRecent, []),
        tourDone: read(KEYS.tourDone, false),
        introSeen: read(KEYS.introSeen, []),
        paletteOpen: read(KEYS.paletteOpen, true),
      }
    },
    save(patch) {
      for (const [field, value] of Object.entries(patch) as [keyof Progress, unknown][]) write(KEYS[field], value)
    },
    loadBlocks(sessionId) {
      return read<object | null>(blocksKey(sessionId), null)
    },
    saveBlocks(sessionId, blocks) {
      write(blocksKey(sessionId), blocks)
    },
    clear() {
      for (const key of [...Object.values(KEYS), ...Object.values(BLOCKS_KEYS)]) {
        try {
          kv.removeItem(key)
        } catch {
          /* not critical */
        }
      }
    },
  }
}

/** Web Storage when the browser allows it, otherwise a store that forgets. */
export function browserStorage(): KeyValue {
  try {
    const probe = '__kotakata__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return localStorage
  } catch {
    return memoryStorage()
  }
}

export function memoryStorage(): KeyValue {
  const m = new Map<string, string>()
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  }
}
