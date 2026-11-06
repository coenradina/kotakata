import { useEffect, useRef } from 'react'
import { LEVELS, levelById, type SessionId } from '../levels'
import { t, type CardId, type Lang } from '../i18n'

interface Props {
  lang: Lang
  levelId: SessionId
  found: Set<CardId>
  badges: Set<string>
  /** True when this was the last level left: show the whole-game recap. */
  allDone: boolean
  onNext: (id: SessionId) => void
  onClose: () => void
  /** Opens the certificate for this level. */
  onCertificate: (id: SessionId) => void
}

/** Celebrates a finished level, and the whole game once every level is done. */
export default function LevelCompleteModal({ lang, levelId, found, badges, allDone, onNext, onClose, onCertificate }: Props) {
  const level = levelById(levelId)
  const index = LEVELS.findIndex((l) => l.id === levelId)
  const next = LEVELS[index + 1]
  const hasBonus = level.puzzles.some((s) => s.bonus)
  const primary = useRef<HTMLButtonElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    primary.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const cards = allDone ? LEVELS.flatMap((l) => l.cards) : level.cards

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-ink/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="done-title" className="card-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 border-ink bg-cream shadow-pixel-lg">
        <div className="bg-ink px-6 py-3">
          <h2 id="done-title" className="type-pixel-lg text-amber">
            {allDone ? t(lang, 'finTitle') : `🎉 ${t(lang, 'lcTitle', { n: index + 1 })}`}
          </h2>
          <p className="mt-1 type-label text-cream/80">{allDone ? t(lang, 'finBody') : level.title[lang]}</p>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <h3 className="type-eyebrow">{t(lang, 'lcCards')}</h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {cards.map((c) => (
                <li key={c.id} className={`rounded border-2 border-ink bg-white px-3 py-2 ${found.has(c.id) ? '' : 'opacity-40'}`}>
                  <div className="type-pixel-sm text-tosca-dark">
                    {c.icon} {c.term}
                  </div>
                  <p className="mt-1 type-caption text-ink/80">{c.body[lang]}</p>
                </li>
              ))}
            </ul>
          </div>
          {!allDone && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 type-eyebrow">{t(lang, 'badges')}</span>
              {level.badgeDefs.map((a) => (
                <span
                  key={a.id}
                  title={t(lang, a.titleKey)}
                  className={`flex h-8 w-8 items-center justify-center rounded border-2 text-icon-sm ${badges.has(`${level.id}:${a.id}`) ? 'border-ink bg-white' : 'border-ink/20 opacity-40 grayscale'}`}
                >
                  {a.icon}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button onClick={() => onCertificate(levelId)} className="pixel-btn mr-auto rounded border-2 border-ink bg-amber px-4 py-2 type-label hover:bg-amber-tint">
              {t(lang, 'lcCertificate')}
            </button>
            {hasBonus && !allDone && (
              <button onClick={onClose} className="pixel-btn rounded border-2 border-ink bg-white px-4 py-2 type-label">
                {t(lang, 'lcBonus')}
              </button>
            )}
            {next && !allDone ? (
              <button ref={primary} onClick={() => onNext(next.id)} className="pixel-btn rounded border-2 border-ink bg-maroon px-4 py-2 type-label text-white">
                {t(lang, 'lcNext')}
              </button>
            ) : (
              <button ref={primary} onClick={onClose} className="pixel-btn rounded border-2 border-ink bg-tosca-dark px-4 py-2 type-label text-white">
                {t(lang, 'close')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
