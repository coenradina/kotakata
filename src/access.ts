// Sessions and levels that only Kotakata admins can see for now. Everyone
// else gets them as "coming soon": no link, no play page, no guide, no
// certificate. Admins (the `admin` claim) also skip the classic levels'
// order, so they can open any of them straight away.
//
// This hides them in the app, not in the bundle: the site is static, so the
// level code still ships. It keeps them off the public pages until they're
// ready, nothing more. To release one, take its id out of ADMIN_ONLY.

import { useAccount } from './account/AccountProvider'

export const ADMIN_ONLY: ReadonlySet<string> = new Set(['s4', 's5', 's6', 'hill', 'tavern'])

/** 'checking' while Firebase Auth hasn't said who is signed in yet. */
export type Access = 'public' | 'checking' | 'admin'

/** The current viewer's access, from the signed-in account. */
export function useAccess(): Access {
  const { account } = useAccount()
  if (account.status === 'loading') return 'checking'
  return account.status === 'in' && account.admin ? 'admin' : 'public'
}

/** Whether this viewer may see and play a session or level. */
export function isVisible(id: string, a: Access): boolean {
  return !ADMIN_ONLY.has(id) || a === 'admin'
}
