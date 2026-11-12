import { useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import { t, type Key } from '../i18n'
import { impact } from '../impact'
import { useLang } from '../lang'

/**
 * What Kotakata sends, and the player's choice (docs/plan/03-technical.md,
 * section 6). The choice and "delete my data" work on this browser.
 */
export default function PrivacyPage() {
  const { lang } = useLang()
  const [consent, setConsent] = useState(() => impact.consent())
  const [forgotten, setForgotten] = useState(false)
  const choose = (yes: boolean) => {
    impact.setConsent(yes)
    setConsent(impact.consent())
  }
  const sections: [Key, Key][] = [
    ['pvPagesTitle', 'pvPages'],
    ['pvPlayTitle', 'pvPlay'],
    ['pvNeverTitle', 'pvNever'],
  ]
  return (
    <div className="min-h-full bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <h1 className="type-title">{t(lang, 'pvTitle')}</h1>
        <p className="type-lead">{t(lang, 'pvLead')}</p>
        {sections.map(([title, body]) => (
          <section key={title} className="space-y-2 rounded-lg border-2 border-ink bg-white p-4 shadow-pixel-sm">
            <h2 className="type-subheading">{t(lang, title)}</h2>
            <p className="type-body">{t(lang, body)}</p>
          </section>
        ))}
        <p className="type-body">{t(lang, 'pvWho')}</p>

        <section className="space-y-3 rounded-lg border-2 border-ink bg-white p-4 shadow-pixel-sm" aria-labelledby="pv-choice">
          <h2 id="pv-choice" className="type-subheading">
            {t(lang, 'pvChoice')} <span className="text-maroon">{t(lang, consent === 'yes' ? 'pvYes' : consent === 'no' ? 'pvNo' : 'pvUnset')}</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => choose(true)} aria-pressed={consent === 'yes'} className={`pixel-btn min-h-11 rounded border-2 border-ink px-4 py-2 type-button ${consent === 'yes' ? 'bg-ink text-cream' : 'bg-white hover:bg-parchment'}`}>
              {t(lang, 'pvYes')}
            </button>
            <button onClick={() => choose(false)} aria-pressed={consent === 'no'} className={`pixel-btn min-h-11 rounded border-2 border-ink px-4 py-2 type-button ${consent === 'no' ? 'bg-ink text-cream' : 'bg-white hover:bg-parchment'}`}>
              {t(lang, 'pvNo')}
            </button>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border-2 border-ink bg-white p-4 shadow-pixel-sm">
          <h2 className="type-subheading">{t(lang, 'pvForget')}</h2>
          <p className="type-body">{t(lang, 'pvForgetBody')}</p>
          <button
            onClick={() => {
              impact.forget()
              setForgotten(true)
            }}
            className="pixel-btn min-h-11 rounded border-2 border-ink bg-maroon px-4 py-2 type-button text-white hover:bg-maroon-dark"
          >
            {t(lang, 'pvForget')}
          </button>
          {forgotten && (
            <p role="status" className="type-label text-tosca-dark">
              {t(lang, 'pvForgotten')}
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
