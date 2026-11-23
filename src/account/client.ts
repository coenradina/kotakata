// The browser side of accounts: Firebase Auth sign-in, the users/{uid}
// document, child profiles and the account functions. Firebase loads on
// demand, so pages that never touch an account don't pay for it.

import type { User } from 'firebase/auth'
import { FUNCTIONS_REGION, firebaseApp, liveFirestore } from '../firebase'
import { flushProgress } from '../store'
import type { Child, Profile, SignupInput } from './schema'
import type { ClassRequest, ClassRequestInput } from './classRequest'
import type { ClassInfo, Live, Member } from './classes'
import type { Again, ClassFeedbackInput, HardPart, MailingRow, Training } from './classFeedback'

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
  // Progress still waiting for the server goes out while this browser may still write it.
  await flushProgress().catch(() => {})
  const { auth, mod } = await authMod()
  await mod.signOut(auth)
}

/** The user's claims, fresh from the server so a claim set a moment ago is seen. */
export async function claimsOf(user: User) {
  const token = await user.getIdTokenResult(true)
  const c = token.claims
  const student = c.student === true && typeof c.classId === 'string' && typeof c.memberId === 'string' && typeof c.code === 'string' ? { classId: c.classId, memberId: c.memberId, code: c.code } : null
  return { admin: c.admin === true, superadmin: c.superadmin === true, student }
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

/** Adds a child profile, or renames one; an existing profile keeps its progress. */
export async function saveChild(uid: string, id: string, child: Child, isNew: boolean) {
  const { db, mod } = await store()
  const ref = mod.doc(db, 'users', uid, 'children', id)
  if (isNew) await mod.setDoc(ref, { ...child, createdAt: mod.serverTimestamp() })
  else await mod.updateDoc(ref, { nickname: child.nickname, avatar: child.avatar })
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

// ---------- classes and students ----------

export const classInfo = (code: string) => call<{ code: string }, ClassInfo>('classInfo', { code })

/** Joins a class (or comes back to it) and signs this browser in as that student. */
export async function joinClass(input: { code: string; nickname: string; picture: number[]; returning: boolean }) {
  const res = await call<typeof input, { token: string; classId: string; memberId: string; nickname: string }>('joinClass', input)
  const { auth, mod } = await authMod()
  await mod.signInWithCustomToken(auth, res.token)
  return res
}

export async function memberNickname(classId: string, memberId: string): Promise<string | null> {
  const { db, mod } = await store()
  const snap = await mod.getDoc(mod.doc(db, 'classes', classId, 'members', memberId))
  return snap.exists() ? (snap.get('nickname') as string) : null
}

export interface ClassDoc {
  id: string
  code: string
  institution: string
  sessions: string[]
  start: string
  end: string
  status: string
  memberCount: number
}

/** A class, for its educator. */
export async function loadClass(id: string): Promise<ClassDoc | null> {
  const { db, mod } = await store()
  const snap = await mod.getDoc(mod.doc(db, 'classes', id))
  if (!snap.exists()) return null
  const d = snap.data()
  return { id, code: d.code, institution: d.institution ?? '', sessions: d.sessions ?? [], start: d.start, end: d.end, status: d.status, memberCount: d.memberCount ?? 0 }
}

const toMember = (id: string, d: Record<string, unknown>): Member => {
  const live = (d.live ?? null) as Record<string, unknown> | null
  const progress = (d.progress ?? null) as { passed?: string[]; puzzlesDone?: Record<string, string[]> } | null
  return {
    id,
    nickname: String(d.nickname ?? ''),
    joinedAt: ms(d.joinedAt as Stamp),
    passed: progress?.passed ?? [],
    done: progress?.puzzlesDone ?? {},
    live: {
      session: (live?.session as string | null) ?? null,
      puzzle: (live?.puzzle as string | null) ?? null,
      since: ms(live?.since as Stamp),
      runs: Number(live?.runs ?? 0),
      hint: Number(live?.hint ?? 0),
      at: ms(live?.at as Stamp),
    } satisfies Live,
  }
}

/** Calls back with the class's students now and on every change, for the class page. Returns the unsubscribe function. */
export function watchMembers(classId: string, cb: (members: Member[]) => void, onError: (e: unknown) => void): () => void {
  let off = () => {}
  let stopped = false
  void Promise.all([liveFirestore(), import('firebase/firestore')]).then(([db, mod]) => {
    if (stopped) return
    off = mod.onSnapshot(
      mod.collection(db, 'classes', classId, 'members'),
      (snap) => cb(snap.docs.map((d) => toMember(d.id, d.data())).sort((a, b) => a.nickname.localeCompare(b.nickname, 'id'))),
      onError,
    )
  })
  return () => {
    stopped = true
    off()
  }
}

export const renameMember = (classId: string, memberId: string, nickname: string) => call<{ classId: string; memberId: string; nickname: string }, { nickname: string }>('renameMember', { classId, memberId, nickname })
export const resetMemberPicture = (classId: string, memberId: string) => call<{ classId: string; memberId: string }, { reset: boolean }>('resetMemberPicture', { classId, memberId })

// ---------- after the class ----------

/** Sends the post-class feedback, which closes the class. */
export const sendClassFeedback = (classId: string, answers: ClassFeedbackInput) =>
  call<{ classId: string; answers: ClassFeedbackInput }, { status: 'closed' }>('sendClassFeedback', { classId, answers })

/** A classFeedback document as the admin dashboard reads it (createdAt as ms). */
export interface ClassFeedback {
  classId: string
  institution: string
  city: string
  mode: string | null
  sessions: string[]
  start: string
  end: string
  members: number
  stages: Record<string, number>
  rating: number
  hard: HardPart[]
  confused: string[]
  confusedText: string
  moment: string
  again: Again
  training: Training
  createdAt: number | null
}

/** For admins: the newest feedback first. */
export async function loadClassFeedback(max = 100): Promise<ClassFeedback[]> {
  const { db, mod } = await store()
  const snap = await mod.getDocs(mod.query(mod.collection(db, 'classFeedback'), mod.orderBy('createdAt', 'desc'), mod.limit(max)))
  return snap.docs.map((doc) => {
    const d = doc.data()
    return {
      classId: doc.id,
      institution: d.institution ?? '',
      city: d.city ?? '',
      mode: d.mode ?? null,
      sessions: d.sessions ?? [],
      start: d.start,
      end: d.end,
      members: d.members ?? 0,
      stages: d.stages ?? {},
      rating: d.rating,
      hard: d.hard ?? [],
      confused: d.confused ?? [],
      confusedText: d.confusedText ?? '',
      moment: d.moment ?? '',
      again: d.again,
      training: d.training,
      createdAt: ms(d.createdAt),
    }
  })
}

/** For admins: everyone who opted in to the mailing list. */
export const mailingList = () => call<null, MailingRow[]>('mailingList', null)
