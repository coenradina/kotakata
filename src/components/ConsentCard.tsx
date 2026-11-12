import { useEffect, useRef } from 'react'
import { t, type Lang } from '../i18n'
import { Link } from '../router'
import PixelSprite from './PixelSprite'
import { backdropClass, panelClass } from './modalFrame'

/**
 * Asked once, before the first session (docs/plan/03-technical.md, section 6,
 * "Consent"). Neither answer is preselected or styled as the main one, and
 * nothing about play is sent until the player picks yes.
 */
export default function ConsentCard({ lang, onAnswer, sheet = false }: { lang: Lang; onAnswer: (yes: boolean) => void; sheet?: boolean }) {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => title.current?.focus(), [])
  const [before, after] = t(lang, 'consentLater').split('{link}')
  return (
    <div className={backdropClass(sheet, 'bg-cream')}>
      <div role="dialog" aria-modal="true" aria-labelledby="consent-title" className={panelClass(sheet, 'max-w-md')}>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <PixelSprite sprite="robot0" scale={3} className="shrink-0" label="Kata" />
            <h2 id="consent-title" ref={title} tabIndex={-1} className="type-heading outline-none">
              {t(lang, 'consentTitle')}
            </h2>
          </div>
          <p className="type-body">{t(lang, 'consentBody')}</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onAnswer(true)} className="pixel-btn min-h-12 rounded border-2 border-ink bg-white px-4 py-2 type-button-lg hover:bg-parchment">
              {t(lang, 'consentYes')}
            </button>
            <button onClick={() => onAnswer(false)} className="pixel-btn min-h-12 rounded border-2 border-ink bg-white px-4 py-2 type-button-lg hover:bg-parchment">
              {t(lang, 'consentNo')}
            </button>
          </div>
          <p className="type-caption text-ink-muted">
            {before}
            <Link to="/privasi" className="underline hover:text-maroon">
              {t(lang, 'pvTitle')}
            </Link>
            {after}
          </p>
        </div>
      </div>
    </div>
  )
}
