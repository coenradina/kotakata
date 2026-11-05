import { useEffect, useRef } from 'react'
import type { PopupSide } from '../game/types'
import { t, type Lang, type TermCard } from '../i18n'

interface Props {
  card: TermCard
  side: PopupSide
  vars: Record<string, string | number>
  lang: Lang
  onClose: () => void
}

/**
 * The card shown over the stage the first time a term comes up. It sits on
 * the side away from the highlighted area so the highlight stays visible.
 */
export default function TermPopup({ card, side: where, vars, lang, onClose }: Props) {
  const button = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    button.current?.focus({ preventScroll: true })
  }, [card.id])

  const side = where === 'left' ? 'left-2 sm:left-3' : 'right-2 sm:right-3'
  const moment = card.moment[lang].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={`term-${card.id}`}
      className={`card-in absolute top-2 sm:top-3 ${side} z-10 flex max-h-[calc(100%-1rem)] w-[min(62%,330px)] flex-col overflow-y-auto rounded-lg border-2 border-ink bg-white shadow-[5px_5px_0_#0F172A]`}
    >
      <div className="flex items-center justify-between gap-2 bg-ink px-3 py-1.5">
        <span className="text-[10px] font-bold tracking-wider text-amber">★ {t(lang, 'newTerm')}</span>
        <span className="text-lg leading-none" aria-hidden="true">{card.icon}</span>
      </div>
      <div className="space-y-2 p-3">
        <h3 id={`term-${card.id}`} className="font-pixel text-3xl leading-none text-tosca">
          {card.term}
        </h3>
        <p className="font-sans text-xs leading-snug sm:text-[13px]">{moment}</p>
        <p className="rounded border border-ink/20 bg-parchment px-2 py-1.5 font-sans text-[11px] leading-snug text-ink/80">
          <span className="font-mono font-bold">{t(lang, 'whatItMeans')}: </span>
          {card.body[lang]}
        </p>
        <div className="flex justify-end pt-0.5">
          <button
            ref={button}
            onClick={onClose}
            className="pixel-btn rounded border-2 border-ink bg-tosca px-3 py-1.5 text-xs font-bold text-white"
          >
            {t(lang, 'gotIt')}
          </button>
        </div>
      </div>
    </div>
  )
}
