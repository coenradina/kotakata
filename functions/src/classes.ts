// Class requests (docs/plan/07-accounts-and-classes.md, section 5).
//
// - requestClass: an educator sends the form. The limit of active requests is
//   counted here, in a transaction, because Firestore rules can't count; so
//   browsers can only read requests, never write them.
// - cancelClassRequest: the educator withdraws a pending request.
// - reviewClassRequest: an admin approves or rejects. Approving creates the
//   class and its code, and gives the educator session access.
// - mailClassRequest: emails every admin about a new request, and the
//   educator about the decision. Mail goes through Gmail SMTP; in the emulator
//   it is only logged.

import './setup'
import { randomBytes } from 'node:crypto'
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { defineSecret, defineString } from 'firebase-functions/params'
import { logger } from 'firebase-functions'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { createTransport } from 'nodemailer'
import { allAdmins } from './accounts'
import { MAX_ACTIVE, cleanClassRequest, cleanNote, codeFrom, jakartaToday, type ClassRequestInput } from '../../src/account/classRequest'

const db = () => getFirestore()

const DAY_MS = 86_400_000
/** Requests hold no child data and are kept 24 months (TTL on `expireAt`). */
const KEEP_REQUEST_MS = 730 * DAY_MS
/** A class and its members are deleted 30 days after its end date. */
const KEEP_CLASS_MS = 30 * DAY_MS
const SITE = 'https://aastr.id/kotakata'

/** The Gmail account mail is sent from, and its app password (Secret Manager). */
const MAIL_FROM = defineString('MAIL_FROM', { description: 'Gmail address that sends class request emails' })
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD')

function signedIn(req: CallableRequest): string {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in first.')
  return req.auth.uid
}

function idOf(data: unknown): string {
  const id = (data as { id?: unknown } | null)?.id
  if (typeof id !== 'string' || !/^[A-Za-z0-9]{1,40}$/.test(id)) throw new HttpsError('invalid-argument', 'id is required.')
  return id
}

export const requestClass = onCall(async (req) => {
  const uid = signedIn(req)
  const now = Date.now()
  const clean = cleanClassRequest(req.data, jakartaToday(now))
  if (!clean.ok) throw new HttpsError('invalid-argument', `Bad request: ${clean.reason}.`)
  const userRef = db().doc(`users/${uid}`)
  const ref = db().collection('classRequests').doc()
  await db().runTransaction(async (tx) => {
    const user = await tx.get(userRef)
    if (user.get('role') !== 'educator') throw new HttpsError('permission-denied', 'Only educators can request a class.')
    const active = await tx.get(db().collection('classRequests').where('ownerUid', '==', uid).where('active', '==', true))
    if (active.size >= MAX_ACTIVE) throw new HttpsError('resource-exhausted', `At most ${MAX_ACTIVE} active requests.`)
    tx.set(ref, {
      ...clean.value,
      ownerUid: uid,
      ownerName: user.get('displayName') ?? '',
      ownerEmail: user.get('email') ?? req.auth?.token.email ?? null,
      ownerLang: user.get('lang') === 'en' ? 'en' : 'id',
      status: 'pending',
      active: true,
      createdAt: FieldValue.serverTimestamp(),
      reviewedBy: null,
      reviewedAt: null,
      note: '',
      classId: null,
      expireAt: Timestamp.fromMillis(now + KEEP_REQUEST_MS),
    })
    // Every request of one educator writes this document, so two sent at the
    // same moment can't both see two active requests and make four.
    tx.update(userRef, { lastRequestAt: FieldValue.serverTimestamp() })
  })
  return { id: ref.id }
})

export const cancelClassRequest = onCall(async (req) => {
  const uid = signedIn(req)
  const ref = db().doc(`classRequests/${idOf(req.data)}`)
  await db().runTransaction(async (tx) => {
    const r = await tx.get(ref)
    if (!r.exists || r.get('ownerUid') !== uid) throw new HttpsError('not-found', 'No such request.')
    if (r.get('status') !== 'pending') throw new HttpsError('failed-precondition', 'Only a pending request can be cancelled.')
    tx.update(ref, { status: 'cancelled', active: false, cancelledAt: FieldValue.serverTimestamp() })
  })
  return { status: 'cancelled' }
})

export const reviewClassRequest = onCall(async (req) => {
  const admin = signedIn(req)
  if (req.auth?.token.admin !== true) throw new HttpsError('permission-denied', 'Admins only.')
  const id = idOf(req.data)
  const { approve, note: rawNote } = req.data as { approve?: unknown; note?: unknown }
  if (typeof approve !== 'boolean') throw new HttpsError('invalid-argument', 'approve must be true or false.')
  const note = cleanNote(rawNote)
  if (note === null) throw new HttpsError('invalid-argument', 'The note is too long.')
  const ref = db().doc(`classRequests/${id}`)
  // A few candidate codes, read inside the transaction; a clash is rare.
  const candidates = Array.from({ length: 4 }, () => codeFrom(randomBytes(6)))
  return db().runTransaction(async (tx) => {
    const r = await tx.get(ref)
    if (!r.exists) throw new HttpsError('not-found', 'No such request.')
    if (r.get('status') !== 'pending') throw new HttpsError('failed-precondition', `This request is already ${r.get('status')}.`)
    const reviewed = { reviewedBy: admin, reviewedAt: FieldValue.serverTimestamp(), note }
    if (!approve) {
      tx.update(ref, { ...reviewed, status: 'rejected', active: false })
      return { status: 'rejected' as const, classId: null }
    }
    const owner = db().doc(`users/${r.get('ownerUid')}`)
    const [user, ...codes] = await Promise.all([tx.get(owner), ...candidates.map((c) => tx.get(db().doc(`codes/${c}`)))])
    const free = codes.findIndex((c) => !c.exists)
    if (free < 0) throw new HttpsError('aborted', 'No free class code; try again.')
    const code = candidates[free]
    const request = r.data() as ClassRequestInput & { ownerUid: string }
    const expireAt = Timestamp.fromMillis(Date.parse(`${request.end}T23:59:59+07:00`) + KEEP_CLASS_MS)
    const cls = db().collection('classes').doc()
    tx.set(cls, {
      ownerUid: request.ownerUid,
      requestId: id,
      code,
      sessions: request.sessions,
      start: request.start,
      end: request.end,
      status: 'active',
      research: false,
      createdAt: FieldValue.serverTimestamp(),
      closedAt: null,
      expireAt,
    })
    tx.set(db().doc(`codes/${code}`), { classId: cls.id, expireAt })
    tx.update(ref, { ...reviewed, status: 'approved', classId: cls.id })
    if (user.exists && user.get('access.sessions') !== true) tx.update(owner, { access: { sessions: true, grantedAt: FieldValue.serverTimestamp() } })
    return { status: 'approved' as const, classId: cls.id }
  })
})

// ---------- email ----------

const MODE_ID: Record<string, string> = { offline: 'Tatap muka', online: 'Daring' }
const WHO_ID: Record<string, string> = { students: 'siswa', teachers: 'guru', parents: 'orang tua' }
const sessionName = (s: string) => (s === 'hill' ? 'Klasik 3' : s === 'tavern' ? 'Klasik 4' : s.toUpperCase())

type Mail = { to: string[]; subject: string; text: string }

async function send(mail: Mail) {
  if (mail.to.length === 0) return logger.warn('mail with no recipients', { subject: mail.subject })
  if (process.env.FUNCTIONS_EMULATOR === 'true') return logger.info('mail (emulator, not sent)', mail)
  const from = MAIL_FROM.value()
  const transport = createTransport({ service: 'gmail', auth: { user: from, pass: GMAIL_APP_PASSWORD.value() } })
  // One message per address, so admins don't see each other's addresses.
  for (const to of mail.to) await transport.sendMail({ from: `Kotakata <${from}>`, to, subject: mail.subject, text: mail.text })
}

function adminMail(r: Record<string, unknown> & ClassRequestInput, to: string[]): Mail {
  const lines = [
    `${r.ownerName || 'Seorang pendidik'} (${r.ownerEmail ?? 'tanpa email'}) mengajukan kelas.`,
    '',
    `Lembaga: ${r.institution}, ${r.city}`,
    `Mode: ${MODE_ID[r.mode] ?? r.mode}`,
    `Peserta: ${r.count} (${r.participants.map((p) => WHO_ID[p] ?? p).join(', ')})`,
    ...(r.grades.length ? [`Kelas: ${r.grades.join(', ')}`] : []),
    `Sesi: ${r.sessions.map(sessionName).join(', ')}`,
    `Tanggal: ${r.start} sampai ${r.end}`,
    '',
    'Tujuan:',
    r.purpose,
    '',
    `Setujui atau tolak di ${SITE}/admin`,
  ]
  return { to, subject: `Pengajuan kelas baru: ${r.institution}, ${r.city}`, text: lines.join('\n') }
}

function decisionMail(r: Record<string, unknown> & ClassRequestInput, approved: boolean): Mail {
  const en = r.ownerLang === 'en'
  const note = typeof r.note === 'string' && r.note ? r.note : ''
  const what = `${r.institution} (${r.start} – ${r.end})`
  const lines = en
    ? [
        `Hi ${r.ownerName},`,
        '',
        approved ? `Your class request for ${what} has been approved. You can now play every session to prepare.` : `Your class request for ${what} was not approved.`,
        ...(note ? ['', `Note from the admin: ${note}`] : []),
        '',
        `See your requests at ${SITE}/guru`,
      ]
    : [
        `Halo ${r.ownerName},`,
        '',
        approved ? `Pengajuan kelasmu untuk ${what} sudah disetujui. Sekarang kamu bisa memainkan semua sesi untuk persiapan.` : `Pengajuan kelasmu untuk ${what} belum bisa disetujui.`,
        ...(note ? ['', `Catatan dari admin: ${note}`] : []),
        '',
        `Lihat pengajuanmu di ${SITE}/guru`,
      ]
  const subject = en ? (approved ? 'Your Kotakata class is approved' : 'Your Kotakata class request') : approved ? 'Kelas Kotakata-mu disetujui' : 'Pengajuan kelas Kotakata-mu'
  return { to: typeof r.ownerEmail === 'string' ? [r.ownerEmail] : [], subject, text: lines.join('\n') }
}

export const mailClassRequest = onDocumentWritten({ document: 'classRequests/{id}', secrets: [GMAIL_APP_PASSWORD], retry: false }, async (event) => {
  const before = event.data?.before.data()
  const after = event.data?.after.data() as (Record<string, unknown> & ClassRequestInput) | undefined
  if (!after) return
  try {
    if (!before) {
      const admins = (await allAdmins()).flatMap((a) => (a.email ? [a.email] : []))
      await send(adminMail(after, admins))
    } else if (before.status === 'pending' && (after.status === 'approved' || after.status === 'rejected')) {
      await send(decisionMail(after, after.status === 'approved'))
    }
  } catch (e) {
    // The request itself is saved either way; the admin queue still shows it.
    logger.error('class request mail failed', { id: event.params.id, error: e instanceof Error ? e.message : String(e) })
  }
})
