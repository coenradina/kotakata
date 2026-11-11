import { useEffect, useImperativeHandle, useRef, type ReactNode, type Ref } from 'react'
import * as Phaser from 'phaser'
import { STAGE_HEIGHT as HEIGHT, STAGE_WIDTH as WIDTH, type SessionScene, type LogFn, type Milestones } from '../game/types'
import type { Lang } from '../i18n'
import type { Session } from '../levels'
import { css } from '../theme'

/** Any character in the icon font's range makes the browser fetch it. */
const ICON_SAMPLE = '🎯'

export interface StageHandle {
  play: (events: unknown[], log: LogFn, milestones?: Milestones) => Promise<void>
  reset: () => void
  celebrate: () => void
  preview: (data: unknown) => void
}

/** Scales every timer and tween in the scene, so the player's speed applies to all scenes alike. */
function applySpeed(scene: SessionScene | null, speed: number) {
  if (!scene?.time || !scene.tweens) return
  scene.time.timeScale = speed
  scene.tweens.timeScale = speed
}

/**
 * One Phaser game per level: give this component a `key` of the level id.
 * `fill` makes it fill a box the layout has already sized (16:10); otherwise
 * it sizes itself from its width.
 */
export default function Stage({ lang, level, speed = 1, fill = false, ref, children }: { lang: Lang; level: Session; speed?: number; fill?: boolean; ref: Ref<StageHandle>; children?: ReactNode }) {
  const speedRef = useRef(speed)
  speedRef.current = speed
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<SessionScene | null>(null)
  const pendingPreview = useRef<{ data: unknown } | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      play: (events, log, milestones) => scene.current?.play(events, log, milestones) ?? Promise.resolve(),
      reset: () => scene.current?.reset(),
      celebrate: () => scene.current?.celebrate(),
      preview: (data) => {
        if (scene.current?.preview) scene.current.preview(data)
        else pendingPreview.current = { data }
      },
    }),
    [],
  )

  useEffect(() => {
    if (!host.current) return
    let game: Phaser.Game | null = null
    let cancelled = false
    // Phaser draws text on canvas, so the pixel font and the icon font must be loaded first.
    Promise.all([document.fonts.load('24px VT323'), document.fonts.load("24px 'KK Icons'", ICON_SAMPLE)]).catch(() => undefined).finally(() => {
      if (cancelled || !host.current) return
      const s = level.createScene()
      scene.current = s
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: host.current,
        width: WIDTH,
        height: HEIGHT,
        pixelArt: true,
        backgroundColor: css('cream'),
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        banner: false,
        audio: { noAudio: true },
        scene: s,
      })
      game.canvas?.classList.add('pixel')
      // Phaser refits on window resizes only; the layout can resize the stage's box without one.
      const g = game
      const fit = new ResizeObserver(() => g.scale?.refresh())
      fit.observe(host.current)
      g.events.once('destroy', () => fit.disconnect())
      s.setLang(lang)
      // The scene's clock exists once Phaser has booted it.
      void s.readyPromise?.then(() => applySpeed(s, speedRef.current))
      if (pendingPreview.current) s.preview?.(pendingPreview.current.data)
    })
    return () => {
      cancelled = true
      game?.destroy(true)
      scene.current = null
    }
    // The game is created once; language changes go through setLang below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scene.current?.setLang(lang)
  }, [lang])

  useEffect(() => applySpeed(scene.current, speed), [speed])

  return (
    <div className={`relative ${fill ? 'h-full' : ''}`}>
      <div ref={host} className={`${fill ? 'h-full' : 'aspect-[8/5]'} w-full overflow-hidden rounded`} />
      {children}
    </div>
  )
}
