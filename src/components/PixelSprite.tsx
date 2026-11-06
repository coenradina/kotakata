import { useEffect, useRef } from 'react'
import { SPRITES, paintSprite } from '../game/pixels'

interface Props {
  sprite: keyof typeof SPRITES
  /** Canvas pixels per sprite pixel. */
  scale?: number
  className?: string
  label?: string
}

/** One of the game's pixel sprites, drawn on a plain canvas (no Phaser). */
export default function PixelSprite({ sprite, scale = 6, className, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const rows = SPRITES[sprite]
  const w = Math.max(...rows.map((r) => r.length))
  const h = rows.length

  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, w * scale, h * scale)
    paintSprite(ctx, rows, 0, 0, scale)
  }, [rows, w, h, scale])

  return (
    <canvas
      ref={ref}
      width={w * scale}
      height={h * scale}
      className={`pixel ${className ?? ''}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
