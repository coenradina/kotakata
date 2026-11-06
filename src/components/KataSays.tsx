import { useEffect, useState, type ReactNode } from 'react'
import PixelSprite from './PixelSprite'

const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
/** Characters per second while Kata talks. */
const CPS = 48

/**
 * Shows a line a few characters at a time, the way Kata talks. `finish`
 * shows the rest at once. Counts by code point, so an emoji never shows half drawn.
 */
export function useTypewriter(text: string) {
  const chars = [...text]
  const [n, setN] = useState(REDUCED ? chars.length : 0)
  useEffect(() => {
    if (REDUCED) {
      setN([...text].length)
      return
    }
    setN(0)
    const total = [...text].length
    const id = window.setInterval(() => {
      setN((v) => {
        if (v + 1 >= total) window.clearInterval(id)
        return Math.min(total, v + 1)
      })
    }, 1000 / CPS)
    return () => window.clearInterval(id)
  }, [text])
  return { shown: chars.slice(0, n).join(''), done: n >= chars.length, finish: () => setN(chars.length) }
}

interface Props {
  /** Kata's mouth moves while this is true. */
  talking?: boolean
  /** Canvas pixels per sprite pixel. */
  scale?: number
  children: ReactNode
  className?: string
}

/** Kata on the left with a speech bubble pointing at it. */
export default function KataSays({ talking = false, scale = 4, children, className = '' }: Props) {
  const [mouth, setMouth] = useState(false)
  useEffect(() => {
    if (!talking || REDUCED) {
      setMouth(false)
      return
    }
    const id = window.setInterval(() => setMouth((m) => !m), 140)
    return () => window.clearInterval(id)
  }, [talking])

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <div className="kata-bob shrink-0 pt-1">
        <PixelSprite sprite={mouth ? 'robotTalk' : 'robot0'} scale={scale} label="Kata" />
      </div>
      <div className="speech-tail min-w-0 flex-1 rounded-lg border-2 border-ink bg-white p-3 shadow-pixel-sm">{children}</div>
    </div>
  )
}
