// The browser side of accounts: Firebase Auth sign-in, the users/{uid}
// document, child profiles and the account functions. Firebase loads on
// demand, so pages that never touch an account don't pay for it.

import type { User } from 'firebase/auth'
import { FUNCTIONS_REGION, firebaseApp } from '../firebase'
import type { Child, Profile, SignupInput } from './schema'
import type { ClassRequest, ClassRequestInput } from './classRequest'

async function authMod() {
  const [app, mod] = await Promise.all([firebaseApp(), import('firebase/auth')])
  return { auth: mod.getAuth(app), mod }
}

async function store() {
  const [app, mod] = await Promise.all([firebaseApp(), import('firebase/firestore/lite')])
  return { db: mod.getFirestore(app), mod }
}

async function call<I, O>(name: string, data: I): Promise<O> {
  const [app, { getFunctions, httpsCallable }] = await Promise.all([firebaseApp(), import('firebase/functions')])
  return (await httpsCallable<I, O>(getFunctions(app, FUNCTIONS_REGION), name)(data)).data
}

/** Calls back with the signed-in user, or null, now and on every change. Returns the unsubscribe function. */
export function watchUser(cb: (user: User | null) => void): () => void {
  let off = () => {}
  let stopped = false
  void authMod().then(({ auth, mod }) => {
    if (!stopped) off = mod.onAuthStateChanged(auth, cb)
  })
  return () => {
    stopped = true
    off()
  }
}

export async function signInWithGoogle() {
  const { auth, mod } = await authMod()
  await mod.signInWithPopup(auth, new mod.GoogleAuthProvider())
}

const EMAIL_KEY = 'kotakata.signin.email'

/** Sends a sign-in link to the address. It opens /masuk, which finishes the sign-in. */
export async function sendSignInLink(email: string, returnUrl: string, lang: 'id' | 'en') {
  const { auth, mod } = await authMod()
  auth.languageCode = lang
  await mod.sendSignInLinkToEmail(auth, email, { url: returnUrl, handleCodeInApp: true })
  try {
    localStorage.setItem(EMAIL_KEY, email)
  } catch {
    // Without storage the page asks for the address again.
  }
}

/**
 * Finishes a sign-in from an email link, if this page is one. `email` is
 * needed when the link is opened on another device than the one that asked.
 */
export function finishSignInLink(url: string, email?: string): Promise<'not-a-link' | 'need-email' | 'done'> {
  // A link's code works once, so a second call for the same link (a re-render) waits on the first.
  const key = `${url}|${email ?? ''}`
  let run = finishing.get(key)
  if (!run) {
    run = finish(url, email)
    finishing.set(key, run)
    // A failed attempt (a typo in the address) may be tried again.
    run.catch(() => finishing.delete(key))
  }
  return run
}
const finishing = new Map<string, Promise<'not-a-link' | 'need-email' | 'done'>>()

async function finish(url: string, email?: string): Promise<'not-a-link' | 'need-email' | 'done'> {
  const { auth, mod } = await authMod()
  if (!mod.isSignInWithEmailLink(auth, url)) return 'not-a-link'
  let address = email
  try {
    address ??= localStorage.getItem(EMAIL_KEY) ?? undefined
  } catch {
    // Ask instead.
  }
  if (!address) return 'need-email'
  await mod.signInWithEmailLink(auth, address, url)
  try {
    localStorage.removeItem(EMAIL_KEY)
  } catch {
    // Nothing to clean up.
  }
  return 'done'
}

export async function signOut() {
  const { auth, mod } = await authMod()
  await mod.signOut(auth)
}

/** The user's claims, fresh from the server so a claim set a moment ago is seen. */
export async function claimsOf(user: User) {
  const token = await user.getIdTokenResult(true)
  return { admin: token.claims.admin === true, superadmin: token.claims.superadmin === true }
}

type Stamp = { toMillis(): number } | null | undefined
const ms = (t: Stamp) => (t && typeof t.toMillis === 'function' ? t.toMillis() : null)

export async function loadProfile(uid: string): Promise<Profile | null> {
  const { db, mod } = await store()
  const snap = await mod.getDoc(mod.doc(db, 'users', uid))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    role: d.role,
    displayName: d.displayName,
    email: d.email ?? null,
    lang: d.lang,
    survey: d.survey ?? null,
    training: d.training ?? null,
    mailing: { optIn: d.mailing?.optIn === true, at: ms(d.mailing?.at) },
    access: { sessions: d.access?.sessions === true, grantedAt: ms(d.access?.grantedAt) },
    createdAt: ms(d.createdAt),
  }
}

export const completeSignup = (input: SignupInput) => call<SignupInput, { role: string }>('completeSignup', input)

/** Changes the fields a browser may change (firestore.rules). */
export async function updateProfile(uid: string, patch: Partial<Pick<Profile, 'displayName' | 'lang' | 'survey' | 'training'>> & { mailing?: boolean }) {
  const { db, mod } = await store()
  const { mailing, ...rest } = patch
  const data: Record<string, unknown> = { ...rest }
  if (mailing !== undefined) data.mailing = { optIn: mailing, at: mailing ? mod.serverTimestamp() : null }
  await mod.updateDoc(mod.doc(db, 'users', uid), data)
}

export const deleteAccount = async () => {
  await call<null, { deleted: boolean }>('deleteAccount', null)
  await signOut()
}

export type ChildProfile = Child & { id: string }

export async function loadChildren(uid: string): Promise<ChildProfile[]> {
  const { db, mod } = await store()
  const snap = await mod.getDocs(mod.collection(db, 'users', uid, 'children'))
  return snap.docs.map((d) => ({ id: d.id, nickname: d.get('nickname'), avatar: d.get('avatar') })).sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }))
}

export async function saveChild(uid: string, id: string, child: Child) {
  const { db, mod } = await store()
  await mod.setDoc(mod.doc(db, 'users', uid, 'children', id), { ...child, createdAt: mod.serverTimestamp() })
}

export async function removeChild(uid: string, id: string) {
  const { db, mod } = await store()
  await mod.deleteDoc(mod.doc(db, 'users', uid, 'children', id))
}

// ---------- class requests ----------

function toRequest(id: string, d: Record<string, unknown>): ClassRequest {
  return {
    id,
    institution: d.institution as string,
    city: d.city as string,
    mode: d.mode as ClassRequest['mode'],
    participants: (d.participants as ClassRequest['participants']) ?? [],
    count: d.count as number,
    grades: (d.grades as ClassRequest['grades']) ?? [],
    sessions: (d.sessions as ClassRequest['sessions']) ?? [],
    start: d.start as string,
    end: d.end as string,
    purpose: d.purpose as string,
    ownerUid: d.ownerUid as string,
    ownerName: (d.ownerName as string) ?? '',
    ownerEmail: (d.ownerEmail as string | null) ?? null,
    status: d.status as ClassRequest['status'],
    active: d.active === true,
    createdAt: ms(d.createdAt as Stamp),
    reviewedAt: ms(d.reviewedAt as Stamp),
    note: (d.note as string) ?? '',
    classId: (d.classId as string | null) ?? null,
  }
}

/** Newest first. */
const byNewest = (a: ClassRequest, b: ClassRequest) => (b.createdAt ?? Infinity) - (a.createdAt ?? Infinity)

/** The educator's own requests, newest first. */
export async function loadMyRequests(uid: string): Promise<ClassRequest[]> {
  const { db, mod } = await store()
  const snap = await mod.getDocs(mod.query(mod.collection(db, 'classRequests'), mod.where('ownerUid', '==', uid)))
  return snap.docs.map((d) => toRequest(d.id, d.data())).sort(byNewest)
}

/** For admins: pending requests, oldest first, and approved classes still running, newest first. */
export async function loadRequestQueue(): Promise<{ pending: ClassRequest[]; approved: ClassRequest[] }> {
  const { db, mod } = await store()
  const col = mod.collection(db, 'classRequests')
  const [pending, approved] = await Promise.all([
    mod.getDocs(mod.query(col, mod.where('status', '==', 'pending'))),
    mod.getDocs(mod.query(col, mod.where('status', '==', 'approved'), mod.where('active', '==', true))),
  ])
  return {
    pending: pending.docs.map((d) => toRequest(d.id, d.data())).sort((a, b) => byNewest(b, a)),
    approved: approved.docs.map((d) => toRequest(d.id, d.data())).sort(byNewest),
  }
}

export const requestClass = (input: ClassRequestInput) => call<ClassRequestInput, { id: string }>('requestClass', input)
export const cancelClassRequest = (id: string) => call<{ id: string }, { status: string }>('cancelClassRequest', { id })
export const reviewClassRequest = (id: string, approve: boolean, note: string) =>
  call<{ id: string; approve: boolean; note: string }, { status: 'approved' | 'rejected'; classId: string | null }>('reviewClassRequest', { id, approve, note })

export const listAdmins = () => call<null, { email: string | null; uid: string; superadmin: boolean }[]>('listAdmins', null)
export const setAdmin = (email: string, admin: boolean) => call<{ email: string; admin: boolean }, { email: string; admin: boolean }>('setAdmin', { email, admin })
