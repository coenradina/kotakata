import * as Phaser from 'phaser'
import { registerPixelTextures } from './pixels'
import { NO_MILESTONES, STAGE_HEIGHT, STAGE_WIDTH, type LogFn, type Milestones, type PopupSide, type SessionScene } from './types'
import { t, type CardId, type Key, type Lang } from '../i18n'
import { PHOTOS, SIZE, type PhotoId, type PhotoResult, type VisionResult } from '../levels/vision/model'
import { FONTS, css, hex } from '../theme'

const W = STAGE_WIDTH
const H = STAGE_HEIGHT
const INK = hex('ink')
const FONT = { fontFamily: FONTS.pixel, color: css('ink') }
const CELL = 28
const GRID = { x: 14, y: 36 }
const THUMB = { x: 370, y: 46, cell: 5, gapX: 66, gapY: 100 }

export const PHOTO_KEY: Record<PhotoId, Key> = {
  dinda: 'photoDinda',
  raka: 'photoRaka',
  sari: 'photoSari',
  bimo: 'photoBimo',
  ayu: 'photoAyu',
  dindaDark: 'photoDindaDark',
  bimoDark: 'photoBimoDark',
  poster: 'photoPoster',
}

/** The run result, plus the edge threshold for the notebook line. */
export type VisionEvent = VisionResult & { over?: number }

type Rect = { x: number; y: number; w: number; h: number }
const cellOf = (k: number) => ({ r: Math.floor(k / SIZE), c: k % SIZE })

/** Brightness 0 to 9 as a grey between ink and white. */
function grey(v: number) {
  const a = Phaser.Display.Color.IntegerToColor(INK)
  const b = Phaser.Display.Color.IntegerToColor(hex('white'))
  const m = Phaser.Display.Color.Interpolate.ColorWithColor(a, b, 9, Math.max(0, Math.min(9, v)))
  return Phaser.Display.Color.GetColor(m.r, m.g, m.b)
}

/**
 * Session 2: the photo as a grid of brightness numbers on the left, with
 * each detector's marks drawn over it in turn. On the right, every photo
 * of the puzzle as a thumbnail with a ✓ or ✗.
 */
export class VisionScene extends Phaser.Scene implements SessionScene {
  private lang: Lang = 'id'
  private grid!: Phaser.GameObjects.Container
  private marks!: Phaser.GameObjects.Container
  private thumbs!: Phaser.GameObjects.Container
  private title!: Phaser.GameObjects.Text
  private legend!: Phaser.GameObjects.Text
  private thumbsTitle!: Phaser.GameObjects.Text
  private sensor!: Phaser.GameObjects.Text
  private robot!: Phaser.GameObjects.Image
  private idle?: Phaser.GameObjects.Text
  private focusBox?: Phaser.GameObjects.Graphics
  private currentBox?: Phaser.GameObjects.Graphics
  private milestones: Milestones = NO_MILESTONES
  private runId = 0
  private speed = 1
  readyPromise: Promise<void>
  private resolveReady!: () => void

  constructor() {
    super('vision')
    this.readyPromise = new Promise((r) => (this.resolveReady = r))
  }

  create() {
    registerPixelTextures(this)
    this.cameras.main.setBackgroundColor(css('cream'))
    const g = this.add.graphics()
    const size = CELL * SIZE
    g.fillStyle(INK).fillRect(GRID.x + 4, GRID.y + 4, size, size)
    g.fillStyle(hex('white')).fillRect(GRID.x, GRID.y, size, size)
    g.lineStyle(2, INK).strokeRect(GRID.x, GRID.y, size, size)
    this.title = this.add.text(GRID.x, 8, '', { ...FONT, fontSize: '18px' })
    this.legend = this.add.text(GRID.x + size, 10, '', { ...FONT, fontSize: '14px', color: css('ink-muted') }).setOrigin(1, 0)
    this.grid = this.add.container(0, 0)
    this.marks = this.add.container(0, 0).setDepth(5)
    this.thumbsTitle = this.add.text(THUMB.x, 12, '', { ...FONT, fontSize: '18px' })
    this.thumbs = this.add.container(0, 0)
    this.sensor = this.add.text(GRID.x + size / 2, GRID.y + size + 6, '', { ...FONT, fontSize: '14px', color: css('white'), backgroundColor: css('tosca-dark'), padding: { x: 6, y: 2 } }).setOrigin(0.5, 0)
    this.robot = this.add.image(W - 60, H - 46, 'robot0').setScale(3)
    this.tweens.add({ targets: this.robot, y: this.robot.y - 3, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
    this.idle = this.add
      .text(GRID.x + size / 2, GRID.y + size / 2, '', { ...FONT, fontSize: '18px', color: css('ink-muted'), align: 'center', wordWrap: { width: size - 40 } })
      .setOrigin(0.5)
    this.setLang(this.lang)
    this.resolveReady()
  }

  setLang(lang: Lang) {
    this.lang = lang
    this.legend?.setText(t(lang, 'vSceneNumbers'))
    this.thumbsTitle?.setText(t(lang, 'vScenePhotos'))
    this.idle?.setText(t(lang, 'vSceneIdle'))
  }

  private at(r: number, c: number) {
    return { x: GRID.x + c * CELL, y: GRID.y + r * CELL }
  }

  /** The photo as numbers: each cell is shaded by its brightness. */
  private drawGrid(seen: number[][]) {
    this.grid.removeAll(true)
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        const v = seen[r][c]
        const { x, y } = this.at(r, c)
        this.grid.add(this.add.rectangle(x, y, CELL, CELL, grey(v)).setOrigin(0, 0))
        this.grid.add(this.add.text(x + CELL / 2, y + CELL / 2, String(v), { ...FONT, fontSize: '18px', color: css(v < 5 ? 'white' : 'ink') }).setOrigin(0.5))
      }
  }

  private drawThumbs(ids: PhotoId[]) {
    this.thumbs.removeAll(true)
    ids.forEach((id, i) => {
      const { x, y } = this.thumbPos(i)
      const b = PHOTOS[id].brightness
      const g = this.add.graphics()
      for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) g.fillStyle(grey(b[r][c])).fillRect(x + c * THUMB.cell, y + r * THUMB.cell, THUMB.cell, THUMB.cell)
      g.lineStyle(2, INK).strokeRect(x, y, SIZE * THUMB.cell, SIZE * THUMB.cell)
      const name = this.add.text(x + (SIZE * THUMB.cell) / 2, y + SIZE * THUMB.cell + 4, t(this.lang, PHOTO_KEY[id]), { ...FONT, fontSize: '14px', align: 'center', wordWrap: { width: THUMB.gapX } }).setOrigin(0.5, 0)
      this.thumbs.add([g, name])
    })
  }

  private thumbPos(i: number) {
    return { x: THUMB.x + (i % 4) * THUMB.gapX, y: THUMB.y + Math.floor(i / 4) * THUMB.gapY }
  }

  private markThumb(i: number, right: boolean, current: boolean) {
    const { x, y } = this.thumbPos(i)
    const s = SIZE * THUMB.cell
    this.currentBox?.destroy()
    this.currentBox = undefined
    if (current) {
      this.currentBox = this.add.graphics()
      this.currentBox.lineStyle(3, hex('amber')).strokeRect(x - 3, y - 3, s + 6, s + 6)
      return
    }
    const tag = this.add.text(x + s - 2, y + 2, right ? '✓' : '✗', { ...FONT, fontSize: '18px', color: css('white'), backgroundColor: css(right ? 'tosca-dark' : 'maroon'), padding: { x: 3, y: 0 } }).setOrigin(1, 0)
    this.thumbs.add(tag)
  }

  private wait(ms: number) {
    return new Promise<void>((resolve) => this.time.delayedCall(ms / this.speed, resolve))
  }

  private highlight(rect: Rect | null) {
    this.focusBox?.destroy()
    this.focusBox = undefined
    if (!rect) return
    const g = this.add.graphics().setDepth(20)
    g.lineStyle(4, hex('amber')).strokeRect(rect.x, rect.y, rect.w, rect.h)
    this.tweens.add({ targets: g, alpha: 0.25, duration: 450, yoyo: true, repeat: -1 })
    this.focusBox = g
  }

  private async milestone(id: CardId, side: PopupSide, rect: Rect, run: number, vars?: Record<string, string | number>) {
    if (run !== this.runId || !this.milestones.isNew(id)) return
    this.highlight(rect)
    await this.milestones.show(id, side, vars)
    if (run === this.runId) this.highlight(null)
  }

  reset() {
    this.runId++
    this.highlight(null)
    this.idle?.setVisible(false)
    if (!this.grid) return
    this.grid.removeAll(true)
    this.marks.removeAll(true)
    this.thumbs.removeAll(true)
    this.currentBox?.destroy()
    this.currentBox = undefined
    this.title.setText('')
    this.sensor.setText('').setVisible(false)
  }

  /** One photo: numbers first, then each detector's marks, then the sunglasses or the hat. */
  private async showPhoto(p: PhotoResult, res: VisionEvent, run: number, first: boolean) {
    const L = this.lang
    this.marks.removeAll(true)
    this.title.setText(t(L, PHOTO_KEY[p.photo]))
    this.drawGrid(p.seen)
    this.sensor.setVisible(false)
    const full: Rect = { x: GRID.x - 4, y: GRID.y - 4, w: CELL * SIZE + 8, h: CELL * SIZE + 8 }
    if (first) {
      const eyes = PHOTOS[p.photo].eyes
      await this.milestone('pixel', 'left', full, run, { eye: eyes ? p.seen[eyes[0][0]][eyes[0][1]] : p.seen[5][4], wall: p.seen[0][SIZE - 1] })
    }
    await this.wait(250)
    // Region: the face the outline or the depth sensor found.
    if (p.region && run === this.runId) {
      const fill = p.regionFrom === 'depth' ? hex('maroon-tint') : hex('tosca-tint')
      for (const k of p.region) {
        const { r, c } = cellOf(k)
        const { x, y } = this.at(r, c)
        this.marks.add(this.add.rectangle(x, y, CELL, CELL, fill, 0.55).setOrigin(0, 0))
      }
      if (p.regionFrom === 'depth') this.sensor.setText(`📡 ${t(L, 'vSceneDepth')}`).setVisible(true)
    }
    // Edges: where the numbers jump.
    if (p.edges && run === this.runId) {
      const g = this.add.graphics()
      g.lineStyle(2, hex('tosca'))
      for (const k of p.edges) {
        const { r, c } = cellOf(k)
        const { x, y } = this.at(r, c)
        g.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4)
      }
      this.marks.add(g)
      await this.wait(400)
      if (first && res.uses.has('edges')) await this.milestone('edgeDetection', 'left', full, run, { over: res.over ?? 1 })
    }
    // Dark cells: kept ones solid, filtered-out ones faint.
    if (p.dark && run === this.runId) {
      for (const k of p.dark) {
        const { r, c } = cellOf(k)
        const { x, y } = this.at(r, c)
        const dot = this.add.rectangle(x + CELL / 2, y + CELL / 2, 10, 10, hex('amber')).setStrokeStyle(1, INK)
        if (!p.kept.has(k)) dot.setAlpha(0.3)
        this.marks.add(dot)
      }
      await this.wait(400)
    }
    if (run !== this.runId) return
    if (p.glasses) {
      const g = this.add.graphics()
      g.fillStyle(INK)
      for (const [r, c] of p.glasses) {
        const { x, y } = this.at(r, c)
        g.fillRect(x - 3, y + 3, CELL + 6, CELL - 6)
      }
      const xs = p.glasses.map(([, c]) => c)
      const row = p.glasses[0][0]
      const a = this.at(row, Math.min(...xs))
      const b = this.at(row, Math.max(...xs))
      g.fillRect(a.x + CELL, a.y + CELL / 2 - 2, b.x - a.x - CELL, 4)
      this.marks.add(g)
    }
    if (p.hat !== null) {
      const top = Math.max(0, p.hat - 1)
      const a = this.at(top, 3)
      const hat = this.add.rectangle(a.x, a.y + 4, CELL * 6, CELL - 6, hex('maroon')).setOrigin(0, 0).setStrokeStyle(2, INK)
      const brim = this.add.rectangle(a.x - CELL / 2, a.y + CELL - 4, CELL * 7, 6, hex('maroon-dark')).setOrigin(0, 0)
      this.marks.add([hat, brim])
    }
    await this.wait(p.right ? 450 : 650)
  }

  async play(rawEvents: unknown[], log: LogFn, milestones: Milestones = NO_MILESTONES): Promise<void> {
    await this.readyPromise
    const res = rawEvents[0] as VisionEvent
    this.reset()
    const run = this.runId
    this.milestones = milestones
    const L = this.lang
    const ids = res.photos.map((p) => p.photo)
    this.drawThumbs(ids)
    if (res.missing.includes('action')) log(t(L, 'vFailNoAction'), 'bad')
    if (res.uses.has('exposure')) log(t(L, 'vLogExposure'))
    for (const [i, p] of res.photos.entries()) {
      if (run !== this.runId) return
      this.speed = i === 0 ? 1 : 2.2
      this.markThumb(i, p.right, true)
      await this.showPhoto(p, res, run, i === 0)
      if (run !== this.runId) return
      this.markThumb(i, p.right, false)
      const verdict: Key =
        p.why === 'needsRegion'
          ? 'vNeedsRegion'
          : PHOTOS[p.photo].kind === 'poster'
            ? p.right
              ? 'vPosterOk'
              : 'vFooled'
            : p.right
              ? res.uses.has('hat')
                ? 'vOkHat'
                : 'vOk'
              : p.why === 'noGlasses'
                ? 'vNoGlasses'
                : p.why === 'noFace'
                  ? 'vNoFace'
                  : 'vWrong'
      log(t(L, 'vLogPhoto', { name: t(L, PHOTO_KEY[p.photo]), verdict: t(L, verdict) }), p.right ? 'good' : 'bad')
      if (!p.right) this.cameras.main.shake(120, 0.002)
      if (PHOTOS[p.photo].kind === 'poster' && p.right && res.uses.has('depth')) {
        await this.milestone('sensorFusion', 'left', { x: GRID.x - 4, y: GRID.y - 4, w: CELL * SIZE + 8, h: CELL * SIZE + 8 }, run)
      }
    }
    if (run !== this.runId) return
    this.speed = 1
    // A failed run's total comes from the puzzle's fail line.
    if (res.right === res.total) log(t(L, 'vLogTotal', { n: res.right, total: res.total }), 'good')
    if (res.right === res.total && res.total >= 5 && res.uses.has('pair')) {
      const detectors = (['dark', 'edges', 'inside', 'pair', 'exposure', 'depth'] as const).filter((k) => res.uses.has(k)).length
      await this.milestone('objectDetection', 'right', { x: THUMB.x - 8, y: THUMB.y - 8, w: 4 * THUMB.gapX + 8, h: 2 * THUMB.gapY + 4 }, run, { n: res.right, k: detectors })
    }
  }

  private sparkleAt(x: number, y: number, tint: number) {
    const p = this.add.particles(x, y, 'spark', { speed: { min: 50, max: 150 }, lifespan: 500, scale: { start: 3, end: 0 }, tint, emitting: false })
    p.setDepth(11)
    p.explode(12)
    this.time.delayedCall(650, () => p.destroy())
  }

  celebrate() {
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 140, () =>
        this.sparkleAt(Phaser.Math.Between(40, 620), Phaser.Math.Between(40, 300), Phaser.Math.RND.pick([hex('tosca'), hex('amber'), hex('maroon')])),
      )
    }
    this.tweens.add({ targets: this.robot, angle: { from: -10, to: 10 }, duration: 140, yoyo: true, repeat: 5 })
  }
}
