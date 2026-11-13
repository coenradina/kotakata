import { t, type Lang } from '../i18n'
import { useLang } from '../lang'
import { Link, useRoute } from '../router'
import { homeOf, useAccount } from '../account/AccountProvider'

/** The top bar on every page except the game: logo, page links, language. */
export default function SiteHeader() {
  const { lang, setLang } = useLang()
  const { route } = useRoute()
  const links = [
    { to: '/main', label: t(lang, 'navMap') },
    { to: '/buku', label: t(lang, 'navNotebook') },
    { to: '/panduan', label: t(lang, 'gIndexTitle') },
    { to: '/survei', label: t(lang, 'navSurvey') },
  ]
  return (
    <header className="z-nav border-b-2 border-ink bg-cream">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Kotakata">
          <span className="flex h-10 w-10 items-center justify-center rounded border-2 border-ink bg-tosca-dark type-pixel text-white shadow-pixel-sm">KK</span>
          <span className="type-heading">Kotakata</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2" aria-label={t(lang, 'navMap')}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              aria-current={route === l.to || route.startsWith(`${l.to}/`) ? 'page' : undefined}
              className={`rounded border-2 border-ink px-3 py-1.5 type-button ${route === l.to || route.startsWith(`${l.to}/`) ? 'bg-ink text-cream' : 'bg-white hover:bg-parchment'}`}
            >
              {l.label}
            </Link>
          ))}
          <AccountLink />
          <LangSwitch lang={lang} onChange={setLang} />
        </nav>
      </div>
    </header>
  )
}

export function LangSwitch({ lang, onChange, disabled }: { lang: Lang; onChange: (l: Lang) => void; disabled?: boolean }) {
  return (
    <div className="flex overflow-hidden rounded border-2 border-ink type-label" role="group" aria-label="Language">
      {(['id', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          disabled={disabled}
          aria-pressed={lang === l}
          className={`min-h-10 min-w-10 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-60 ${lang === l ? 'bg-ink text-cream' : 'bg-white hover:bg-parchment'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/** "Masuk" for guests; the person's name, linking to their home page, once signed in. */
function AccountLink() {
  const { lang } = useLang()
  const { account } = useAccount()
  const { route } = useRoute()
  if (account.status === 'loading') return null
  const signedUp = account.status === 'in' && (account.profile || account.admin)
  const to = signedUp ? homeOf(account) : '/masuk'
  const label = account.status === 'in' && account.profile ? t(lang, 'navAccount', { name: account.profile.displayName }) : account.status === 'in' && account.admin ? 'Admin' : t(lang, 'navSignIn')
  const current = route === to
  return (
    <Link to={to} aria-current={current ? 'page' : undefined} className={`max-w-48 truncate rounded border-2 border-ink px-3 py-1.5 type-button ${current ? 'bg-ink text-cream' : 'bg-amber-tint hover:bg-parchment'}`}>
      {label}
    </Link>
  )
}
