import { useEffect, useRef } from 'react'
import { LEVELS, levelById, type LevelId } from '../levels'
import { t, type CardId, type Lang } from '../i18n'

interface Props {
  lang: Lang
  levelId: LevelId
  found: Set<CardId>
  badges: Set<string>
  /** True when this was the last level left: show the whole-game recap. */
  allDone: boolean
  onNext: (id: LevelId) => void
  onClose: () => void
}

/** Celebrates a finished level, and the whole game once every level is done. */
export default function LevelCompleteModal({ lang, levelId, found, badges, allDone, onNext, onClose }: Props) {
  const level = levelById(levelId)
  const index = LEVELS.findIndex((l) => l.id === levelId)
  const next = LEVELS[index + 1]
  const hasBonus = level.stages.some((s) => s.bonus)
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="done-title" className="card-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 border-ink bg-cream shadow-[6px_6px_0_#0F172A]">
        <div className="bg-ink px-5 py-3">
          <h2 id="done-title" className="font-pixel text-3xl leading-none text-amber">
            {allDone ? t(lang, 'finTitle') : `🎉 ${t(lang, 'lcTitle', { n: index + 1 })}`}
          </h2>
          <p className="mt-1 text-xs font-semibold text-cream/80">{allDone ? t(lang, 'finBody') : level.title[lang]}</p>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider">{t(lang, 'lcCards')}</h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {cards.map((c) => (
                <li key={c.id} className={`rounded border-2 border-ink bg-white px-3 py-2 ${found.has(c.id) ? '' : 'opacity-40'}`}>
                  <div className="font-pixel text-lg leading-none text-tosca">
                    {c.icon} {c.term}
                  </div>
                  <p className="mt-1 font-sans text-xs leading-snug text-ink/80">{c.body[lang]}</p>
                </li>
              ))}
            </ul>
          </div>
          {!allDone && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-bold uppercase tracking-wider">{t(lang, 'badges')}</span>
              {level.achievements.map((a) => (
                <span
                  key={a.id}
                  title={t(lang, a.titleKey)}
                  className={`flex h-8 w-8 items-center justify-center rounded border-2 text-lg ${badges.has(`${level.id}:${a.id}`) ? 'border-ink bg-white' : 'border-ink/20 opacity-40 grayscale'}`}
                >
                  {a.icon}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            {hasBonus && !allDone && (
              <button onClick={onClose} className="pixel-btn rounded border-2 border-ink bg-white px-4 py-2 text-xs font-bold">
                {t(lang, 'lcBonus')}
              </button>
            )}
            {next && !allDone ? (
              <button ref={primary} onClick={() => onNext(next.id)} className="pixel-btn rounded border-2 border-ink bg-maroon px-4 py-2 text-xs font-bold text-white">
                {t(lang, 'lcNext')}
              </button>
            ) : (
              <button ref={primary} onClick={onClose} className="pixel-btn rounded border-2 border-ink bg-tosca px-4 py-2 text-xs font-bold text-white">
                {t(lang, 'close')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
