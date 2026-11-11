import { useEffect, useRef } from 'react'
import KataSays from './KataSays'
import { t, type Lang } from '../i18n'
import type { Session } from '../levels/types'
import { backdropClass, panelClass } from './modalFrame'

interface Props {
  lang: Lang
  level: Session
  /** The stage just cleared, and the one that comes next. */
  stageId: string
  nextId: string
  done: string[]
  onNext: () => void
  /** Slide up from the bottom edge, for phones. */
  sheet?: boolean
}

/**
 * Between two stages: well done first, then what's next. The next stage's
 * task only shows once the player presses Next, so the win gets a moment
 * of its own and the new task gets read on its own.
 */
export default function StageClearCard({ lang, level, stageId, nextId, done, onNext, sheet = false }: Props) {
  const main = level.puzzles.filter((p) => !p.bonus)
  const stage = level.puzzles.find((p) => p.id === stageId)!
  const next = level.puzzles.find((p) => p.id === nextId)!
  const n = main.findIndex((p) => p.id === stageId) + 1
  const nextN = main.findIndex((p) => p.id === nextId) + 1
  const go = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    go.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onNext()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNext])

  return (
    <div className={backdropClass(sheet, 'bg-ink/30')}>
      <div role="dialog" aria-modal="true" aria-labelledby="clear-title" className={`${panelClass(sheet, 'max-w-lg')} ${sheet ? 'p-4' : 'p-6'}`}>
        <p className="type-eyebrow text-tosca-dark">🎉 {stage.bonus ? t(lang, 'missionBonus') : t(lang, 'missionStep', { n, total: main.length })}</p>
        <h2 id="clear-title" className="mt-1 type-heading">
          {t(lang, 'stageClearTitle', { title: t(lang, stage.titleKey) })}
        </h2>

        <ol className="mt-3 flex items-center gap-1.5" aria-hidden="true">
          {level.puzzles.map((p) => (
            <li
              key={p.id}
              className={`h-3 w-3 rounded-full border-2 border-ink ${done.includes(p.id) ? 'bg-tosca' : p.id === nextId ? 'bg-amber' : 'bg-white'} ${p.bonus ? 'rounded' : ''}`}
            />
          ))}
        </ol>

        <KataSays className="mt-4" scale={sheet ? 3 : 4}>
          <p className="type-lead">{t(lang, stage.clearKey ?? 'stageClearKata')}</p>
        </KataSays>

        <div className="mt-4 rounded border-2 border-ink bg-amber-tint p-3">
          <p className="type-micro text-maroon">{t(lang, 'stageClearUpNext')}</p>
          <p className="mt-1 type-subheading">
            {next.bonus ? `⭐ ${t(lang, 'missionBonus')}` : t(lang, 'stageClearNextN', { n: nextN })} · {t(lang, next.titleKey)}
          </p>
        </div>

        <div className={`mt-6 flex justify-end ${sheet ? '[&>button]:min-h-11 [&>button]:flex-1' : ''}`}>
          <button ref={go} onClick={onNext} className="pixel-btn rounded border-2 border-ink bg-maroon px-4 py-2 type-button-lg text-white hover:bg-maroon-dark">
            {next.bonus ? t(lang, 'stageClearGoBonus') : t(lang, 'stageClearGo', { n: nextN })}
          </button>
        </div>
      </div>
    </div>
  )
}
