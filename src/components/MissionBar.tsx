import { MISSION_ANCHOR } from '../hints'
import { t, type Lang } from '../i18n'
import type { Session } from '../levels/types'

interface Props {
  lang: Lang
  level: Session
  done: string[]
  current: string
  /** The stage just changed: say so, so the new task gets read. */
  fresh: boolean
  /** One window: the task in two lines at most, and a button that opens it in full. */
  compact?: boolean
  onOpen?: () => void
}

/**
 * The current stage's task, across the top of the screen where the eye
 * lands first. Progress is a row of dots; badges live in the notebook and
 * the end-of-session card, not here.
 */
export default function MissionBar({ lang, level, done, current, fresh, compact = false, onOpen }: Props) {
  const main = level.puzzles.filter((p) => !p.bonus)
  const stage = level.puzzles.find((p) => p.id === current)!
  const n = main.findIndex((p) => p.id === current) + 1
  return (
    <section
      key={current}
      data-hint-anchor={MISSION_ANCHOR}
      data-tour="mission"
      aria-labelledby="mission-title"
      aria-live="polite"
      className={`rounded-lg border-2 border-ink bg-amber-tint shadow-pixel-sm ${compact ? 'flex items-center gap-3 px-4 py-2' : 'px-4 py-3 sm:px-6'} ${fresh ? 'card-in' : ''}`}
    >
      <div className={compact ? 'min-w-0 flex-1' : ''}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="type-eyebrow text-maroon">{stage.bonus ? `⭐ ${t(lang, 'missionBonus')}` : t(lang, 'missionStep', { n, total: main.length })}</span>
          <ol className="flex items-center gap-1.5" aria-hidden="true">
            {level.puzzles.map((p) => (
              <li
                key={p.id}
                className={`h-3 w-3 rounded-full border-2 border-ink ${done.includes(p.id) ? 'bg-tosca' : p.id === current ? 'bg-amber' : 'bg-white'} ${p.bonus ? 'rounded' : ''}`}
              />
            ))}
          </ol>
          {fresh && <span className="rounded border border-ink bg-white px-2 py-0.5 type-micro">✨ {t(lang, 'missionNew')}</span>}
          {compact && (
            <h2 id="mission-title" className="type-subheading">
              {t(lang, stage.titleKey)}
            </h2>
          )}
        </div>
        {!compact && (
          <h2 id="mission-title" className="mt-1 type-subheading">
            {t(lang, stage.titleKey)}
          </h2>
        )}
        <p className={compact ? 'mt-0.5 line-clamp-2 max-w-4xl type-body' : 'mt-1 max-w-4xl type-lead'}>{t(lang, stage.missionKey)}</p>
      </div>
      {compact && onOpen && (
        <button onClick={onOpen} className="pixel-btn shrink-0 rounded border-2 border-ink bg-white px-3 py-1.5 type-label hover:bg-parchment">
          {t(lang, 'missionRead')}
        </button>
      )}
    </section>
  )
}
