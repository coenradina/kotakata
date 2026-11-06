import { useEffect, useRef, type ReactNode } from 'react'
import { t, type Lang } from '../i18n'

interface Props {
  lang: Lang
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * A panel that slides up from the bottom of a phone screen. Close it with
 * the ✕ button, a tap on the dimmed page, Esc, or by dragging the handle down.
 */
export default function BottomSheet({ lang, title, onClose, children }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; dy: number } | null>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    panel.current?.querySelector<HTMLElement>('button, [href], input, [tabindex]')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
      // Keep Tab inside the sheet.
      if (e.key === 'Tab' && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>('button, [href], input:not(:disabled), [tabindex]')]
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      before?.focus?.()
    }
  }, [])

  const onDown = (e: React.PointerEvent) => {
    drag.current = { y: e.clientY, dy: 0 }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !panel.current) return
    drag.current.dy = Math.max(0, e.clientY - drag.current.y)
    panel.current.style.transform = `translateY(${drag.current.dy}px)`
  }
  const onUp = () => {
    if (!drag.current || !panel.current) return
    const far = drag.current.dy > 80
    drag.current = null
    panel.current.style.transform = ''
    if (far) onClose()
  }

  return (
    <div className="fixed inset-0 z-modal flex flex-col justify-end">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-in safe-bottom-lg relative max-h-[85dvh] overflow-y-auto rounded-t-lg border-2 border-b-0 border-ink bg-cream px-4 pt-2 shadow-pixel-lg"
      >
        <div className="flex touch-none justify-center py-2" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <span className="h-1.5 w-12 rounded-full bg-ink/30" aria-hidden="true" />
        </div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="type-eyebrow text-maroon">{title}</h2>
          <button onClick={onClose} aria-label={t(lang, 'sheetClose')} className="-mr-2 px-3 py-1 type-subheading hover:text-maroon">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
