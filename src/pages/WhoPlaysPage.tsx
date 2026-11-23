import { useAccount } from '../account/AccountProvider'
import { Page } from '../account/ui'
import { t } from '../i18n'
import { useLang } from '../lang'
import { Link } from '../router'

/**
 * "Siapa yang main?": a parent with more than one child profile picks who
 * plays before the map or a session opens (docs/plan/07-accounts-and-classes.md,
 * section 4). The pick lasts for this tab; the page they asked for then shows.
 */
export default function WhoPlaysPage() {
  const { lang } = useLang()
  const { player, pickChild } = useAccount()
  const kids = player.kind === 'choose' ? player.children : []
  return (
    <Page title={t(lang, 'wpTitle')}>
      <p className="type-lead">{t(lang, 'wpLead')}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {kids.map((c) => (
          <li key={c.id}>
            <button onClick={() => pickChild(c.id)} className="pixel-btn flex min-h-20 w-full items-center gap-4 rounded-lg border-2 border-ink bg-white p-4 text-left shadow-pixel-sm hover:bg-parchment">
              <span className="type-title" aria-hidden>
                {c.avatar}
              </span>
              <span className="type-heading">{c.nickname}</span>
            </button>
          </li>
        ))}
      </ul>
      <Link to="/ortu" className="inline-block type-label underline hover:text-maroon">
        {t(lang, 'wpManage')}
      </Link>
    </Page>
  )
}
