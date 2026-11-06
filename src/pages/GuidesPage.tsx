import SiteHeader from '../components/SiteHeader'
import { GUIDES } from '../guides'
import { t } from '../i18n'
import { useLang } from '../lang'
import { Link } from '../router'

/** Every guide, by session: one for teachers and one for parents. */
export default function GuidesPage() {
  const { lang } = useLang()
  return (
    <div className="min-h-full bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-2">
          <h1 className="type-title">📘 {t(lang, 'gIndexTitle')}</h1>
          <p className="type-lead text-ink-soft">{t(lang, 'gIndexLead')}</p>
        </div>
        <ul className="grid gap-6 md:grid-cols-3">
          {GUIDES.map((g) => (
            <li key={g.session} className="flex flex-col rounded-lg border-2 border-ink bg-white p-6 shadow-pixel">
              <span className="type-eyebrow text-maroon">{t(lang, 'sessionLabel', { n: g.session.slice(1) })}</span>
              <h2 className="mt-2 type-heading">{g.title[lang]}</h2>
              <p className="mt-2 flex-1 type-body text-ink-soft">{g.bigQuestion[lang]}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/panduan/guru/${g.session}`} className="pixel-btn rounded border-2 border-ink bg-maroon px-3 py-1.5 type-button text-white hover:bg-maroon-dark">
                  {t(lang, 'gForGuru')}
                </Link>
                <Link to={`/panduan/ortu/${g.session}`} className="pixel-btn rounded border-2 border-ink bg-amber px-3 py-1.5 type-button hover:bg-amber-tint">
                  {t(lang, 'gForOrtu')}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
