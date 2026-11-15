import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { impact } from '../impact'
import { lastProfile, switchProfile } from '../store'
import { claimsOf, loadChildren, loadProfile, memberNickname, watchUser, type ChildProfile } from './client'
import { childRemote, memberRemote, reportLive } from './progressRemote'
import type { Profile } from './schema'

/** A student in a class, signed in through the class link (functions/src/members.ts). */
export interface Student {
  classId: string
  memberId: string
  code: string
  nickname: string
}

export type Account =
  | { status: 'loading' }
  | { status: 'out' }
  | {
      status: 'in'
      user: User
      admin: boolean
      superadmin: boolean
      /** Null until the person finishes sign-up, and for students. */
      profile: Profile | null
      student: Student | null
    }

/** Whose progress the game shows. */
export type Player = { kind: 'guest' } | { kind: 'student'; nickname: string } | { kind: 'child'; child: ChildProfile } | { kind: 'choose'; children: ChildProfile[] }

interface Ctx {
  account: Account
  refresh: () => Promise<void>
  player: Player
  /** False while a profile's progress is still being fetched; the game waits for it. */
  ready: boolean
  /** Changes when the progress store switches to another profile, so the game remounts. */
  storeKey: string
  /** A parent picks which child plays ("Siapa yang main?"). */
  pickChild: (id: string) => void
  /** Reloads a parent's child profiles after they change. */
  reloadChildren: () => Promise<void>
}

const AccountContext = createContext<Ctx>({
  account: { status: 'loading' },
  refresh: async () => {},
  player: { kind: 'guest' },
  ready: true,
  storeKey: 'guest',
  pickChild: () => {},
  reloadChildren: async () => {},
})

// The child picked in this tab. A new visit asks again, as siblings share devices.
const CHILD_KEY = 'kotakata.child'
const pickedChild = (uid: string) => {
  try {
    return sessionStorage.getItem(`${CHILD_KEY}.${uid}`)
  } catch {
    return null
  }
}

/** Who is signed in, their claims and their users/{uid} document, for every page. */
export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account>({ status: 'loading' })
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [kids, setKids] = useState<ChildProfile[]>([])
  const [childId, setChildId] = useState<string | null>(null)
  // A device that last played as a profile waits for it; a guest's device starts at once.
  const [ready, setReady] = useState(() => lastProfile() === null)
  const [storeKey, setStoreKey] = useState('guest')

  const load = useCallback(async (u: User | null) => {
    if (!u) {
      setKids([])
      return setAccount({ status: 'out' })
    }
    try {
      const [claims, profile] = await Promise.all([claimsOf(u), loadProfile(u.uid).catch(() => null)])
      const student = claims.student ? { ...claims.student, nickname: (await memberNickname(claims.student.classId, claims.student.memberId).catch(() => null)) ?? '' } : null
      if (profile?.role === 'parent') {
        const list = await loadChildren(u.uid).catch(() => [])
        setKids(list)
        setChildId(list.length === 1 ? list[0].id : pickedChild(u.uid))
      } else setKids([])
      setAccount({ status: 'in', user: u, admin: claims.admin, superadmin: claims.superadmin, profile, student })
    } catch {
      // Offline or blocked: treat as signed in without a profile rather than hanging.
      setAccount({ status: 'in', user: u, admin: false, superadmin: false, profile: null, student: null })
    }
  }, [])

  // Firebase Auth loads after the page has painted, so the first view isn't held up by it.
  useEffect(() => {
    let off = () => {}
    const timer = window.setTimeout(() => {
      off = watchUser((u) => {
        setUser(u)
        void load(u)
      })
    }, 0)
    return () => {
      window.clearTimeout(timer)
      off()
    }
  }, [load])

  const refresh = useCallback(async () => {
    if (user !== undefined) await load(user)
  }, [user, load])

  const reloadChildren = useCallback(async () => {
    if (account.status !== 'in' || account.profile?.role !== 'parent') return
    const list = await loadChildren(account.user.uid)
    setKids(list)
    setChildId((id) => (list.length === 1 ? list[0].id : list.some((c) => c.id === id) ? id : null))
  }, [account])

  const pickChild = useCallback(
    (id: string) => {
      if (account.status === 'in') {
        try {
          sessionStorage.setItem(`${CHILD_KEY}.${account.user.uid}`, id)
        } catch {
          // Without storage the pick lasts until the page closes.
        }
      }
      setChildId(id)
    },
    [account],
  )

  const student = account.status === 'in' ? account.student : null
  const child = account.status === 'in' && account.profile?.role === 'parent' ? (kids.find((c) => c.id === childId) ?? null) : null
  const parentUid = account.status === 'in' && account.profile?.role === 'parent' ? account.user.uid : null

  // Switch the progress store to whoever plays now.
  useEffect(() => {
    if (account.status === 'loading') return
    let cancelled = false
    const target = student
      ? { key: `m_${student.classId}_${student.memberId}`, remote: memberRemote(student.classId, student.memberId) }
      : child && parentUid
        ? { key: `c_${parentUid}_${child.id}`, remote: childRemote(parentUid, child.id) }
        : null
    void switchProfile(target).finally(() => {
      if (cancelled) return
      setStoreKey(target?.key ?? 'guest')
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [account.status, student?.classId, student?.memberId, child?.id, parentUid]) // eslint-disable-line react-hooks/exhaustive-deps

  // A student's play isn't sent for research (their class has it off), and the class page sees where they are.
  useEffect(() => {
    if (!student) return
    impact.pausePlay(true)
    const stop = reportLive(student.classId, student.memberId)
    return () => {
      stop()
      impact.pausePlay(false)
    }
  }, [student?.classId, student?.memberId]) // eslint-disable-line react-hooks/exhaustive-deps

  const player: Player = student
    ? { kind: 'student', nickname: student.nickname }
    : child
      ? { kind: 'child', child }
      : parentUid && kids.length > 1
        ? { kind: 'choose', children: kids }
        : { kind: 'guest' }

  return <AccountContext value={{ account, refresh, player, ready, storeKey, pickChild, reloadChildren }}>{children}</AccountContext>
}

export const useAccount = () => use(AccountContext)

/** Where a signed-in person's home is. */
export function homeOf(account: Account): string {
  if (account.status !== 'in') return '/masuk'
  if (account.student) return `/kelas/${account.student.code}`
  if (!account.profile) return account.admin ? '/admin' : '/masuk'
  return account.profile.role === 'educator' ? '/guru' : '/ortu'
}
