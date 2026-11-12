// The browser side of impact data (docs/plan/03-technical.md, section 6):
// the player's choice, the research ID, and a queue that is sent to
// `ingestImpact` in small batches.
//
// - Page views and the consent answer carry no ID and are sent for everyone.
// - Everything about play is sent only after the player said yes on the
//   consent card, with a random research ID that "delete my data" replaces.

import type { KeyValue } from '../store/progress'
import { jakartaDay } from './report'
import { ANONYMOUS, MAX_EVENTS, SCHEMA_VERSION, type Batch, type Device, type ImpactEvent } from './schema'

export type Consent = 'yes' | 'no' | null

/** Sends one batch. Returns whether it arrived; `beacon` is for a page being hidden. */
export type Send = (batch: Batch, beacon: boolean) => Promise<boolean>

export interface ImpactDeps {
  storage: KeyValue
  send: Send
  /** Random 128-bit ID as 32 hex characters. */
  newId: () => string
  now: () => number
  lang: () => 'id' | 'en'
  device: () => Device
  app: string
}

const KEYS = {
  consent: 'kotakata.impact.consent',
  rid: 'kotakata.impact.rid',
  queue: 'kotakata.impact.queue',
  seen: 'kotakata.impact.seen',
  guides: 'kotakata.impact.guides',
}
/** Events kept while offline. Older ones are dropped first. */
const QUEUE_CAP = 500

export function createImpact(deps: ImpactDeps) {
  const { storage } = deps
  const read = <T,>(key: string, fallback: T): T => {
    try {
      const raw = storage.getItem(key)
      return raw === null ? fallback : (JSON.parse(raw) as T)
    } catch {
      return fallback
    }
  }
  const write = (key: string, value: unknown) => {
    try {
      storage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or blocked: impact data is never worth breaking the game for.
    }
  }

  type Queued = { anon: boolean; e: ImpactEvent }
  let queue: Queued[] = read(KEYS.queue, [])
  let sending = false

  const consent = (): Consent => {
    const c = read<string | null>(KEYS.consent, null)
    return c === 'yes' || c === 'no' ? c : null
  }

  function rid(): string | null {
    if (consent() !== 'yes') return null
    let id = read<string | null>(KEYS.rid, null)
    if (!id || !/^[0-9a-f]{32}$/.test(id)) write(KEYS.rid, (id = deps.newId()))
    return id
  }

  const enqueue = (e: ImpactEvent) => {
    queue = [...queue, { anon: ANONYMOUS.has(e.t), e }].slice(-QUEUE_CAP)
    write(KEYS.queue, queue)
  }

  return {
    consent,

    /** The answer on the consent card, or on the privacy page. */
    setConsent(yes: boolean) {
      const before = consent()
      write(KEYS.consent, yes ? 'yes' : 'no')
      // Saying no later drops anything about play still waiting to be sent.
      if (!yes) {
        queue = queue.filter((q) => q.anon)
        write(KEYS.queue, queue)
      }
      if (before !== (yes ? 'yes' : 'no')) enqueue({ t: 'consent', yes })
    },

    /**
     * "Hapus data saya": a new research ID, so nothing sent from now on can be
     * joined to what was sent before, and the queue is emptied.
     */
    forget() {
      storage.removeItem(KEYS.rid)
      storage.removeItem(KEYS.seen)
      storage.removeItem(KEYS.guides)
      queue = []
      write(KEYS.queue, queue)
    },

    /** Queues an event. Events about play are dropped unless the player said yes. */
    track(e: ImpactEvent) {
      if (!ANONYMOUS.has(e.t) && consent() !== 'yes') return
      enqueue(e)
    },

    /** A page was shown. `ref` is the referring site, for the first page of a visit. */
    page(path: string, ref: string | null) {
      const day = jakartaDay(deps.now())
      const seen = read<{ site?: string; paths?: Record<string, string> }>(KEYS.seen, {})
      const paths = seen.paths ?? {}
      const firstSite = seen.site !== day
      const firstPath = paths[path] !== day
      // Keep only today's paths, so the record stays small.
      const todays = Object.fromEntries(Object.entries(paths).filter(([, d]) => d === day))
      write(KEYS.seen, { site: day, paths: { ...todays, [path]: day } })
      enqueue({ t: 'page', path, ref, firstPath, firstSite })
    },

    /** The teacher guide for a session was opened on this browser. */
    rememberGuide(session: string) {
      const seen = read<string[]>(KEYS.guides, [])
      if (!seen.includes(session)) write(KEYS.guides, [...seen, session])
    },
    guideSeen: (session: string) => read<string[]>(KEYS.guides, []).includes(session),

    pending: () => queue.length,

    /**
     * Sends what's queued, anonymous events and play events in separate
     * batches, at most MAX_EVENTS each. What fails to send stays queued.
     */
    async flush(beacon = false) {
      if (sending || queue.length === 0) return
      sending = true
      try {
        for (const anon of [true, false]) {
          for (;;) {
            const part = queue.filter((q) => q.anon === anon).slice(0, MAX_EVENTS)
            if (part.length === 0) break
            const id = anon ? null : rid()
            // Play events without a yes (consent withdrawn mid-queue) are dropped.
            if (!anon && id === null) {
              queue = queue.filter((q) => q.anon)
              break
            }
            const batch: Batch = { v: SCHEMA_VERSION, rid: id, lang: deps.lang(), device: deps.device(), app: deps.app, events: part.map((q) => q.e) }
            if (!(await deps.send(batch, beacon))) return
            queue = queue.filter((q) => !part.includes(q))
          }
        }
      } finally {
        write(KEYS.queue, queue)
        sending = false
      }
    },
  }
}

export type Impact = ReturnType<typeof createImpact>
