import { useEffect, useImperativeHandle, useRef, type ReactNode, type Ref } from 'react'
import * as Phaser from 'phaser'
import { HEIGHT, TrainScene, WIDTH, type LogFn, type Milestones } from '../game/TrainScene'
import type { Lang } from '../i18n'
import type { Event } from '../levels/train/model'

export interface StageHandle {
  play: (events: Event[], log: LogFn, milestones?: Milestones) => Promise<void>
  reset: () => void
  celebrate: () => void
}

export default function Stage({ lang, ref, children }: { lang: Lang; ref: Ref<StageHandle>; children?: ReactNode }) {
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<TrainScene | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      play: (events, log, milestones) => scene.current?.play(events, log, milestones) ?? Promise.resolve(),
      reset: () => scene.current?.reset(),
      celebrate: () => scene.current?.celebrate(),
    }),
    [],
  )

  useEffect(() => {
    if (!host.current) return
    let game: Phaser.Game | null = null
    let cancelled = false
    // Phaser draws text on canvas, so the pixel font must be loaded first.
    document.fonts.load('24px VT323').catch(() => undefined).finally(() => {
      if (cancelled || !host.current) return
      const s = new TrainScene()
      scene.current = s
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: host.current,
        width: WIDTH,
        height: HEIGHT,
        pixelArt: true,
        backgroundColor: '#FDF6E3',
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        banner: false,
        audio: { noAudio: true },
        scene: s,
      })
      game.canvas?.classList.add('pixel')
      s.setLang(lang)
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

  return (
    <div className="relative">
      <div ref={host} className="aspect-[8/5] w-full overflow-hidden" />
      {children}
    </div>
  )
}
