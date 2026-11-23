// Progress kept on the server for a student in a class or a parent's child
// profile (docs/plan/07-accounts-and-classes.md, section 6). The game still
// reads and writes a local store, synchronously; this layer copies every
// change to the server a moment later, and on another device fills the local
// store from the server first.

import { EMPTY, type KeyValue, type Progress, type ProgressStore } from './progress'

/** Where a profile's progress lives on the server. Blocks are JSON text, one entry per session. */
export interface Remote {
  load(): Promise<{ progress: Partial<Progress> | null; blocks: Record<string, string> }>
  saveProgress(progress: Progress): Promise<void>
  saveBlocks(sessionId: string, json: string): Promise<void>
}

/** Keys under a prefix, so each profile on a device has its own copy. */
export function prefixed(kv: KeyValue, prefix: string): KeyValue {
  return {
    getItem: (k) => kv.getItem(prefix + k),
    setItem: (k, v) => kv.setItem(prefix + k, v),
    removeItem: (k) => kv.removeItem(prefix + k),
  }
}

const union = <T>(a: readonly T[] = [], b: readonly T[] = []) => [...new Set([...a, ...b])]

/**
 * Two copies of one player's progress, combined. Progress only grows (cards,
 * stages, badges), so nothing either copy has is lost; settings come from
 * this device.
 */
export function mergeProgress(local: Progress, remote: Partial<Progress> | null): Progress {
  if (!remote) return local
  const stars = { ...remote.stars }
  for (const [id, n] of Object.entries(local.stars)) stars[id as keyof typeof stars] = Math.max(n ?? 0, stars[id as keyof typeof stars] ?? 0)
  const puzzlesDone: Record<string, string[]> = { ...remote.puzzlesDone }
  for (const [id, list] of Object.entries(local.puzzlesDone)) puzzlesDone[id] = union(list, puzzlesDone[id])
  return {
    ...local,
    cards: union(local.cards, remote.cards),
    moments: { ...remote.moments, ...local.moments },
    stars,
    passed: union(local.passed, remote.passed),
    puzzlesDone,
    badges: union(local.badges, remote.badges),
    lastSession: local.lastSession ?? remote.lastSession ?? null,
    quizRecent: local.quizRecent.length ? local.quizRecent : (remote.quizRecent ?? []),
    tourDone: local.tourDone || remote.tourDone === true,
    introSeen: union(local.introSeen, remote.introSeen),
    surveyDone: local.surveyDone || remote.surveyDone === true,
  }
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export interface SyncedStore extends ProgressStore {
  /** Sends what is waiting now (a page being hidden, a sign-out). */
  flush(): Promise<void>
}

/**
 * Wraps a local store so changes also reach `remote`, at most every `delayMs`.
 * Failed writes are retried with the next change or flush; the local copy
 * keeps the game working offline.
 */
export function createSyncedStore(local: ProgressStore, remote: Remote, delayMs = 2000, onError: (e: unknown) => void = () => {}): SyncedStore {
  let progressDirty = false
  const blocksDirty = new Map<string, string>()
  let timer: ReturnType<typeof setTimeout> | null = null
  let sending: Promise<void> | null = null

  const send = async () => {
    timer = null
    if (sending) await sending
    const jobs: Promise<void>[] = []
    if (progressDirty) {
      progressDirty = false
      jobs.push(
        remote.saveProgress(local.load()).catch((e) => {
          progressDirty = true
          onError(e)
        }),
      )
    }
    for (const [id, json] of [...blocksDirty]) {
      blocksDirty.delete(id)
      jobs.push(
        remote.saveBlocks(id, json).catch((e) => {
          if (!blocksDirty.has(id)) blocksDirty.set(id, json)
          onError(e)
        }),
      )
    }
    sending = Promise.all(jobs).then(() => undefined)
    await sending
    sending = null
  }
  const schedule = () => {
    if (!timer) timer = setTimeout(() => void send(), delayMs)
  }

  return {
    load: () => local.load(),
    save(patch) {
      local.save(patch)
      progressDirty = true
      schedule()
    },
    loadBlocks: (id) => local.loadBlocks(id),
    saveBlocks(id, blocks) {
      local.saveBlocks(id, blocks)
      blocksDirty.set(id, JSON.stringify(blocks))
      schedule()
    },
    clear(sessionIds = []) {
      local.clear(sessionIds)
      progressDirty = true
      for (const id of sessionIds) blocksDirty.set(id, 'null')
      schedule()
    },
    async flush() {
      if (timer) clearTimeout(timer)
      await send()
    },
  }
}

/**
 * Fills a profile's local store from the server: progress merged, and blocks
 * for sessions this device has none of. Returns whether the server's copy is
 * behind and should be sent the merged one.
 */
export async function pullInto(local: ProgressStore, remote: Remote): Promise<boolean> {
  const { progress, blocks } = await remote.load()
  const before = local.load()
  const merged = mergeProgress(before, progress)
  if (!same(merged, before)) local.save(merged)
  for (const [id, json] of Object.entries(blocks)) {
    if (local.loadBlocks(id) !== null) continue
    try {
      const parsed = JSON.parse(json) as object | null
      if (parsed) local.saveBlocks(id, parsed)
    } catch {
      // A broken copy on the server: the session starts from its starter blocks.
    }
  }
  return !same(merged, { ...EMPTY, ...progress })
}
