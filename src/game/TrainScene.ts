import * as Phaser from 'phaser'
import { registerPixelTextures } from './pixels'
import { predict, type Centroids, type Event, type Label, type Point } from '../levels/train/model'
import { t, type Lang } from '../i18n'

export const WIDTH = 640
export const HEIGHT = 400
const PX = 3 // every sprite pixel becomes a 3x3 block
const INK = 0x0f172a
const LABEL_COLOUR: Record<Label, number> = { apple: 0xdc2626, banana: 0xeab308 }
const FONT = { fontFamily: 'VT323, monospace', color: '#0F172A' }

// "Robot brain": a 2D plot of the two features the robot looks at.
const PLOT = { x: 412, y: 64, size: 208 }
const BELT_Y = 336
const ROBOT = { x: 150, y: 262 }
const BIN_X: Record<Label, number> = { apple: 322, banana: 384 }
const BIN_Y = 344

export type LogFn = (line: string, tone?: 'info' | 'good' | 'bad') => void

export class TrainScene extends Phaser.Scene {
  private lang: Lang = 'id'
  private robot!: Phaser.GameObjects.Image
  private belt!: Phaser.GameObjects.TileSprite
  private regions!: Phaser.GameObjects.Graphics
  private dots!: Phaser.GameObjects.Container
  private markers: Partial<Record<Label, Phaser.GameObjects.Container>> = {}
  private bubble!: Phaser.GameObjects.Container
  private status!: Phaser.GameObjects.Text
  private axisText: Phaser.GameObjects.Text[] = []
  private speed = 1
  /** Increments on every play/reset, so an outdated run stops itself. */
  private runId = 0
  readyPromise: Promise<void>
  private resolveReady!: () => void

  constructor() {
    super('train')
    this.readyPromise = new Promise((r) => (this.resolveReady = r))
  }

  create() {
    registerPixelTextures(this)
    this.cameras.main.setBackgroundColor('#FDF6E3')
    this.drawBackdrop()

    // Width and height are in texture pixels; setScale makes it 300px wide.
    this.belt = this.add.tileSprite(0, BELT_Y, 100, 6, 'belt').setOrigin(0, 0).setScale(PX)
    for (const l of ['apple', 'banana'] as Label[]) {
      this.add.image(BIN_X[l], BIN_Y, l === 'apple' ? 'binApple' : 'binBanana').setScale(PX).setOrigin(0.5, 0)
      this.add.image(BIN_X[l], BIN_Y + 14, l).setScale(2).setAlpha(0.9)
    }

    this.robot = this.add.image(ROBOT.x, ROBOT.y, 'robot0').setScale(4)
    this.tweens.add({ targets: this.robot, y: ROBOT.y - 3, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
    this.time.addEvent({
      delay: 2600,
      loop: true,
      callback: () => {
        this.robot.setTexture('robot1')
        this.time.delayedCall(140, () => this.robot.setTexture('robot0'))
      },
    })

    this.regions = this.add.graphics()
    this.dots = this.add.container(0, 0)
    this.bubble = this.add.container(ROBOT.x + 40, ROBOT.y - 70).setVisible(false)
    const bubbleBg = this.add.graphics()
    bubbleBg.fillStyle(0xffffff).fillRect(-26, -22, 52, 44).lineStyle(3, INK).strokeRect(-26, -22, 52, 44)
    bubbleBg.fillStyle(0xffffff).fillTriangle(-14, 22, -4, 22, -16, 34).lineStyle(3, INK).lineBetween(-14, 22, -16, 34)
    this.bubble.add(bubbleBg)

    this.status = this.add.text(20, 16, '', { ...FONT, fontSize: '26px' })
    this.drawPlotFrame()
    this.resolveReady()
  }

  setLang(lang: Lang) {
    this.lang = lang
    if (this.axisText.length === 0) return
    const [title, xAxis, yAxis] = this.axisText
    title?.setText(lang === 'id' ? 'OTAK ROBOT' : 'ROBOT BRAIN')
    xAxis?.setText(lang === 'id' ? 'warna: merah → kuning' : 'colour: red → yellow')
    yAxis?.setText(lang === 'id' ? 'bentuk: panjang → bulat' : 'shape: long → round')
  }

  private drawBackdrop() {
    const g = this.add.graphics()
    g.lineStyle(1, INK, 0.05)
    for (let x = 0; x <= WIDTH; x += 24) g.lineBetween(x, 0, x, HEIGHT)
    for (let y = 0; y <= HEIGHT; y += 24) g.lineBetween(0, y, WIDTH, y)
    // Floor
    g.fillStyle(0xeee8d5).fillRect(0, BELT_Y + 18, 410, HEIGHT - BELT_Y)
    g.lineStyle(3, INK).lineBetween(0, BELT_Y + 18, 410, BELT_Y + 18)
  }

  private drawPlotFrame() {
    const g = this.add.graphics()
    g.fillStyle(INK).fillRect(PLOT.x + 6, PLOT.y + 6, PLOT.size, PLOT.size)
    g.fillStyle(0xffffff).fillRect(PLOT.x, PLOT.y, PLOT.size, PLOT.size)
    g.lineStyle(3, INK).strokeRect(PLOT.x, PLOT.y, PLOT.size, PLOT.size)
    g.setDepth(-1)
    this.regions.setDepth(0)
    this.axisText = [
      this.add.text(PLOT.x, PLOT.y - 30, '', { ...FONT, fontSize: '24px' }),
      this.add.text(PLOT.x, PLOT.y + PLOT.size + 8, '', { ...FONT, fontSize: '18px' }),
      this.add.text(PLOT.x - 8, PLOT.y + PLOT.size, '', { ...FONT, fontSize: '18px' }).setAngle(-90).setOrigin(0, 1),
    ]
    this.setLang(this.lang)
  }

  /** Feature space (0..1) to screen. y is flipped so "round" is at the top. */
  private toScreen(p: Point) {
    return { x: PLOT.x + 8 + p.x * (PLOT.size - 16), y: PLOT.y + 8 + (1 - p.y) * (PLOT.size - 16) }
  }

  /** Shades each cell of the plot by the label the robot would guess there. */
  private paintRegions(c: Centroids) {
    this.regions.clear()
    const cells = 13
    const step = PLOT.size / cells
    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        const p = { x: (i + 0.5) / cells, y: 1 - (j + 0.5) / cells }
        const guess = predict(c, p)
        if (!guess) continue
        this.regions.fillStyle(LABEL_COLOUR[guess], 0.14).fillRect(PLOT.x + i * step, PLOT.y + j * step, step, step)
      }
    }
    this.regions.lineStyle(3, INK).strokeRect(PLOT.x, PLOT.y, PLOT.size, PLOT.size)
  }

  private marker(label: Label) {
    let m = this.markers[label]
    if (!m) {
      const ring = this.add.graphics()
      ring.fillStyle(INK).fillCircle(0, 0, 13).fillStyle(LABEL_COLOUR[label]).fillCircle(0, 0, 10)
      const icon = this.add.image(0, 0, label).setScale(1.6)
      m = this.add.container(0, 0, [ring, icon]).setDepth(5)
      this.markers[label] = m
    }
    return m
  }

  reset() {
    this.runId++
    this.tweens.killTweensOf(this.dots.list)
    this.dots.removeAll(true)
    this.regions.clear()
    this.regions.lineStyle(3, INK).strokeRect(PLOT.x, PLOT.y, PLOT.size, PLOT.size)
    for (const m of Object.values(this.markers)) m?.destroy()
    this.markers = {}
    this.bubble.setVisible(false)
    this.status.setText('')
    this.children.list.filter((o) => o.getData?.('fruit')).forEach((o) => o.destroy())
  }

  // --- small async helpers -------------------------------------------------

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig) {
    return new Promise<void>((resolve) => {
      this.tweens.add({ ...config, duration: (Number(config.duration) || 300) / this.speed, onComplete: () => resolve() })
    })
  }

  private wait(ms: number) {
    return new Promise<void>((resolve) => this.time.delayedCall(ms / this.speed, resolve))
  }

  private spawnFruit(label: Label) {
    const fruit = this.add.image(-20, BELT_Y - 14, label).setScale(PX).setData('fruit', true).setDepth(3)
    this.belt.setData('moving', true)
    return fruit
  }

  update(_time: number, delta: number) {
    if (this.belt?.getData('moving')) this.belt.tilePositionX -= (delta / 16) * this.speed
  }

  private sparkle(x: number, y: number, tint: number) {
    const p = this.add.particles(x, y, 'spark', {
      speed: { min: 60, max: 160 },
      lifespan: 500,
      scale: { start: 3, end: 0 },
      quantity: 10,
      tint,
      emitting: false,
    })
    p.explode(12)
    this.time.delayedCall(700, () => p.destroy())
  }

  // --- playback --------------------------------------------------------------

  async play(events: Event[], log: LogFn): Promise<void> {
    await this.readyPromise
    this.reset()
    const id = this.runId
    log(t(this.lang, 'logStart'))

    for (const e of events) {
      if (id !== this.runId) return
      if (e.kind === 'warn') {
        log(
          t(this.lang, e.code === 'test-before-train' ? 'warnTestBeforeTrain' : e.code === 'train-without-data' ? 'warnTrainWithoutData' : 'warnOneLabel'),
          'bad',
        )
        this.cameras.main.shake(200, 0.004)
        await this.wait(500)
      } else if (e.kind === 'collect') {
        await this.playCollect(e.examples, id)
        log(t(this.lang, 'logCollect', { n: e.examples.length, label: e.examples[0]?.label ?? '' }))
      } else if (e.kind === 'train') {
        await this.playTrain(e.history, log, id)
      } else {
        await this.playTest(e.results, e.accuracy, log, id)
      }
    }
    if (id === this.runId) this.belt.setData('moving', false)
  }

  private async playCollect(examples: { label: Label; x: number; y: number }[], id: number) {
    this.speed = examples.length > 8 ? 2.5 : 1.6
    this.status.setText('DATA +' + examples.length)
    for (const ex of examples) {
      if (id !== this.runId) return
      const fruit = this.spawnFruit(ex.label)
      await this.tween({ targets: fruit, x: ROBOT.x - 10, duration: 420, ease: 'Linear' })
      const to = this.toScreen(ex)
      await this.tween({ targets: fruit, x: to.x, y: to.y, scale: 1.4, duration: 380, ease: 'Quad.out' })
      fruit.destroy()
      const dot = this.add.graphics({ x: to.x, y: to.y })
      dot.fillStyle(INK).fillRect(-5, -5, 10, 10).fillStyle(LABEL_COLOUR[ex.label]).fillRect(-3, -3, 6, 6)
      this.dots.add(dot)
    }
    this.belt.setData('moving', false)
  }

  private async playTrain(history: Centroids[], log: LogFn, id: number) {
    this.speed = history.length > 6 ? 1.8 : 1.2
    const first = history[0]
    for (const l of Object.keys(first) as Label[]) {
      const p = this.toScreen(first[l]!)
      this.marker(l).setPosition(p.x, p.y).setScale(0)
      await this.tween({ targets: this.marker(l), scale: 1, duration: 250, ease: 'Back.out' })
    }
    this.paintRegions(first)
    for (let r = 1; r < history.length; r++) {
      if (id !== this.runId) return
      this.status.setText(`TRAINING ${r}/${history.length - 1}`)
      log(t(this.lang, 'logTrain', { r, total: history.length - 1 }))
      this.robot.setTint(0xfde68a)
      const moves = (Object.keys(history[r]) as Label[]).map((l) => {
        const p = this.toScreen(history[r][l]!)
        return this.tween({ targets: this.marker(l), x: p.x, y: p.y, duration: 520, ease: 'Cubic.inOut' })
      })
      await Promise.all(moves)
      this.robot.clearTint()
      this.paintRegions(history[r])
      await this.wait(160)
    }
  }

  private async playTest(results: { item: { label: Label; x: number; y: number }; guess: Label | null; correct: boolean }[], accuracy: number, log: LogFn, id: number) {
    this.speed = results.length > 12 ? 3 : 1.7
    let correct = 0
    for (const [i, r] of results.entries()) {
      if (id !== this.runId) return
      this.status.setText(`TESTING ${i + 1}/${results.length}`)
      const fruit = this.spawnFruit(r.item.label)
      await this.tween({ targets: fruit, x: ROBOT.x + 4, duration: 380, ease: 'Linear' })
      this.belt.setData('moving', false)

      // The robot's guess appears in its speech bubble.
      this.bubble.setVisible(true)
      this.bubble.list.slice(1).forEach((o) => o.destroy())
      this.bubble.add(
        r.guess
          ? this.add.image(0, 0, r.guess).setScale(2.6)
          : this.add.text(0, 0, '?', { ...FONT, fontSize: '40px' }).setOrigin(0.5),
      )
      await this.wait(260)

      if (r.guess) {
        const bx = BIN_X[r.guess]
        await this.tween({ targets: fruit, x: bx, duration: 360, ease: 'Sine.inOut' })
        await this.tween({ targets: fruit, y: BIN_Y + 10, duration: 200, ease: 'Quad.in' })
      } else {
        await this.tween({ targets: fruit, alpha: 0, angle: 180, duration: 300 })
      }
      if (r.correct) {
        correct++
        this.sparkle(fruit.x, BIN_Y, 0x22c55e)
      } else {
        this.sparkle(fruit.x, BIN_Y, 0xef4444)
        this.cameras.main.shake(120, 0.003)
      }
      fruit.destroy()
      this.bubble.setVisible(false)
    }
    if (id !== this.runId) return
    const acc = Math.round(accuracy * 100)
    this.status.setText(`ACCURACY ${acc}%`)
    log(t(this.lang, 'logTest', { correct, total: results.length, acc }), accuracy >= 0.9 ? 'good' : 'bad')
  }

  celebrate() {
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 140, () => this.sparkle(Phaser.Math.Between(60, 580), Phaser.Math.Between(60, 240), Phaser.Math.RND.pick([0x0d9488, 0xe5a93c, 0x881337])))
    }
    this.tweens.add({ targets: this.robot, angle: { from: -8, to: 8 }, duration: 120, yoyo: true, repeat: 5 })
  }
}
