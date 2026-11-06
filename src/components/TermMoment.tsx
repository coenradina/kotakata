import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import PixelSprite from './PixelSprite'
import { useTypewriter } from './KataSays'
import { fillMoment, t, type Lang, type TermCard } from '../i18n'
import type { MomentVars } from '../store'
import type { PopupSide } from '../game/types'

export interface NotebookEntry {
  card: TermCard
  vars: MomentVars
  /** The half of the stage the card goes on, away from the part the scene highlights. */
  side: PopupSide
}

interface Props {
  entry: NotebookEntry
  lang: Lang
  /** Called once the card has flown into the notebook counter. */
  onClose: () => void
  /** When the stage is small, cover this element instead of the room under the stage (phones on their side). */
  besideSelector?: string
}

/** Below this stage width the card doesn't fit beside the highlighted part, so it goes under the stage. */
const INSIDE_MIN = 520
const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const FLY_MS = 450

/** Sends a copy of the term's icon from the card to the notebook counter in the header. */
function flyToNotebook(from: Element | null, icon: string, onLanded: () => void) {
  const target = [...document.querySelectorAll('[data-notebook-count]')].find((el) => el.getBoundingClientRect().width > 0)
  if (!from || !target || REDUCED) {
    onLanded()
    return
  }
  const a = from.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const flyer = document.createElement('span')
  flyer.textContent = icon
  flyer.setAttribute('aria-hidden', 'true')
  flyer.className = 'pointer-events-none fixed z-takeover text-icon-lg'
  flyer.style.left = `${a.left}px`
  flyer.style.top = `${a.top}px`
  document.body.appendChild(flyer)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  const anim = flyer.animate(
    [
      { transform: 'translate(0, 0) scale(1.4)' },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) scale(1.1)`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0.6 },
    ],
    { duration: FLY_MS, easing: 'ease-in' },
  )
  anim.onfinish = () => {
    flyer.remove()
    target.classList.remove('count-bump')
    void (target as HTMLElement).offsetWidth
    target.classList.add('count-bump')
    onLanded()
  }
}

/**
 * A word Kata learns for the first time. The run stops until the player
 * taps Continue. The card sits over the half of the stage the scene picks,
 * away from the part it highlights, or under the stage when the stage is small.
 * Put it inside the Stage, which is its positioning parent.
 */
export default function TermMoment({ entry, lang, onClose, besideSelector }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)
  const go = useRef<HTMLButtonElement>(null)
  const [inside, setInside] = useState(true)
  // Under the stage, the card stops above the bottom bar (anything marked data-term-floor) so its button stays in view.
  const [maxH, setMaxH] = useState<number | undefined>(undefined)
  const [beside, setBeside] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [leaving, setLeaving] = useState(false)
  const body = fillMoment(entry.card, lang, entry.vars)
  const { shown, done, finish } = useTypewriter(body)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useLayoutEffect(() => {
    const parent = box.current?.parentElement
    if (!parent) return
    // Bring the stage into view first, so the room under it is measured where it will be.
    parent.scrollIntoView({ block: 'nearest' })
    const measure = () => {
      const fits = parent.clientWidth >= INSIDE_MIN
      setInside(fits)
      setBeside(null)
      if (fits) return setMaxH(undefined)
      const other = besideSelector ? document.querySelector(besideSelector)?.getBoundingClientRect() : undefined
      if (other && other.width > 0) {
        setBeside({ left: other.left + 8, top: other.top + 8, width: other.width - 16, height: other.height - 16 })
        return
      }      const floor = [...document.querySelectorAll('[data-term-floor]')].map((el) => el.getBoundingClientRect().top).find((y) => y > 0) ?? window.innerHeight
      setMaxH(Math.max(160, floor - parent.getBoundingClientRect().bottom - 16))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [besideSelector])

  const leave = () => {
    if (leaving) return
    setLeaving(true)
    flyToNotebook(iconRef.current, entry.card.icon, () => closeRef.current())
  }
  const press = () => (done ? leave() : finish())

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && leave()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    go.current?.focus({ preventScroll: true })
  }, [])

  const where = beside ? 'fixed' : inside ? `top-2 max-h-[calc(100%-1rem)] w-[46%] ${entry.side === 'left' ? 'left-2' : 'right-2'}` : 'inset-x-0 top-full mt-2'

  return (
    <div
      ref={box}
      role="dialog"
      aria-labelledby="term-moment-title"
      aria-describedby="term-moment-body"
      className={`absolute z-overlay flex ${where} ${leaving ? 'opacity-0 transition-opacity duration-300' : 'card-in'}`}
      style={beside ?? (maxH ? { maxHeight: maxH } : undefined)}
    >
      <div className="flex max-h-full w-full flex-col rounded-lg border-2 border-ink bg-white p-3 shadow-pixel-lg">
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Kata, the label and the word on one row, so the explanation gets the room on small screens. */}
          <div className="flex items-center gap-3">
            <PixelSprite sprite={done ? 'robot0' : 'robotTalk'} scale={2} className="shrink-0" label="Kata" />
            <span ref={iconRef} className="badge-pop text-icon-lg shrink-0" aria-hidden="true">
              {entry.card.icon}
            </span>
            <div className="min-w-0">
              <p className="type-eyebrow text-maroon">📓 {t(lang, 'termNew')}</p>
              <p id="term-moment-title" className="type-pixel text-tosca-dark">
                {entry.card.term}
              </p>
            </div>
          </div>
          <p id="term-moment-body" className="mt-2 type-body" onClick={finish}>
            {shown}
            <span className="invisible">{body.slice(shown.length)}</span>
          </p>
        </div>
        {/* Outside the scrolling part, so Continue is always on screen. */}
        <div className="flex shrink-0 items-center justify-between gap-2 pt-2">
          <span className="min-w-0 type-micro text-ink-muted">{t(lang, 'termSaved')}</span>
          <button ref={go} onClick={press} className="pixel-btn min-h-10 shrink-0 rounded border-2 border-ink bg-maroon px-4 py-1.5 type-button-lg text-white hover:bg-maroon-dark">
            {t(lang, 'termGo')}
          </button>
        </div>
      </div>
    </div>
  )
}
