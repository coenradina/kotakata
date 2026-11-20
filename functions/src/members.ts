// Students in a class (docs/plan/07-accounts-and-classes.md, section 6).
//
// - classInfo: what the join page shows for a class code.
// - joinClass: a student joins with a nickname and a picture password, or
//   comes back with the same two on another device. Returns a custom token
//   for uid `m_<memberId>`, with claims { student, classId, memberId, code }.
// - renameMember, resetMemberPicture: the class's educator fixes a nickname or
//   lets a student pick new pictures.
// - cleanupClasses: every night, deletes classes 30 days past their end date,
//   with their students' documents and sign-ins.
//
// Firestore, all under classes/{classId}:
//   members/{memberId}          nickname, joinedAt, live, progress (the student writes live and progress)
//   members/{memberId}/blocks/{session}   the student's blocks, as JSON text
//   names/{hash of nickname}    memberId; keeps nicknames unique (functions only)
//   keys/{memberId}             salt and hash of the picture password (functions only)

import './setup'
import { createHash, randomBytes } from 'node:crypto'
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { logger } from 'firebase-functions'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, Timestamp, getFirestore, type DocumentReference } from 'firebase-admin/firestore'
import { LOCK_MS, MAX_FAILS, MAX_MEMBERS, classState, cleanNickname, cleanPicture, isCode, nicknameKey, type ClassInfo } from '../../src/account/classes'
import { jakartaToday } from '../../src/account/classRequest'

const db = () => getFirestore()

const sha = (s: string) => createHash('sha256').update(s).digest('hex')
const nameRef = (classId: string, nickname: string) => db().doc(`classes/${classId}/names/${sha(nicknameKey(nickname))}`)
const hashPicture = (salt: string, picture: number[]) => sha(`${salt}:${picture.join(',')}`)

async function classByCode(code: unknown) {
  if (!isCode(code)) throw new HttpsError('invalid-argument', 'Bad class code.')
  const link = await db().doc(`codes/${code}`).get()
  const classId = link.get('classId')
  if (typeof classId !== 'string') throw new HttpsError('not-found', 'No class with that code.')
  const ref = db().doc(`classes/${classId}`)
  return { classId, ref, code }
}

export const classInfo = onCall(async (req): Promise<ClassInfo> => {
  const { ref } = await classByCode((req.data as { code?: unknown } | null)?.code)
  const c = await ref.get()
  if (!c.exists) throw new HttpsError('not-found', 'No class with that code.')
  return { state: classState(c.data() as { start: string; end: string; status: string }, jakartaToday(Date.now())), start: c.get('start'), end: c.get('end'), institution: c.get('institution') ?? '' }
})

export const joinClass = onCall(async (req) => {
  const d = (req.data ?? {}) as { code?: unknown; nickname?: unknown; picture?: unknown; returning?: unknown }
  const { classId, ref, code } = await classByCode(d.code)
  const nickname = cleanNickname(d.nickname)
  const picture = cleanPicture(d.picture)
  if (!nickname) throw new HttpsError('invalid-argument', 'Bad nickname.')
  if (!picture) throw new HttpsError('invalid-argument', 'Bad picture password.')
  const returning = d.returning === true
  const now = Date.now()

  // A wrong nickname or picture is counted outside the join transaction, so
  // the count stays even though the join fails.
  const fail = async (message: string) => {
    await db().runTransaction(async (tx) => {
      const c = await tx.get(ref)
      const since = c.get('failsSince')?.toMillis?.() ?? 0
      const fresh = now - since > LOCK_MS
      const fails = (fresh ? 0 : (c.get('fails') ?? 0)) + 1
      tx.update(ref, {
        fails,
        failsSince: fresh ? Timestamp.fromMillis(now) : c.get('failsSince'),
        ...(fails >= MAX_FAILS ? { lockedUntil: Timestamp.fromMillis(now + LOCK_MS), fails: 0 } : {}),
      })
    })
    throw new HttpsError('permission-denied', message)
  }

  const outcome: { memberId: string } | { wrong: string } = await db().runTransaction(async (tx): Promise<{ memberId: string } | { wrong: string }> => {
    const c = await tx.get(ref)
    if (!c.exists) throw new HttpsError('not-found', 'No class with that code.')
    const state = classState(c.data() as { start: string; end: string; status: string }, jakartaToday(now))
    if (state !== 'open') throw new HttpsError('failed-precondition', `class ${state}`)
    if ((c.get('lockedUntil')?.toMillis?.() ?? 0) > now) throw new HttpsError('resource-exhausted', 'This class is locked for a while after too many wrong tries.', { reason: 'locked' })
    const name = await tx.get(nameRef(classId, nickname))
    if (!returning) {
      if (name.exists) throw new HttpsError('already-exists', 'nickname taken')
      if ((c.get('memberCount') ?? 0) >= MAX_MEMBERS) throw new HttpsError('resource-exhausted', 'This class is full.', { reason: 'full' })
      const member = ref.collection('members').doc()
      const salt = randomBytes(16).toString('hex')
      tx.set(member, { nickname, joinedAt: FieldValue.serverTimestamp(), progress: null, live: null })
      tx.set(ref.collection('keys').doc(member.id), { salt, hash: hashPicture(salt, picture) })
      tx.set(name.ref, { memberId: member.id })
      tx.update(ref, { memberCount: FieldValue.increment(1) })
      return { memberId: member.id }
    }
    if (!name.exists) return { wrong: 'no such nickname' }
    const memberId = name.get('memberId') as string
    const key = await tx.get(ref.collection('keys').doc(memberId))
    if (!key.exists) {
      // The educator reset this student's pictures: the ones given now become the new password.
      const salt = randomBytes(16).toString('hex')
      tx.set(key.ref, { salt, hash: hashPicture(salt, picture) })
      return { memberId }
    }
    if (key.get('hash') !== hashPicture(key.get('salt'), picture)) return { wrong: 'wrong pictures' }
    return { memberId }
  })
  if ('wrong' in outcome) return fail(outcome.wrong)
  const token = await getAuth().createCustomToken(`m_${outcome.memberId}`, { student: true, classId, memberId: outcome.memberId, code })
  return { token, classId, memberId: outcome.memberId, nickname }
})

/** The class, if the caller is its educator. */
async function ownClass(req: CallableRequest): Promise<{ ref: DocumentReference; classId: string; memberId: string }> {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in first.')
  const { classId, memberId } = (req.data ?? {}) as { classId?: unknown; memberId?: unknown }
  if (typeof classId !== 'string' || !/^[A-Za-z0-9]{1,40}$/.test(classId) || typeof memberId !== 'string' || !/^[A-Za-z0-9]{1,40}$/.test(memberId))
    throw new HttpsError('invalid-argument', 'classId and memberId are required.')
  const ref = db().doc(`classes/${classId}`)
  const c = await ref.get()
  if (!c.exists || c.get('ownerUid') !== req.auth.uid) throw new HttpsError('permission-denied', 'Only the class educator can do this.')
  return { ref, classId, memberId }
}

export const renameMember = onCall(async (req) => {
  const { ref, classId, memberId } = await ownClass(req)
  const nickname = cleanNickname((req.data as { nickname?: unknown }).nickname)
  if (!nickname) throw new HttpsError('invalid-argument', 'Bad nickname.')
  await db().runTransaction(async (tx) => {
    const member = await tx.get(ref.collection('members').doc(memberId))
    if (!member.exists) throw new HttpsError('not-found', 'No such student.')
    const oldName = nameRef(classId, member.get('nickname'))
    const newName = nameRef(classId, nickname)
    const taken = await tx.get(newName)
    if (taken.exists && taken.get('memberId') !== memberId) throw new HttpsError('already-exists', 'nickname taken')
    if (oldName.path !== newName.path) tx.delete(oldName)
    tx.set(newName, { memberId })
    tx.update(member.ref, { nickname })
  })
  return { nickname }
})

export const resetMemberPicture = onCall(async (req) => {
  const { ref, memberId } = await ownClass(req)
  if (!(await ref.collection('members').doc(memberId).get()).exists) throw new HttpsError('not-found', 'No such student.')
  await ref.collection('keys').doc(memberId).delete()
  return { reset: true }
})

/** Deletes one class: its students' sign-ins, every document under it, and its code. */
export async function deleteClass(ref: DocumentReference) {
  const members = await ref.collection('members').select().get()
  const uids = members.docs.map((m) => `m_${m.id}`)
  for (let i = 0; i < uids.length; i += 1000) await getAuth().deleteUsers(uids.slice(i, i + 1000))
  const code = (await ref.get()).get('code')
  await db().recursiveDelete(ref)
  if (typeof code === 'string') await db().doc(`codes/${code}`).delete()
}

export const cleanupClasses = onSchedule({ schedule: 'every day 03:00', timeZone: 'Asia/Jakarta' }, async () => {
  const due = await db().collection('classes').where('deleteAfter', '<=', Timestamp.now()).get()
  for (const c of due.docs) {
    try {
      await deleteClass(c.ref)
      logger.info('class deleted', { classId: c.id })
    } catch (e) {
      logger.error('class delete failed', { classId: c.id, error: e instanceof Error ? e.message : String(e) })
    }
  }
})
