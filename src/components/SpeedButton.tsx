import { t, type Lang } from '../i18n'

interface Props {
  lang: Lang
  speed: number
  onCycle: () => void
  /** The button's look: border, background, height and type role. */
  className?: string
}

/** The stage's speed chip: each tap goes 1× → 2× → 0.5× → 1×. */
export default function SpeedButton({ lang, speed, onCycle, className = 'min-h-8 border-2 border-ink/50 bg-white type-label' }: Props) {
  const label = speed === 0.5 ? '½' : String(speed)
  return (
    <button
      onClick={(e) => {
        // The stage under it opens full screen on a tap; this tap is only for the speed.
        e.stopPropagation()
        onCycle()
      }}
      aria-label={t(lang, 'speedLabel', { x: speed })}
      title={t(lang, 'speedLabel', { x: speed })}
      className={`flex min-w-12 items-center justify-center gap-1 whitespace-nowrap rounded px-2 ${className}`}
    >
      <span aria-hidden="true">{speed >= 1 ? '▶'.repeat(speed) : '▸'}</span>
      <span>{label}×</span>
    </button>
  )
}
