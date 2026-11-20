import { LEVEL1_CARDS, LEVEL2_CARDS, LEVEL3_CARDS, LEVEL4_CARDS, SESSION1_CARDS, SESSION2_CARDS, SESSION3_CARDS, SESSION4_CARDS, SESSION5_CARDS, SESSION6_CARDS } from '../i18n'
import { ALL } from '../levels'
import { browserStorage, createLocalStore, type Legacy, type ProgressStore } from './progress'
import { createSyncedStore, prefixed, pullInto, type Remote, type SyncedStore } from './sync'

export const EVERY_CARD = [...SESSION1_CARDS, ...SESSION2_CARDS, ...SESSION3_CARDS, ...SESSION4_CARDS, ...SESSION5_CARDS, ...SESSION6_CARDS, ...LEVEL1_CARDS, ...LEVEL2_CARDS, ...LEVEL3_CARDS, ...LEVEL4_CARDS]
const CARD_IDS = EVERY_CARD.map((c) => c.id)

const legacy: Legacy = {
  level1Cards: LEVEL1_CARDS.map((c) => c.id),
  mainPuzzles: (id) => ALL.find((l) => l.id === id)?.puzzles.filter((s) => !s.bonus).map((s) => s.id) ?? [],
}

const kv = browserStorage()
/** A guest's progress, in this browser only, under the keys the game has always used. */
const guest = createLocalStore(kv, legacy, CARD_IDS)

let active: ProgressStore = guest
let synced: SyncedStore | null = null
let activeKey: string | null = null

/**
 * The player's progress store. A guest's lives in this browser; a student's
 * or a child profile's is also kept on the server (`switchProfile`).
 */
export const store: ProgressStore = {
  load: () => active.load(),
  save: (patch) => active.save(patch),
  loadBlocks: (id) => active.loadBlocks(id),
  saveBlocks: (id, blocks) => active.saveBlocks(id, blocks),
  clear: (ids) => active.clear(ids),
}

/** Which profile this device last played as, so a reload waits for it instead of showing a guest's progress. */
const LAST_KEY = 'kotakata.profile'
export function lastProfile(): string | null {
  try {
    return kv.getItem(LAST_KEY)
  } catch {
    return null
  }
}

/**
 * Plays as a profile from now on: `key` names its copy on this device, and
 * `remote` its copy on the server, which is pulled in first. Null goes back
 * to the guest's progress.
 */
export async function switchProfile(profile: { key: string; remote: Remote } | null): Promise<void> {
  if ((profile?.key ?? null) === activeKey) return
  await synced?.flush().catch(() => {})
  if (!profile) {
    active = guest
    synced = null
    activeKey = null
    kv.removeItem(LAST_KEY)
    return
  }
  const local = createLocalStore(prefixed(kv, `kotakata.p.${profile.key}.`), legacy, CARD_IDS)
  let behind = false
  try {
    behind = await pullInto(local, profile.remote)
  } catch {
    // Offline: play from this device's copy; changes reach the server later.
    behind = true
  }
  synced = createSyncedStore(local, profile.remote, 2000, (e) => console.warn('[progress sync]', e))
  if (behind) synced.save({})
  active = synced
  activeKey = profile.key
  kv.setItem(LAST_KEY, profile.key)
}

export const activeProfile = () => activeKey

/** Sends progress still waiting, for a page being hidden or a sign-out. */
export const flushProgress = () => synced?.flush() ?? Promise.resolve()

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flushProgress()
  })
}

export type { Progress, ProgressStore, MomentVars } from './progress'
