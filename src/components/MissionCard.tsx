import { useEffect, useRef } from 'react'
import MissionBar from './MissionBar'
import { t, type Lang } from '../i18n'
import type { Session } from '../levels/types'
import { backdropClass, panelClass } from './modalFrame'

interface Props {
  lang: Lang
  level: Session
  done: string[]
  current: string
  onClose: () => void
}

/**
 * The whole task, when the mission bar only has room for two lines: it
 * opens by itself when a new stage starts, and from the bar's "Read mission".
 */
export default function MissionCard({ lang, level, done, current, onClose }: Props) {
  const go = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    go.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={backdropClass(false, 'bg-ink/30')} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={t(lang, 'missionRead')} className={`${panelClass(false, 'max-w-2xl')} p-4`}>
        <MissionBar lang={lang} level={level} done={done} current={current} fresh={false} />
        <div className="mt-4 flex justify-end">
          <button ref={go} onClick={onClose} className="pixel-btn rounded border-2 border-ink bg-maroon px-4 py-2 type-button-lg text-white hover:bg-maroon-dark">
            {t(lang, 'missionGo')}
          </button>
        </div>
      </div>
    </div>
  )
}
