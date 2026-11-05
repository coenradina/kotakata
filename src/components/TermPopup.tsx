import { useEffect, useRef } from 'react'
import { t, type Lang, type TermCard } from '../i18n'

interface Props {
  card: TermCard
  vars: Record<string, string | number>
  lang: Lang
  onClose: () => void
}

/**
 * The card shown the first time a term comes up. It sits under the stage
 * (not over it), so the part of the scene it explains stays in view.
 */
export default function TermPopup({ card, vars, lang, onClose }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    button.current?.focus({ preventScroll: true })
    box.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [card.id])

  const moment = card.moment[lang].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))

  return (
    <div
      ref={box}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`term-${card.id}`}
      className="card-in relative rounded-lg border-2 border-ink bg-white shadow-pixel"
    >
      {/* Points up at the stage */}
      <span aria-hidden="true" className="absolute -top-[9px] left-10 h-4 w-4 rotate-45 border-l-2 border-t-2 border-ink bg-ink" />
      <div className="flex items-center justify-between gap-2 rounded-t-lg bg-ink px-3 py-1.5">
        <span className="type-micro text-amber">★ {t(lang, 'newTerm')}</span>
        <span className="type-micro text-cream/80">{t(lang, 'termLook')}</span>
      </div>
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-2">
          <h3 id={`term-${card.id}`} className="flex items-center gap-2 type-pixel-lg text-tosca">
            <span className="text-icon" aria-hidden="true">
              {card.icon}
            </span>
            {card.term}
          </h3>
          <p className="type-body">{moment}</p>
          <p className="rounded border border-ink/20 bg-parchment px-2 py-1.5 type-caption text-ink/80">
            <span className="font-mono font-bold">{t(lang, 'whatItMeans')}: </span>
            {card.body[lang]}
          </p>
        </div>
        <button
          ref={button}
          onClick={onClose}
          className="pixel-btn self-end whitespace-nowrap rounded border-2 border-ink bg-tosca px-4 py-2 type-label text-white sm:self-center"
        >
          {t(lang, 'gotIt')}
        </button>
      </div>
    </div>
  )
}
