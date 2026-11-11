import * as Phaser from 'phaser'
import { registerPixelTextures } from './pixels'
import { NO_MILESTONES, STAGE_HEIGHT, STAGE_WIDTH, type SessionScene, type LogFn, type Milestones, type PopupSide } from './types'
import { num, t, type CardId, type Lang } from '../i18n'
import { EDGE, GOAL, HILLS, START_X, loss, overshot, type HillId, type HillResult, type Move } from '../levels/hill/model'
import { PIXEL_TEXT, css, hex } from '../theme'

const W = STAGE_WIDTH
const H = STAGE_HEIGHT
const INK = hex('ink')
const FONT = { ...PIXEL_TEXT, color: css('ink') }
// Both hills share one height scale, so the steep one really looks steeper.
const MAX_LOSS = 2.5 * EDGE * EDGE
const GROUND_TOP = 108
const GROUND_BOTTOM = 352
const X_LEFT = 40
const X_RIGHT = W - 40
const ROBOT_SCALE = 2.6
const ROBOT_H = 17 * ROBOT_SCALE

const toPx = (x: number) => X_LEFT + ((x + EDGE) / (2 * EDGE)) * (X_RIGHT - X_LEFT)
const lossToY = (l: number) => GROUND_BOTTOM - (Math.min(l, MAX_LOSS) / MAX_LOSS) * (GROUND_BOTTOM - GROUND_TOP)
const fmtEn = (n: number) => (n < 0.01 ? n.toFixed(3) : n.toFixed(2))

/**
 * The hill of loss: a curve whose height is the loss, a flag in the valley,
 * and the robot hopping downhill one gradient step at a time.
 */
export class HillScene extends Phaser.Scene implements SessionScene {
  private lang: Lang = 'id'
  private hill: HillId = 'gentle'
  private budget = 30
  private terrain!: Phaser.GameObjects.Graphics
  private robot!: Phaser.GameObjects.Image
  private flag!: Phaser.GameObjects.Container
  private hud!: Phaser.GameObjects.Text
  private lossBar!: Phaser.GameObjects.Graphics
  private energy!: Phaser.GameObjects.Graphics
  private energyText!: Phaser.GameObjects.Text
  private chart!: Phaser.GameObjects.Graphics
  private goalText!: Phaser.GameObjects.Text
  private fx!: Phaser.GameObjects.Container
  private focusBox?: Phaser.GameObjects.Graphics
  private milestones: Milestones = NO_MILESTONES
  private runId = 0
  private speed = 1
  readyPromise: Promise<void>
  private resolveReady!: () => void

  constructor() {
    super('hill')
    this.readyPromise = new Promise((r) => (this.resolveReady = r))
  }

  private fmt(n: number) {
    return num(this.lang, fmtEn(n))
  }

  /** Loss at the edge of the flag zone: below this counts as in the valley. */
  private goalLoss() {
    return HILLS[this.hill].a * GOAL * GOAL
  }

  private groundY(x: number) {
    return lossToY(loss(this.hill, x))
  }

  create() {
    registerPixelTextures(this)
    this.cameras.main.setBackgroundColor(css('cream'))
    const grid = this.add.graphics()
    grid.lineStyle(1, INK, 0.05)
    for (let x = 0; x <= W; x += 24) grid.lineBetween(x, 0, x, H)
    for (let y = 0; y <= H; y += 24) grid.lineBetween(0, y, W, y)

    this.terrain = this.add.graphics()
    this.flag = this.add.container(toPx(0), 0)
    const pole = this.add.graphics()
    pole.fillStyle(INK).fillRect(-2, -46, 4, 46)
    pole.fillStyle(hex('maroon')).fillTriangle(2, -46, 2, -28, 26, -37)
    pole.lineStyle(2, INK).strokeTriangle(2, -46, 2, -28, 26, -37)
    this.flag.add(pole)

    this.fx = this.add.container(0, 0).setDepth(8)
    this.robot = this.add.image(toPx(START_X), 0, 'robot0').setScale(ROBOT_SCALE).setDepth(9)

    // HUD: loss on the left, energy on the right, a loss chart under it
    this.hud = this.add.text(16, 12, '', { ...FONT, fontSize: '26px' }).setDepth(12)
    this.lossBar = this.add.graphics().setDepth(12)
    this.energyText = this.add.text(W - 16, 12, '', { ...FONT, fontSize: '20px' }).setOrigin(1, 0).setDepth(12)
    this.energy = this.add.graphics().setDepth(12)
    this.chart = this.add.graphics().setDepth(12)
    this.goalText = this.add.text(16, 56, '', { ...FONT, fontSize: '18px', color: css('tosca') }).setDepth(12)

    this.drawHill()
    this.placeRobot(START_X)
    this.showLoss(loss(this.hill, START_X))
    this.showEnergy(this.budget)
    this.resolveReady()
  }

  setLang(lang: Lang) {
    this.lang = lang
    if (this.energyText) {
      this.showEnergy(this.budget)
      this.showLoss(loss(this.hill, START_X))
    }
  }

  /** Shows the stage's hill and energy before anything runs. */
  preview(data: unknown) {
    const setup = data as { hill: HillId; budget: number } | null
    if (!setup) return
    this.hill = setup.hill
    this.budget = setup.budget
    if (!this.terrain) return
    this.reset()
  }

  private drawHill() {
    const g = this.terrain
    g.clear()
    // Grass under the curve, then the curve itself
    const pts: Phaser.Math.Vector2[] = []
    for (let i = 0; i <= 64; i++) {
      const x = -EDGE + (2 * EDGE * i) / 64
      pts.push(new Phaser.Math.Vector2(toPx(x), this.groundY(x)))
    }
    g.fillStyle(hex('grass'), 0.8)
    g.beginPath()
    g.moveTo(X_LEFT, H)
    pts.forEach((p) => g.lineTo(p.x, p.y))
    g.lineTo(X_RIGHT, H)
    g.closePath()
    g.fillPath()
    g.lineStyle(5, INK)
    g.strokePoints(pts)
    // The goal zone in the valley
    g.fillStyle(hex('tosca'), 0.25).fillRect(toPx(-GOAL), lossToY(0) - 4, toPx(GOAL) - toPx(-GOAL), 8)
    this.flag.setPosition(toPx(0), this.groundY(0))
  }

  private placeRobot(x: number) {
    this.robot.setPosition(toPx(x), this.groundY(x) - ROBOT_H / 2 + 2).setAngle(0).setAlpha(1)
  }

  private showLoss(l: number) {
    this.hud.setText(`LOSS ${this.fmt(l)}`)
    this.goalText.setText(t(this.lang, 'hudGoal', { goal: this.fmt(this.goalLoss()) }))
    this.lossBar.clear()
    const w = 150
    const frac = Math.min(1, l / MAX_LOSS)
    this.lossBar.fillStyle(hex('white')).fillRect(16, 42, w, 10)
    this.lossBar.fillStyle(hex('maroon')).fillRect(16, 42, w * frac, 10)
    this.lossBar.lineStyle(2, INK).strokeRect(16, 42, w, 10)
  }

  private showEnergy(left: number) {
    this.energyText.setText(`${this.lang === 'id' ? 'ENERGI' : 'ENERGY'} ${left}/${this.budget}`)
    this.energy.clear()
    const cells = Math.min(this.budget, 15)
    const per = this.budget / cells
    const filled = Math.ceil(left / per)
    for (let i = 0; i < cells; i++) {
      const x = W - 16 - (cells - i) * 10
      this.energy.fillStyle(i < filled ? hex('amber') : hex('white')).fillRect(x, 38, 8, 12)
      this.energy.lineStyle(1, INK).strokeRect(x, 38, 8, 12)
    }
  }

  private drawChart(history: number[]) {
    const g = this.chart
    g.clear()
    if (history.length < 2) return
    const x0 = W - 166
    const y0 = 60
    const cw = 150
    const ch = 40
    g.fillStyle(hex('white'), 0.9).fillRect(x0, y0, cw, ch)
    g.lineStyle(2, INK).strokeRect(x0, y0, cw, ch)
    const max = Math.max(...history, 0.01)
    g.lineStyle(2, hex('maroon'))
    g.beginPath()
    history.forEach((l, i) => {
      const x = x0 + 4 + (i / (history.length - 1)) * (cw - 8)
      const y = y0 + ch - 4 - (Math.min(l, max) / max) * (ch - 8)
      if (i === 0) g.moveTo(x, y)
      else g.lineTo(x, y)
    })
    g.strokePath()
  }

  // --- helpers -----------------------------------------------------------------

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig) {
    return new Promise<void>((resolve) => {
      this.tweens.add({ ...config, duration: (Number(config.duration) || 300) / this.speed, onComplete: () => resolve() })
    })
  }

  private wait(ms: number) {
    return new Promise<void>((resolve) => this.time.delayedCall(ms / this.speed, resolve))
  }

  private highlight(rect: { x: number; y: number; w: number; h: number } | null) {
    this.focusBox?.destroy()
    this.focusBox = undefined
    if (!rect) return
    const g = this.add.graphics().setDepth(20)
    g.lineStyle(4, hex('amber')).strokeRect(rect.x, rect.y, rect.w, rect.h)
    this.tweens.add({ targets: g, alpha: 0.25, duration: 450, yoyo: true, repeat: -1 })
    this.focusBox = g
  }

  private async milestone(id: CardId, side: PopupSide, rect: { x: number; y: number; w: number; h: number }, run: number, vars?: Record<string, string | number>) {
    if (run !== this.runId || !this.milestones.isNew(id)) return
    this.highlight(rect)
    await this.milestones.show(id, side, vars)
    if (run === this.runId) this.highlight(null)
  }

  private robotRect() {
    return { x: this.robot.x - 40, y: this.robot.y - 50, w: 80, h: 90 }
  }

  /** Arrow from the robot pointing uphill, as long as the slope is steep. */
  private drawGradient(m: Move) {
    const g = this.add.graphics()
    this.fx.add(g)
    const dir = Math.sign(m.grad) || 1
    const len = Math.min(120, 30 + Math.abs(m.grad) * 9)
    const x1 = this.robot.x
    const y1 = this.robot.y - 30
    const slopePx = (this.groundY(m.from + dir * 0.3) - this.groundY(m.from)) / (toPx(m.from + dir * 0.3) - toPx(m.from))
    const angle = Math.atan2(slopePx * dir, dir)
    const x2 = x1 + Math.cos(angle) * len
    const y2 = y1 + Math.sin(angle) * len
    g.lineStyle(10, INK).lineBetween(x1, y1, x2, y2)
    g.lineStyle(6, hex('amber')).lineBetween(x1, y1, x2, y2)
    const head = 16
    g.fillStyle(hex('amber'))
    g.fillTriangle(
      x2 + Math.cos(angle) * 4,
      y2 + Math.sin(angle) * 4,
      x2 - Math.cos(angle - 0.6) * head,
      y2 - Math.sin(angle - 0.6) * head,
      x2 - Math.cos(angle + 0.6) * head,
      y2 - Math.sin(angle + 0.6) * head,
    )
    return g
  }

  reset() {
    this.runId++
    this.highlight(null)
    if (!this.terrain) return
    this.tweens.killTweensOf(this.robot)
    this.fx.removeAll(true)
    this.chart.clear()
    this.drawHill()
    this.placeRobot(START_X)
    this.robot.setTexture('robot0')
    this.showLoss(loss(this.hill, START_X))
    this.showEnergy(this.budget)
  }

  // --- playback ----------------------------------------------------------------

  async play(rawEvents: unknown[], log: LogFn, milestones: Milestones = NO_MILESTONES): Promise<void> {
    await this.readyPromise
    const result = rawEvents[0] as HillResult
    this.hill = result.hill
    this.budget = result.budget
    this.reset()
    const id = this.runId
    this.milestones = milestones

    const startLoss = loss(this.hill, START_X)
    log(t(this.lang, 'logHillStart', { loss: this.fmt(startLoss), budget: this.budget }))
    if (result.noLr) log(t(this.lang, 'warnNoLr'), 'bad')
    await this.milestone('loss', 'right', { x: 8, y: 6, w: 176, h: 72 }, id, { loss: this.fmt(startLoss) })

    const history = [startLoss]
    let arrivedLogged = false
    for (const [i, m] of result.moves.entries()) {
      if (id !== this.runId) return
      // Follow the first few steps closely, then hurry
      this.speed = i < 3 ? 1 : Math.min(4, 1.5 + result.moves.length / 8)

      const arrow = this.drawGradient(m)
      if (i === 0) await this.milestone('gradient', this.robot.x < W / 2 ? 'right' : 'left', this.robotRect(), id)
      await this.wait(260)

      // Hop along an arc to the new spot
      const off = Math.abs(m.to) > EDGE
      const fromX = this.robot.x
      const fromY = this.robot.y
      const toX = toPx(Math.max(-EDGE - 0.6, Math.min(EDGE + 0.6, m.to)))
      const toY = off ? -60 : this.groundY(m.to) - ROBOT_H / 2 + 2
      const lift = Math.min(160, 30 + Math.abs(toX - fromX) * 0.35)
      const hop = { t: 0 }
      arrow.destroy()
      this.robot.setTexture('robot1')
      await this.tween({
        targets: hop,
        t: 1,
        duration: off ? 520 : 420,
        ease: 'Sine.inOut',
        onUpdate: () => {
          const k = hop.t
          this.robot.x = fromX + (toX - fromX) * k
          this.robot.y = fromY + (toY - fromY) * k - Math.sin(Math.PI * k) * lift
          if (off) this.robot.angle = k * 540
        },
      })
      this.robot.setTexture('robot0')
      if (id !== this.runId) return

      if (off) {
        this.cameras.main.shake(260, 0.006)
        log(t(this.lang, 'warnFlewOff'), 'bad')
        // Mark where it left the hill, and show the energy it used
        const edgeX = Math.max(X_LEFT + 30, Math.min(X_RIGHT - 30, toX))
        const mark = this.add.text(edgeX, GROUND_TOP - 20, `💥 ${t(this.lang, 'hudFlewOff')}`, { ...FONT, fontSize: '20px', color: css('maroon') }).setOrigin(0.5)
        this.fx.add(mark)
        this.showEnergy(this.budget - (i + 1))
        break
      }
      history.push(m.lossAfter)
      this.showLoss(m.lossAfter)
      this.showEnergy(this.budget - (i + 1))
      this.drawChart(history)
      if (i === 0) await this.milestone('learningRate', this.robot.x < W / 2 ? 'right' : 'left', this.robotRect(), id, { lr: m.lr })

      if (!arrivedLogged && Math.abs(m.to) < GOAL) {
        arrivedLogged = true
        log(t(this.lang, 'logHillArrived', { n: i + 1 }), 'good')
        this.sparkleAt(this.robot.x, this.robot.y)
        await this.milestone('convergence', 'right', this.robotRect(), id)
      }
      await this.wait(70)
    }
    if (id !== this.runId) return
    const arrived = Math.abs(result.finalX) < GOAL && !result.flewOff
    if (result.tired && arrived) log(t(this.lang, 'logTiredArrived'))
    else if (result.tired) {
      const zzz = this.add.text(this.robot.x + 18, this.robot.y - 50, 'zzz', { ...FONT, fontSize: '24px' })
      this.fx.add(zzz)
      this.tweens.add({ targets: zzz, y: zzz.y - 14, alpha: 0.3, duration: 900, yoyo: true, repeat: 2 })
      log(t(this.lang, 'warnTired'), 'bad')
    }
    if (!result.flewOff) log(t(this.lang, 'logHillEnd', { n: result.moves.length, loss: this.fmt(loss(this.hill, result.finalX)) }))
    if (!arrived && !result.flewOff && overshot(result)) log(t(this.lang, 'logHillBounce'), 'bad')
    if (!arrived) log(t(this.lang, 'logHillGoal', { goal: this.fmt(this.goalLoss()) }))
  }

  private sparkleAt(x: number, y: number, tint = hex('spark')) {
    const p = this.add.particles(x, y, 'spark', { speed: { min: 50, max: 150 }, lifespan: 500, scale: { start: 3, end: 0 }, tint, emitting: false })
    p.setDepth(11)
    p.explode(12)
    this.time.delayedCall(650, () => p.destroy())
  }

  celebrate() {
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 140, () =>
        this.sparkleAt(Phaser.Math.Between(60, 580), Phaser.Math.Between(60, 260), Phaser.Math.RND.pick([hex('tosca'), hex('amber'), hex('maroon')])),
      )
    }
    this.tweens.add({ targets: this.robot, angle: { from: -10, to: 10 }, duration: 120, yoyo: true, repeat: 5 })
  }
}
