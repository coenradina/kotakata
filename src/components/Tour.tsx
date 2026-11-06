import { useEffect, useRef, useState } from 'react'
import { t, type Key, type Lang } from '../i18n'

export interface TourStep {
  /** CSS selectors; the spotlight covers all of them together. */
  anchors: string[]
  titleKey: Key
  bodyKey: Key
}

interface Props {
  steps: TourStep[]
  lang: Lang
  onDone: () => void
}

const PAD = 8
const BUBBLE_W = 320
const BUBBLE_H = 190

/** The box around every element that matches any of the selectors. */
function unionRect(selectors: string[]): DOMRect | null {
  const rects = selectors.flatMap((s) => [...document.querySelectorAll(s)].map((el) => el.getBoundingClientRect())).filter((r) => r.width > 0 && r.height > 0)
  if (!rects.length) return null
  const left = Math.min(...rects.map((r) => r.left))
  const top = Math.min(...rects.map((r) => r.top))
  const right = Math.max(...rects.map((r) => r.right))
  const bottom = Math.max(...rects.map((r) => r.bottom))
  return new DOMRect(left, top, right - left, bottom - top)
}

/** Below the spotlight if it fits, else above, else beside it, else at the bottom of the screen. */
function place(r: DOMRect) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const x = Math.max(12, Math.min(r.left, vw - BUBBLE_W - 12))
  if (r.bottom + PAD + 12 + BUBBLE_H < vh) return { left: x, top: r.bottom + PAD + 12 }
  if (r.top - PAD - 12 - BUBBLE_H > 0) return { left: x, top: r.top - PAD - 12 - BUBBLE_H }
  if (r.right + PAD + 12 + BUBBLE_W < vw) return { left: r.right + PAD + 12, top: Math.max(12, Math.min(r.top, vh - BUBBLE_H - 12)) }
  if (r.left - PAD - 12 - BUBBLE_W > 0) return { left: r.left - PAD - 12 - BUBBLE_W, top: Math.max(12, Math.min(r.top, vh - BUBBLE_H - 12)) }
  return { left: Math.max(12, (vw - BUBBLE_W) / 2), top: vh - BUBBLE_H - 12 }
}

/**
 * A short guided tour: one part of the screen at a time is lit, the rest
 * dimmed, with a card that says what it's for. Esc skips, Enter goes on.
 */
export default function Tour({ steps, lang, onDone }: Props) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const next = useRef<HTMLButtonElement>(null)
  const step = steps[i]
  const last = i === steps.length - 1

  useEffect(() => {
    let frame = 0
    // Bring the part into view once, then follow it as the page moves.
    const first = document.querySelector(step.anchors[0])
    first?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    const update = () => {
      const r = unionRect(step.anchors)
      setRect((prev) => (prev && r && prev.x === r.x && prev.y === r.y && prev.width === r.width && prev.height === r.height ? prev : r))
      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    next.current?.focus({ preventScroll: true })
    return () => cancelAnimationFrame(frame)
  }, [step])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone()
      else if (e.key === 'ArrowRight') setI((n) => Math.min(steps.length - 1, n + 1))
      else if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDone, steps.length])

  const pos = rect ? place(rect) : { left: Math.max(12, (window.innerWidth - BUBBLE_W) / 2), top: window.innerHeight / 3 }

  return (
    <div className="fixed inset-0 z-takeover" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {/* The spotlight: a clear box whose huge shadow dims everything else. Clicks on the dim area do nothing. */}
      {rect ? (
        <div
          aria-hidden="true"
          className="tour-spot pointer-events-none fixed rounded-lg border-2 border-amber transition-all duration-300"
          style={{ left: rect.left - PAD, top: rect.top - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-ink/60" />
      )}
      <div className="card-in fixed w-80 rounded-lg border-2 border-ink bg-white p-4 shadow-pixel-lg" style={pos}>
        <p className="type-micro text-ink-muted">{t(lang, 'tourOf', { n: i + 1, total: steps.length })}</p>
        <h2 id="tour-title" className="mt-1 type-heading">
          {t(lang, step.titleKey)}
        </h2>
        <p className="mt-2 type-body">{t(lang, step.bodyKey)}</p>
        <div className="mt-4 flex items-center gap-2">
          <button onClick={onDone} className="type-label underline hover:text-maroon">
            {t(lang, 'tourSkip')}
          </button>
          <div className="ml-auto flex gap-2">
            {i > 0 && (
              <button onClick={() => setI(i - 1)} className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment">
                {t(lang, 'tourBack')}
              </button>
            )}
            <button
              ref={next}
              onClick={() => (last ? onDone() : setI(i + 1))}
              className="pixel-btn rounded border-2 border-ink bg-maroon px-3 py-1.5 type-button text-white hover:bg-maroon-dark"
            >
              {t(lang, last ? 'tourDone' : 'tourNext')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
