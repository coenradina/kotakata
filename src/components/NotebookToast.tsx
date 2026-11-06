import { useEffect, useRef } from 'react'
import { fillMoment, t, type Lang, type TermCard } from '../i18n'
import type { MomentVars } from '../store'

export interface NotebookEntry {
  card: TermCard
  vars: MomentVars
}

interface Props {
  entry: NotebookEntry
  lang: Lang
  onOpenNotebook: () => void
  onClose: () => void
}

/** How long an entry stays before it slides away on its own. */
export const ENTRY_MS = 6000

/**
 * A new term going into Kata's notebook. It sits over the log, never over
 * the stage, and doesn't stop the run: the scene pauses briefly on its own.
 */
export default function NotebookToast({ entry, lang, onOpenNotebook, onClose }: Props) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current(), ENTRY_MS)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [entry.card.id])

  return (
    <div role="status" className="card-in absolute inset-x-0 bottom-0 z-raised rounded-lg border-2 border-ink bg-white p-3 text-ink shadow-pixel">
      <div className="flex items-start justify-between gap-2">
        <span className="type-micro text-maroon">📓 {t(lang, 'notebookNew')}</span>
        <button onClick={onClose} aria-label={t(lang, 'hintClose')} className="-mt-1 px-1 type-subheading hover:text-maroon">
          ×
        </button>
      </div>
      <p className="mt-1 flex items-center gap-2 type-pixel text-tosca-dark">
        <span className="text-icon" aria-hidden="true">
          {entry.card.icon}
        </span>
        {entry.card.term}
      </p>
      <p className="mt-1 type-body">{fillMoment(entry.card, lang, entry.vars)}</p>
      <button onClick={onOpenNotebook} className="mt-2 type-micro underline hover:text-maroon">
        {t(lang, 'notebookOpenShort')} →
      </button>
    </div>
  )
}
