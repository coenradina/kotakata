// After a class (docs/plan/07-accounts-and-classes.md, sections 7 and 10).
//
// - sendClassFeedback: the class's educator sends the post-class form, from
//   the start date on. In one transaction it stores the feedback in
//   `classFeedback/{classId}`, closes the class, frees the request's slot,
//   and saves the training answer and a mailing list opt-in on the account.
// - mailingList: admins export everyone who opted in to the mailing list.
//
// Feedback holds no student data: only how many students finished each
// stage. It is kept 24 months (TTL on `expireAt`), after the class itself is
// deleted.

import './setup'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { canSendFeedback, cleanClassFeedback, stageCounts, type MailingRow } from '../../src/account/classFeedback'
import { jakartaToday } from '../../src/account/classRequest'

const db = () => getFirestore()

const DAY_MS = 86_400_000
const KEEP_FEEDBACK_MS = 730 * DAY_MS
/** A class closed early is deleted 30 days after closing instead of 30 days after its end date. */
const KEEP_CLASS_MS = 30 * DAY_MS

export const sendClassFeedback = onCall(async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in first.')
  const uid = req.auth.uid
  const { classId, answers } = (req.data ?? {}) as { classId?: unknown; answers?: unknown }
  if (typeof classId !== 'string' || !/^[A-Za-z0-9]{1,40}$/.test(classId)) throw new HttpsError('invalid-argument', 'classId is required.')
  const ref = db().doc(`classes/${classId}`)
  const now = Date.now()
  await db().runTransaction(async (tx) => {
    const c = await tx.get(ref)
    if (!c.exists || c.get('ownerUid') !== uid) throw new HttpsError('permission-denied', 'Only the class educator can do this.')
    const cls = c.data() as { start: string; end: string; status: string; sessions: string[]; code: string; requestId: string; institution?: string; memberCount?: number; deleteAfter?: Timestamp }
    if (cls.status === 'closed') throw new HttpsError('failed-precondition', 'class closed')
    if (!canSendFeedback(cls, jakartaToday(now))) throw new HttpsError('failed-precondition', 'class notYet')
    const clean = cleanClassFeedback(answers, cls.sessions ?? [])
    if (!clean.ok) throw new HttpsError('invalid-argument', `Bad feedback: ${clean.reason}.`)
    const a = clean.value
    const requestRef = db().doc(`classRequests/${cls.requestId}`)
    const userRef = db().doc(`users/${uid}`)
    const [members, request, user] = await Promise.all([tx.get(ref.collection('members').select('progress')), tx.get(requestRef), tx.get(userRef)])
    const done = members.docs.map((m) => ({ done: (m.get('progress')?.puzzlesDone ?? {}) as Record<string, string[]> }))
    const deleteAfter = Timestamp.fromMillis(Math.min(cls.deleteAfter?.toMillis() ?? Infinity, now + KEEP_CLASS_MS))

    tx.set(db().doc(`classFeedback/${classId}`), {
      ownerUid: uid,
      classId,
      requestId: cls.requestId,
      institution: cls.institution ?? '',
      city: request.get('city') ?? '',
      mode: request.get('mode') ?? null,
      sessions: cls.sessions,
      start: cls.start,
      end: cls.end,
      members: members.size,
      stages: stageCounts(done, cls.sessions),
      rating: a.rating,
      hard: a.hard,
      confused: a.confused,
      confusedText: a.confusedText,
      moment: a.moment,
      again: a.again,
      training: a.training,
      lang: user.get('lang') === 'en' ? 'en' : 'id',
      createdAt: FieldValue.serverTimestamp(),
      expireAt: Timestamp.fromMillis(now + KEEP_FEEDBACK_MS),
    })
    tx.update(ref, { status: 'closed', closedAt: FieldValue.serverTimestamp(), deleteAfter })
    // The code's TTL is only a backstop for cleanupClasses; keep it in step.
    tx.set(db().doc(`codes/${cls.code}`), { expireAt: deleteAfter }, { merge: true })
    if (request.exists) tx.update(requestRef, { active: false })
    if (user.exists) {
      const patch: Record<string, unknown> = { training: a.training }
      if (a.mailing && user.get('mailing.optIn') !== true) patch.mailing = { optIn: true, at: FieldValue.serverTimestamp() }
      tx.update(userRef, patch)
    }
  })
  return { status: 'closed' }
})

export const mailingList = onCall(async (req): Promise<MailingRow[]> => {
  if (req.auth?.token.admin !== true) throw new HttpsError('permission-denied', 'Admins only.')
  const snap = await db().collection('users').where('mailing.optIn', '==', true).get()
  return snap.docs
    .map((d) => ({
      name: String(d.get('displayName') ?? ''),
      email: String(d.get('email') ?? ''),
      role: String(d.get('role') ?? ''),
      institution: String(d.get('survey.institution') ?? ''),
      city: String(d.get('survey.city') ?? ''),
      training: String(d.get('training') ?? ''),
      lang: String(d.get('lang') ?? ''),
      optInAt: (d.get('mailing.at') as Timestamp | null)?.toMillis() ?? null,
    }))
    .filter((r) => r.email)
    .sort((a, b) => (a.optInAt ?? 0) - (b.optInAt ?? 0))
})
