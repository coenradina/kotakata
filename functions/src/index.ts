// Impact data on the server (docs/plan/03-technical.md, section 6).
//
// - ingestImpact: the game POSTs batches here. Each is checked against the
//   schema in src/impact/schema.ts and stored as one document in
//   `impact_batches`, stamped with the day in Jakarta and an expiry.
// - impactReport: the admin dashboard asks for a date range. Days are counted
//   from the raw batches and survey answers; days that can't change any more
//   are cached in `impact_daily`. Only the admin reads the report, so it
//   carries the real counts, small ones included.
//
// Firestore rules give browsers no access to either collection.

import { setGlobalOptions } from 'firebase-functions/v2'
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions'
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { cleanBatch } from '../../src/impact/schema'
import { AGG_VERSION, aggregateDay, buildReport, daysBetween, jakartaDay, type DayAgg, type StoredAnswer, type StoredBatch } from '../../src/impact/report'

setGlobalOptions({ region: 'asia-southeast2', maxInstances: 5 })
initializeApp()
const db = getFirestore()

const DAY_MS = 86_400_000
/** Raw batches are deleted by a Firestore TTL policy on `expireAt` (firestore.indexes.json). */
const KEEP_MS = 730 * DAY_MS
const MAX_BODY = 32_000
/** Longest range one report may cover: the raw batches' whole lifetime. */
const MAX_DAYS = 731

export const ingestImpact = onRequest({ cors: [/^https:\/\/aastr\.id$/, /^http:\/\/localhost(:\d+)?$/], memory: '256MiB', concurrency: 80 }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }
  const raw = req.rawBody?.toString('utf8') ?? ''
  if (!raw || raw.length > MAX_BODY) {
    res.status(400).end()
    return
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    res.status(400).end()
    return
  }
  const clean = cleanBatch(parsed)
  if (!clean) {
    res.status(400).end()
    return
  }
  const now = Date.now()
  await db.collection('impact_batches').add({
    ...clean.batch,
    day: jakartaDay(now),
    at: FieldValue.serverTimestamp(),
    expireAt: Timestamp.fromMillis(now + KEEP_MS),
  })
  if (clean.dropped) logger.info('impact events dropped', { dropped: clean.dropped })
  res.status(204).end()
})

const isDay = (x: unknown): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(Date.parse(`${x}T00:00:00Z`))

export const impactReport = onCall({ memory: '512MiB', timeoutSeconds: 120 }, async (req) => {
  if (req.auth?.token.admin !== true) throw new HttpsError('permission-denied', 'Admins only.')
  const { from, to } = (req.data ?? {}) as { from?: unknown; to?: unknown }
  if (!isDay(from) || !isDay(to) || from > to) throw new HttpsError('invalid-argument', 'from and to must be YYYY-MM-DD, from <= to.')
  const now = Date.now()
  const today = jakartaDay(now)
  // A day is final two days later: offline queues have had time to arrive.
  const lastFinal = jakartaDay(now - 2 * DAY_MS)
  const days = daysBetween(from, to).filter((d) => d <= today)
  if (days.length > MAX_DAYS) throw new HttpsError('invalid-argument', `At most ${MAX_DAYS} days.`)
  const counted = await Promise.all(days.map((day) => loadDay(day, day <= lastFinal)))
  return buildReport(from, to, counted, 0)
})

async function loadDay(day: string, final: boolean): Promise<{ day: string; agg: DayAgg }> {
  const cache = db.doc(`impact_daily/${day}`)
  if (final) {
    const snap = await cache.get()
    // Stored as JSON text: one field, no index per map key.
    if (snap.exists && snap.get('v') === AGG_VERSION) return { day, agg: JSON.parse(snap.get('json')) as DayAgg }
  }
  const start = Date.parse(`${day}T00:00:00+07:00`)
  const [batchSnap, answerSnap] = await Promise.all([
    db.collection('impact_batches').where('day', '==', day).get(),
    db
      .collection('feedback')
      .where('at', '>=', Timestamp.fromMillis(start))
      .where('at', '<', Timestamp.fromMillis(start + DAY_MS))
      .get(),
  ])
  const batches: StoredBatch[] = batchSnap.docs.map((d) => {
    const b = d.data()
    return { rid: b.rid ?? null, lang: b.lang, device: b.device, events: b.events ?? [], at: (b.at as Timestamp | undefined)?.toMillis() ?? 0 }
  })
  const answers: StoredAnswer[] = answerSnap.docs.map((d) => {
    const a = d.data()
    return { role: a.role, session: a.session ?? null, fun: a.fun, clear: a.clear, stuck: a.stuck ?? [], again: a.again, essay: a.essay ?? '', at: (a.at as Timestamp).toMillis() }
  })
  const agg = aggregateDay(day, batches, answers)
  if (final) await cache.set({ v: AGG_VERSION, json: JSON.stringify(agg), at: FieldValue.serverTimestamp() })
  return { day, agg }
}
