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
  // Bubble to the right of the target, or below it near the right edge.
  const right = rect.right + 300 < window.innerWidth
  const bubbleStyle = right
    ? { left: rect.right + 18, top: rect.top + rect.height / 2, transform: 'translateY(-50%)' }
    : { left: Math.max(8, rect.left), top: rect.bottom + 16 }

  return (
    <>
      <div
        aria-hidden="true"
        className="hint-ring pointer-events-none fixed z-40 rounded-lg border-4 border-amber"
        style={{ left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
      />
      <div role="status" className="card-in fixed z-40 w-64 rounded-lg border-2 border-ink bg-amber p-3 shadow-[4px_4px_0_#0F172A]" style={bubbleStyle}>
        <span
          aria-hidden="true"
          className={`absolute h-3 w-3 rotate-45 border-ink bg-amber ${right ? '-left-[8px] top-1/2 -mt-1.5 border-b-2 border-l-2' : '-top-[8px] left-6 border-l-2 border-t-2'}`}
        />
        <div className="flex items-start justify-between gap-2">
          <span className="font-pixel text-lg leading-none">💡 {t(lang, 'hintTitle')}</span>
          <button onClick={onClose} aria-label={t(lang, 'hintClose')} className="-mt-1 px-1 text-lg font-bold leading-none hover:text-maroon">
            ×
          </button>
        </div>
        <p className="mt-1 font-sans text-[13px] font-semibold leading-snug">{t(lang, `hint_${hint.key}` as Key)}</p>
      </div>
    </>
  )
}
