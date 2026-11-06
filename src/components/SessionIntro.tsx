import { useEffect, useRef } from 'react'
import PixelSprite from './PixelSprite'
import { t, type Lang } from '../i18n'

interface Props {
  lang: Lang
  /** "SESI 1" or "LEVEL 2". */
  label: string
  title: string
  /** The session's big question, or its topic for a classic level. */
  goal: string
  stages: number
  /** Offer the tour of the screen (first visit only). */
  offerTour: boolean
  onTour: () => void
  onPlay: () => void
}

/** The first thing a player sees in a session: what it's about, before any blocks. */
export default function SessionIntro({ lang, label, title, goal, stages, offerTour, onTour, onPlay }: Props) {
  const primary = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    primary.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onPlay()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPlay])

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-ink/60 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="intro-title" className="card-in w-full max-w-xl rounded-lg border-2 border-ink bg-cream p-6 shadow-pixel-lg sm:p-8">
        <div className="flex items-start gap-4">
          <div className="kata-bob hidden shrink-0 rounded-lg border-2 border-ink bg-white p-3 sm:block">
            <PixelSprite sprite="robot0" scale={5} />
          </div>
          <div className="min-w-0 space-y-2">
            <p className="type-eyebrow text-maroon">{label}</p>
            <h2 id="intro-title" className="type-heading">
              {title}
            </h2>
          </div>
        </div>
        <div className="mt-6 rounded-lg border-2 border-ink bg-amber-tint p-4">
          <p className="type-label text-maroon">🎯 {t(lang, 'introGoal')}</p>
          <p className="mt-1 type-lead font-bold">{goal}</p>
        </div>
        <p className="mt-4 type-body text-ink-soft">{t(lang, 'introHow', { n: stages })}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {offerTour ? (
            <>
              <button onClick={onPlay} className="pixel-btn rounded border-2 border-ink bg-white px-4 py-2 type-button-lg hover:bg-parchment">
                {t(lang, 'introSkip')}
              </button>
              <button ref={primary} onClick={onTour} className="pixel-btn rounded border-2 border-ink bg-maroon px-4 py-2 type-button-lg text-white hover:bg-maroon-dark">
                {t(lang, 'introTour')}
              </button>
            </>
          ) : (
            <button ref={primary} onClick={onPlay} className="pixel-btn rounded border-2 border-ink bg-maroon px-4 py-2 type-button-lg text-white hover:bg-maroon-dark">
              {t(lang, 'tourDone')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
