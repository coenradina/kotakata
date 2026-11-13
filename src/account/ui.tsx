import { useEffect, type ReactNode } from 'react'
import SiteHeader from '../components/SiteHeader'
import { t } from '../i18n'
import { useLang } from '../lang'
import { useRoute } from '../router'
import { useAccount, type Account } from './AccountProvider'
import type { Role } from './schema'

// Small pieces shared by the account pages, in the survey page's style.

export function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-full bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <h1 className="type-title">{title}</h1>
        {children}
      </main>
    </div>
  )
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border-2 border-ink bg-white p-4 shadow-pixel-sm sm:p-6">
      {title && <h2 className="type-subheading">{title}</h2>}
      {children}
    </section>
  )
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 type-label">
        {label}
        {required && <span className="text-maroon"> *</span>}
      </legend>
      {children}
    </fieldset>
  )
}

export function Chips({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}

export function Chip({ type, name, checked, onChange, children }: { type: 'radio' | 'checkbox'; name: string; checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center rounded border-2 border-ink bg-white px-3 py-2 type-label hover:bg-parchment has-checked:bg-ink has-checked:text-cream has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-maroon">
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  )
}

/** A consent or opt-in box. Never ticked in advance. */
export function Check({ checked, onChange, required, children }: { checked: boolean; onChange: (v: boolean) => void; required?: boolean; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 type-body">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-5 shrink-0 accent-tosca-dark" />
      <span>
        {children}
        {required && <span className="text-maroon"> *</span>}
      </span>
    </label>
  )
}

export const inputClass = 'min-h-11 w-full rounded border-2 border-ink bg-white px-3 py-2 type-body'
export const primaryButton = 'pixel-btn min-h-11 rounded border-2 border-ink bg-ink px-4 py-2 type-button text-cream disabled:opacity-60'
export const secondaryButton = 'pixel-btn min-h-11 rounded border-2 border-ink bg-white px-4 py-2 type-button hover:bg-parchment disabled:opacity-60'

/**
 * Shows the page only to a signed-in person with this role; everyone else
 * goes to /masuk, which signs them in or finishes their sign-up.
 */
export function RequireRole({ role, children }: { role: Role | 'any'; children: (account: Extract<Account, { status: 'in' }> & { profile: NonNullable<Extract<Account, { status: 'in' }>['profile']> }) => ReactNode }) {
  const { account } = useAccount()
  const { lang } = useLang()
  const { navigate } = useRoute()
  const ok = account.status === 'in' && account.profile && (role === 'any' || account.profile.role === role)
  useEffect(() => {
    if (account.status === 'loading' || ok) return
    if (account.status === 'in' && account.profile) navigate(account.profile.role === 'educator' ? '/guru' : '/ortu')
    else navigate('/masuk')
  }, [account, ok, navigate])
  if (!ok || account.status !== 'in' || !account.profile) return <Page title="">{<p className="type-body">{t(lang, 'acLoading')}</p>}</Page>
  return <>{children({ ...account, profile: account.profile })}</>
}

export function errorText(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return String(e)
}
