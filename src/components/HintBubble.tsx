import { useEffect, useState } from 'react'
import { t, type Key, type Lang } from '../i18n'
import type { Hint } from '../hints'

interface Props {
  hint: Hint
  lang: Lang
  /** `reveal` is true on the first call only. */
  locate: (reveal: boolean) => DOMRect | null
  onClose: () => void
}

/**
 * A speech bubble pointing at one block or field, with a pulsing ring around
 * it. It follows its target as the page scrolls or resizes.
 */
export default function HintBubble({ hint, lang, locate, onClose }: Props) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    let frame = 0
    let first = true
    const update = () => {
      const r = locate(first)
      first = false
      setRect((prev) =>
        prev && r && prev.x === r.x && prev.y === r.y && prev.width === r.width && prev.height === r.height ? prev : r,
      )
      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [locate])

  if (!rect) return null
  const pad = 6
  const { side, left, top } = placeBubble(rect, hint.exampleKey ? 220 : hint.rung ? 150 : BUBBLE_H)
  const right = side === 'right'
  const bubbleStyle = { left, top }

  return (
    <>
      <div
        aria-hidden="true"
        className="hint-ring pointer-events-none fixed z-overlay rounded-lg border-2 border-amber"
        style={{ left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
      />
      <div role="status" className="card-in fixed z-overlay w-64 rounded-lg border-2 border-ink bg-amber p-3 shadow-pixel" style={bubbleStyle}>
        <span
          aria-hidden="true"
          className={`absolute h-3 w-3 rotate-45 border-ink bg-amber ${
            right ? '-left-[8px] top-6 border-b-2 border-l-2' : side === 'left' ? '-right-[8px] top-6 border-r-2 border-t-2' : side === 'below' ? '-top-[8px] left-6 border-l-2 border-t-2' : '-bottom-[8px] left-6 border-b-2 border-r-2'
          }`}
        />
        <div className="flex items-start justify-between gap-2">
          <span className="type-pixel-sm">💡 {t(lang, 'hintTitle')}</span>
          <button onClick={onClose} aria-label={t(lang, 'hintClose')} className="-mt-1 px-1 type-subheading hover:text-maroon">
            ×
          </button>
        </div>
        <p className="mt-1 type-body font-bold">{t(lang, hint.textKey ?? (`hint_${hint.key}` as Key))}</p>
        {hint.exampleKey && <p className="mt-2 rounded border border-ink/20 bg-white px-2 py-1.5 type-caption">{t(lang, hint.exampleKey)}</p>}
        {hint.rung && (
          <p className="mt-2 flex items-center gap-1 type-micro" aria-label={t(lang, 'hintRung', { n: hint.rung })}>
            {[1, 2, 3].map((r) => (
              <span key={r} aria-hidden="true" className={`h-2 w-2 rounded-full border border-ink ${r <= hint.rung! ? 'bg-ink' : 'bg-white'}`} />
            ))}
            <span className="ml-1" aria-hidden="true">
              {t(lang, 'hintRung', { n: hint.rung })}
            </span>
          </p>
        )}
      </div>
    </>
  )
}

const BUBBLE_W = 256
const BUBBLE_H = 110

/**
 * Picks a spot for the bubble: right of the target, else left, below or above.
 * A spot is skipped if it would cover the main controls (anything marked
 * data-hint-avoid) or run off the screen.
 */
function placeBubble(target: DOMRect, height: number): { side: 'right' | 'left' | 'below' | 'above'; left: number; top: number } {
  const avoid = [...document.querySelectorAll('[data-hint-avoid]')].map((el) => el.getBoundingClientRect())
  const overlaps = (l: number, t: number) =>
    avoid.some((r) => l < r.right && l + BUBBLE_W > r.left && t < r.bottom && t + height > r.top)
  const fits = (l: number, t: number) => l >= 8 && t >= 8 && l + BUBBLE_W <= window.innerWidth - 8 && t + height <= window.innerHeight - 8
  const options = [
    { side: 'right' as const, left: target.right + 18, top: target.top + target.height / 2 - 24 },
    // Big targets like the mission panel often only have room on their left.
    { side: 'left' as const, left: target.left - BUBBLE_W - 18, top: target.top + 12 },
    { side: 'below' as const, left: Math.max(8, Math.min(target.left, window.innerWidth - BUBBLE_W - 8)), top: target.bottom + 16 },
    { side: 'above' as const, left: Math.max(8, Math.min(target.left, window.innerWidth - BUBBLE_W - 8)), top: target.top - height - 16 },
  ]
  return options.find((o) => fits(o.left, o.top) && !overlaps(o.left, o.top)) ?? options.find((o) => fits(o.left, o.top)) ?? options[1]
}
