// Where a student's or a child profile's progress lives on the server
// (src/store/sync.ts), and the "where is this student now" record the class
// page reads. Firebase loads on demand.

import { firebaseApp } from '../firebase'
import type { Remote } from '../store/sync'
import type { Progress } from '../store/progress'
import { onTrack, type ImpactEvent } from '../impact/track'

async function store() {
  const [app, mod] = await Promise.all([firebaseApp(), import('firebase/firestore/lite')])
  return { db: mod.getFirestore(app), mod }
}

/** Progress in the `progress` field of a document, and blocks in its `blocks` subcollection. */
function remoteAt(path: string[]): Remote {
  return {
    async load() {
      const { db, mod } = await store()
      const [doc, blocks] = await Promise.all([mod.getDoc(mod.doc(db, path.join('/'))), mod.getDocs(mod.collection(db, [...path, 'blocks'].join('/')))])
      return {
        progress: (doc.get('progress') as Partial<Progress> | null | undefined) ?? null,
        blocks: Object.fromEntries(blocks.docs.map((b) => [b.id, String(b.get('json'))])),
      }
    },
    async saveProgress(progress) {
      const { db, mod } = await store()
      // Firestore keeps no undefined values; JSON drops them.
      await mod.updateDoc(mod.doc(db, path.join('/')), { progress: JSON.parse(JSON.stringify(progress)) })
    },
    async saveBlocks(sessionId, json) {
      const { db, mod } = await store()
      await mod.setDoc(mod.doc(db, [...path, 'blocks', sessionId].join('/')), { json, at: mod.serverTimestamp() })
    },
  }
}

export const memberRemote = (classId: string, memberId: string) => remoteAt(['classes', classId, 'members', memberId])
export const childRemote = (uid: string, childId: string) => remoteAt(['users', uid, 'children', childId])

/**
 * Reports where a student is, for the class page: the session and stage,
 * since when, runs and the strongest hint on it. Driven by the same events
 * the game tracks for impact data, which a student never sends (their class
 * has research off). Returns the function that stops it.
 */
export function reportLive(classId: string, memberId: string): () => void {
  type State = { session: string | null; puzzle: string | null; runs: number; hint: number }
  let state: State = { session: null, puzzle: null, runs: 0, hint: 0 }
  let whole = true
  let timer: ReturnType<typeof setTimeout> | null = null

  const write = async () => {
    timer = null
    const { db, mod } = await store()
    const ref = mod.doc(db, 'classes', classId, 'members', memberId)
    const at = mod.serverTimestamp()
    try {
      if (whole) {
        whole = false
        await mod.updateDoc(ref, { live: { ...state, since: state.puzzle ? at : null, at } })
      } else {
        await mod.updateDoc(ref, { 'live.runs': state.runs, 'live.hint': state.hint, 'live.at': at })
      }
    } catch (e) {
      whole = true
      console.warn('[live]', e)
    }
  }
  const soon = (now = false) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => void write(), now ? 0 : 1000)
  }

  const off = onTrack((e: ImpactEvent) => {
    if (e.t === 'session_start') {
      state = { session: e.session, puzzle: null, runs: 0, hint: 0 }
      whole = true
      soon(true)
    } else if (e.t === 'puzzle_start') {
      state = { session: e.session, puzzle: e.puzzle, runs: 0, hint: 0 }
      whole = true
      soon(true)
    } else if (e.t === 'run' && e.puzzle === state.puzzle) {
      state = { ...state, runs: Math.max(state.runs, e.n), hint: Math.max(state.hint, e.hint) }
      soon()
    } else if (e.t === 'session_complete') {
      state = { session: e.session, puzzle: null, runs: 0, hint: 0 }
      whole = true
      soon(true)
    }
  })
  return () => {
    off()
    if (timer) clearTimeout(timer)
  }
}
