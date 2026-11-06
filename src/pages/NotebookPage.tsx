import { fillMoment, t, type CardId } from '../i18n'
import { useLang } from '../lang'
import { ALL, numberOf, trackOf } from '../levels'
import { MAX_STARS } from '../quiz/questions'
import { Link } from '../router'
import { store } from '../store'

/**
 * Kata's notebook: every term the player has met, grouped by session, each
 * with the moment they found it. Terms not met yet are empty slots, so the
 * player can see what's left.
 */
export default function NotebookPage() {
  const { lang, setLang } = useLang()
  const progress = store.load()
  const found = new Set<CardId>(progress.cards)
  const total = ALL.reduce((n, l) => n + l.cards.length, 0)

  return (
    <div className="min-h-full bg-parchment">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-cream px-4 py-3 sm:px-6">
        <Link to="/" className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-label hover:bg-parchment">
          {t(lang, 'backToGame')}
        </Link>
        <div className="flex overflow-hidden rounded border-2 border-ink type-label" role="group" aria-label="Language">
          {(['id', 'en'] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`px-3 py-1.5 ${lang === l ? 'bg-ink text-cream' : 'bg-white hover:bg-parchment'}`}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <h1 className="type-title">📓 {t(lang, 'notebookTitle')}</h1>
          <p className="type-lead text-ink-soft">{t(lang, 'notebookIntro')}</p>
          <p className="type-label text-tosca-dark">{t(lang, 'notebookCount', { found: found.size, total })}</p>
        </div>

        {ALL.map((level) => (
          <section key={level.id} aria-labelledby={`nb-${level.id}`} className="space-y-3">
            <h2 id={`nb-${level.id}`} className="type-heading">
              {t(lang, trackOf(level.id).track === 'sessions' ? 'sessionN' : 'levelN', { n: numberOf(level.id) })} · {level.title[lang]}{' '}
              <span className="type-pixel-sm text-maroon">
                {level.cards.filter((c) => found.has(c.id)).length}/{level.cards.length}
              </span>
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {level.cards.map((card) => {
                if (!found.has(card.id)) {
                  return (
                    <li key={card.id} className="flex min-h-32 items-center justify-center rounded-lg border-2 border-dashed border-ink/40 bg-cream">
                      <span className="type-pixel-sm text-ink-muted">🔒 {t(lang, 'locked')}</span>
                    </li>
                  )
                }
                const vars = progress.moments[card.id]
                const stars = progress.stars[card.id] ?? 0
                return (
                  <li key={card.id} className="rounded-lg border-2 border-ink bg-white p-4 shadow-pixel-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="flex items-center gap-2 type-subheading text-tosca-dark">
                        <span className="text-icon" aria-hidden="true">
                          {card.icon}
                        </span>
                        <span lang="en">{card.term}</span>
                      </h3>
                      <span className="whitespace-nowrap text-icon-sm" role="img" aria-label={t(lang, 'starsLabel', { n: stars })}>
                        {Array.from({ length: MAX_STARS }, (_, k) => (
                          <span key={k} className={k < stars ? 'text-gold' : 'text-ink/20'}>
                            ★
                          </span>
                        ))}
                      </span>
                    </div>
                    <p className="mt-2 type-body">{card.body[lang]}</p>
                    {vars && (
                      <p className="mt-3 rounded border border-ink/20 bg-parchment px-2 py-1.5 type-caption text-ink-soft">
                        <span className="font-bold">{t(lang, 'yourMoment')}: </span>
                        {fillMoment(card, lang, vars)}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </main>
    </div>
  )
}
