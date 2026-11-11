import { useEffect, useRef, useState, type ReactNode } from 'react'
import KataSays, { useTypewriter } from './KataSays'
import { t, type Lang } from '../i18n'
import { backdropClass, panelClass } from './modalFrame'

interface Props {
  lang: Lang
  /** "SESI 1" or "LEVEL 2". */
  label: string
  title: string
  /** The session's big question, or its topic for a classic level. */
  goal: string
  stages: number
  /** The player has never opened a session: Kata introduces itself first. */
  firstTime: boolean
  /** Offer the tour of the screen (until it has been seen). */
  offerTour: boolean
  onTour: () => void
  onPlay: () => void
  /** Slide up from the bottom edge, for phones. */
  sheet?: boolean
}

interface Line {
  text: string
  /** Shown under the line once it has been said. */
  extra?: ReactNode
}

/**
 * The first thing a player sees in a session: Kata says hello, then what
 * the session is about, one line at a time. A tap finishes the line, the
 * next tap goes on.
 */
export default function SessionIntro({ lang, label, title, goal, stages, firstTime, offerTour, onTour, onPlay, sheet = false }: Props) {
  const goalBox = (
    <div className="mt-2 rounded border-2 border-ink bg-amber-tint p-3">
      <p className="type-micro text-maroon">🎯 {title}</p>
      <p className="mt-1 type-lead font-bold">{goal}</p>
    </div>
  )
  const lines: Line[] = [
    ...(firstTime ? [{ text: t(lang, 'kataHi1') }, { text: t(lang, 'kataHi2') }] : [{ text: t(lang, 'kataBack') }]),
    { text: t(lang, 'kataMission'), extra: goalBox },
    { text: t(lang, 'kataHow', { n: stages }) },
    { text: t(lang, offerTour ? 'kataTourOffer' : 'kataGo') },
  ]
  const [i, setI] = useState(0)
  const line = lines[i]
  const last = i === lines.length - 1
  const { shown, done, finish } = useTypewriter(line.text)
  const primary = useRef<HTMLButtonElement>(null)
  const tapper = useRef<HTMLButtonElement>(null)

  const advance = () => {
    if (!done) finish()
    else if (!last) setI(i + 1)
  }

  useEffect(() => {
    if (last && done) primary.current?.focus()
    else tapper.current?.focus({ preventScroll: true })
  }, [last, done, i])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onPlay()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPlay])

  return (
    <div className={backdropClass(sheet, 'bg-ink/60')}>
      <div role="dialog" aria-modal="true" aria-labelledby="intro-title" className={`${panelClass(sheet, 'max-w-xl')} ${sheet ? 'p-4' : 'p-6 sm:p-8'}`}>
        <div className="flex items-center justify-between gap-2">
          <p id="intro-title" className="type-eyebrow text-maroon">
            {label} · {title}
          </p>
          {!last && (
            <button onClick={() => setI(lines.length - 1)} className="type-label underline hover:text-maroon">
              {t(lang, 'tourSkip')}
            </button>
          )}
        </div>

        {/* The bubble is one big button: tapping anywhere on it moves Kata along. */}
        <button ref={tapper} onClick={advance} disabled={last && done} className="mt-4 block w-full text-left outline-none disabled:cursor-default" aria-live="polite">
          <KataSays talking={!done} scale={sheet ? 4 : 5}>
            <p className="min-h-12 type-lead">
              {shown}
              {/* Keeps the bubble at its final size while the text types in. */}
              <span className="invisible">{line.text.slice(shown.length)}</span>
            </p>
            {done && line.extra}
          </KataSays>
        </button>

        <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
          {lines.map((_, n) => (
            <span key={n} className={`h-1.5 w-4 rounded-full ${n <= i ? 'bg-maroon' : 'bg-ink/20'}`} />
          ))}
        </div>

        {/* Always one row of buttons: Next while Kata talks, then the way in. */}
        <div className={`mt-6 flex flex-wrap justify-end gap-2 ${sheet ? '[&>button]:min-h-11 [&>button]:flex-1' : ''}`}>
          {!last ? (
            <button onClick={advance} tabIndex={-1} className="pixel-btn rounded border-2 border-ink bg-white px-4 py-2 type-button-lg hover:bg-parchment">
              {t(lang, 'tourNext')}
            </button>
          ) : offerTour ? (
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
