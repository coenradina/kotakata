// Accounts for educators and parents (docs/plan/07-accounts-and-classes.md,
// sections 3 and 4).
//
// - completeSignup: writes users/{uid} once, from the sign-up form, with
//   session access for parents. The browser can't create that document, so
//   `access` and the consent timestamps can't be forged.
// - deleteAccount: removes the person's document, child profiles and sign-in,
//   and their name and email from their class requests.
// - listAdmins, setAdmin: superadmins manage who has the admin claim.

import './setup'
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { cleanSignup } from '../../src/account/schema'

const db = () => getFirestore()

function signedIn(req: CallableRequest): string {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in first.')
  return req.auth.uid
}

function superadmin(req: CallableRequest): string {
  const uid = signedIn(req)
  if (req.auth?.token.superadmin !== true) throw new HttpsError('permission-denied', 'Superadmins only.')
  return uid
}

export const completeSignup = onCall(async (req) => {
  const uid = signedIn(req)
  const clean = cleanSignup(req.data)
  if (!clean.ok) throw new HttpsError('invalid-argument', `Bad sign-up: ${clean.reason}.`)
  const s = clean.value
  const ref = db().doc(`users/${uid}`)
  await db().runTransaction(async (tx) => {
    if ((await tx.get(ref)).exists) throw new HttpsError('already-exists', 'This account has already signed up.')
    const now = FieldValue.serverTimestamp()
    tx.set(ref, {
      role: s.role,
      displayName: s.displayName,
      email: req.auth?.token.email ?? null,
      lang: s.lang,
      survey: s.survey,
      adultAt: now,
      termsAt: now,
      training: s.training,
      mailing: { optIn: s.mailing, at: s.mailing ? now : null },
      // Parents get the sessions at sign-up; educators once a class request is approved.
      access: { sessions: s.role === 'parent', grantedAt: s.role === 'parent' ? now : null },
      createdAt: now,
    })
  })
  return { role: s.role }
})

export const deleteAccount = onCall(async (req) => {
  const uid = signedIn(req)
  // Class requests are kept 24 months for the record, but without who sent
  // them; a pending one is cancelled, since nobody is left to run the class.
  const requests = await db().collection('classRequests').where('ownerUid', '==', uid).get()
  const batch = db().batch()
  for (const r of requests.docs) {
    const pending = r.get('status') === 'pending'
    batch.update(r.ref, { ownerName: '', ownerEmail: null, ...(pending ? { status: 'cancelled', active: false, cancelledAt: FieldValue.serverTimestamp() } : {}) })
  }
  await batch.commit()
  await db().recursiveDelete(db().doc(`users/${uid}`))
  await getAuth().deleteUser(uid)
  return { deleted: true }
})

/** Every account with the admin claim. Also used to email admins about class requests. */
export async function allAdmins() {
  const admins: { email: string | null; uid: string; superadmin: boolean }[] = []
  let page: string | undefined
  do {
    const res = await getAuth().listUsers(1000, page)
    for (const u of res.users) {
      if (u.customClaims?.admin === true) admins.push({ email: u.email ?? null, uid: u.uid, superadmin: u.customClaims?.superadmin === true })
    }
    page = res.pageToken
  } while (page)
  return admins
}

export const listAdmins = onCall(async (req) => {
  superadmin(req)
  return allAdmins()
})

export const setAdmin = onCall(async (req) => {
  const me = superadmin(req)
  const { email, admin } = (req.data ?? {}) as { email?: unknown; admin?: unknown }
  if (typeof email !== 'string' || typeof admin !== 'boolean') throw new HttpsError('invalid-argument', 'email and admin are required.')
  let user
  try {
    user = await getAuth().getUserByEmail(email.trim().toLowerCase())
  } catch {
    throw new HttpsError('not-found', 'No account with that email. They must sign in once first.')
  }
  if (user.uid === me) throw new HttpsError('failed-precondition', "You can't change your own admin access.")
  if (user.customClaims?.superadmin === true) throw new HttpsError('failed-precondition', 'Superadmins are changed with the set-admin script.')
  await getAuth().setCustomUserClaims(user.uid, { ...(user.customClaims ?? {}), admin })
  return { email: user.email, admin }
})
