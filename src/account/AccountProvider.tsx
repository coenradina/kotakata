import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { claimsOf, loadProfile, watchUser } from './client'
import type { Profile } from './schema'

export type Account =
  | { status: 'loading' }
  | { status: 'out' }
  | {
      status: 'in'
      user: User
      admin: boolean
      superadmin: boolean
      /** Null until the person finishes sign-up. */
      profile: Profile | null
    }

const AccountContext = createContext<{ account: Account; refresh: () => Promise<void> }>({ account: { status: 'loading' }, refresh: async () => {} })

/** Who is signed in, their claims and their users/{uid} document, for every page. */
export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account>({ status: 'loading' })
  const [user, setUser] = useState<User | null | undefined>(undefined)

  const load = useCallback(async (u: User | null) => {
    if (!u) return setAccount({ status: 'out' })
    try {
      const [claims, profile] = await Promise.all([claimsOf(u), loadProfile(u.uid)])
      setAccount({ status: 'in', user: u, ...claims, profile })
    } catch {
      // Offline or blocked: treat as signed in without a profile rather than hanging.
      setAccount({ status: 'in', user: u, admin: false, superadmin: false, profile: null })
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

  return <AccountContext value={{ account, refresh }}>{children}</AccountContext>
}

export const useAccount = () => use(AccountContext)

/** Where a signed-in person's home is. */
export function homeOf(account: Account): string {
  if (account.status !== 'in') return '/masuk'
  if (!account.profile) return account.admin ? '/admin' : '/masuk'
  return account.profile.role === 'educator' ? '/guru' : '/ortu'
}
