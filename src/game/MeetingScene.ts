import * as Phaser from 'phaser'
import { registerPixelTextures } from './pixels'
import { NO_MILESTONES, STAGE_HEIGHT, STAGE_WIDTH, type LogFn, type Milestones, type PopupSide, type SessionScene } from './types'
import { t, type CardId, type Key, type Lang } from '../i18n'
import { CARES, PEOPLE, moodOf, type MeterId, type OsisResult, type PersonId, type PlanId, type PlanResult } from '../levels/osis/model'
import { METER_KEY, PERSON_KEY } from '../levels/osis/stages'
import { FONTS, css, hex } from '../theme'

const W = STAGE_WIDTH
const H = STAGE_HEIGHT
const INK = hex('ink')
const FONT = { fontFamily: FONTS.pixel, color: css('ink') }
const WEEK = { x: 14, y: 36, cell: 28, cols: 10 }
const BARS = { x: 14, y: 196, rowH: 40, labelW: 150, barW: 110 }
const MATRIX = { x: 338, y: 36, w: W - 350, rowH: 52 }

const PLAN_KEY: Record<PlanId, Key> = { attend: 'planAttend', essay1: 'planEssay1', essay2: 'planEssay2', chat: 'planChat', gate: 'planGate' }
const METER_ICON: Record<MeterId, string> = { time: '⏱', privacy: '🔒', fairness: '⚖', caught: '🎯', trust: '🤝', safety: '🛡' }
const PERSON_ICON: Record<PersonId, string> = { raka: '🧑', rina: '👩', joko: '👨', sari: '👧', udin: '👮' }
const MOOD_ICON = { happy: '😀', okay: '🙂', upset: '😟', none: '–' }

type Rect = { x: number; y: number; w: number; h: number }
const tone = (v: number) => (v >= 70 ? hex('tosca') : v >= 50 ? hex('amber') : hex('maroon'))

/**
 * Session 6: a school week for one proposal. On the left, what happened
 * that week as tokens and the meters it filled. On the right, the ethics
 * matrix: who watches which meter, and how each person feels.
 */
export class MeetingScene extends Phaser.Scene implements SessionScene {
  private lang: Lang = 'id'
  private week!: Phaser.GameObjects.Container
  private bars!: Phaser.GameObjects.Container
  private matrix!: Phaser.GameObjects.Container
  private weekTitle!: Phaser.GameObjects.Text
  private barsTitle!: Phaser.GameObjects.Text
  private matrixTitle!: Phaser.GameObjects.Text
  private idle?: Phaser.GameObjects.Text
  private focusBox?: Phaser.GameObjects.Graphics
  private milestones: Milestones = NO_MILESTONES
  private runId = 0
  private speed = 1
  readyPromise: Promise<void>
  private resolveReady!: () => void

  constructor() {
    super('meeting')
    this.readyPromise = new Promise((r) => (this.resolveReady = r))
  }

  create() {
    registerPixelTextures(this)
    this.cameras.main.setBackgroundColor(css('cream'))
    const g = this.add.graphics()
    g.fillStyle(INK).fillRect(MATRIX.x - 8 + 3, 10 + 3, MATRIX.w + 16, H - 20)
    g.fillStyle(hex('white')).fillRect(MATRIX.x - 8, 10, MATRIX.w + 16, H - 20)
    g.lineStyle(2, INK).strokeRect(MATRIX.x - 8, 10, MATRIX.w + 16, H - 20)
    this.weekTitle = this.add.text(WEEK.x, 10, '', { ...FONT, fontSize: '16px', color: css('maroon') })
    this.barsTitle = this.add.text(BARS.x, BARS.y - 26, '', { ...FONT, fontSize: '16px', color: css('maroon') })
    this.matrixTitle = this.add.text(MATRIX.x, 16, '', { ...FONT, fontSize: '16px', color: css('maroon') })
    this.week = this.add.container(0, 0)
    this.bars = this.add.container(0, 0)
    this.matrix = this.add.container(0, 0)
    this.idle = this.add.text(165, 150, '', { ...FONT, fontSize: '18px', color: css('ink-muted'), align: 'center' }).setOrigin(0.5)
    this.setLang(this.lang)
    this.resolveReady()
  }

  setLang(lang: Lang) {
    this.lang = lang
    this.matrixTitle?.setText(t(lang, 'oSceneMatrix'))
    this.barsTitle?.setText(t(lang, 'oSceneMeters'))
    this.idle?.setText(t(lang, 'oSceneIdle'))
    if (this.weekTitle && !this.weekTitle.text) this.weekTitle.setText(t(lang, 'oSceneWeek'))
  }

  private wait(ms: number) {
    return new Promise<void>((resolve) => this.time.delayedCall(ms / this.speed, resolve))
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig) {
    return new Promise<void>((resolve) => this.tweens.add({ ...config, duration: (Number(config.duration) || 300) / this.speed, onComplete: () => resolve() }))
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
    if (!this.week) return
    this.week.removeAll(true)
    this.bars.removeAll(true)
    this.matrix.removeAll(true)
  }

  /** The week, one token at a time. */
  private async drawWeek(p: PlanResult, run: number) {
    this.week.removeAll(true)
    this.weekTitle.setText(`${t(this.lang, 'oSceneWeek')} · ${t(this.lang, PLAN_KEY[p.plan])}`)
    const fill = { good: hex('tosca-tint'), bad: hex('maroon-tint'), warn: hex('amber-tint'), plain: hex('white') }
    for (const [i, tok] of p.tokens.entries()) {
      if (run !== this.runId) return
      const x = WEEK.x + (i % WEEK.cols) * WEEK.cell
      const y = WEEK.y + Math.floor(i / WEEK.cols) * WEEK.cell
      // A thick border marks what the week flagged or got wrong.
      const edge = { good: hex('tosca-dark'), bad: hex('maroon'), warn: hex('gold'), plain: INK }[tok.tone]
      const box = this.add.rectangle(x, y, WEEK.cell - 3, WEEK.cell - 3, fill[tok.tone]).setOrigin(0, 0).setStrokeStyle(tok.tone === 'plain' ? 1 : 3, edge)
      const icon = this.add.text(x + (WEEK.cell - 3) / 2, y + (WEEK.cell - 3) / 2, tok.icon, { ...FONT, fontSize: '14px', color: css(tok.tone === 'bad' ? 'maroon' : 'ink') }).setOrigin(0.5)
      this.week.add([box, icon])
      if (i % 4 === 3) await this.wait(40)
    }
  }

  private async drawBars(p: PlanResult) {
    this.bars.removeAll(true)
    const fills: Promise<void>[] = []
    p.meters.forEach((m, i) => {
      const y = BARS.y + i * BARS.rowH
      this.bars.add(this.add.text(BARS.x, y, `${METER_ICON[m.id]} ${t(this.lang, METER_KEY[m.id])}`, { ...FONT, fontSize: '14px', wordWrap: { width: BARS.labelW - 8 } }).setOrigin(0, 0.5))
      const x = BARS.x + BARS.labelW
      this.bars.add(this.add.rectangle(x, y, BARS.barW, 16, hex('white')).setOrigin(0, 0.5).setStrokeStyle(2, INK))
      // The line every meter must reach for the plan to pass.
      this.bars.add(this.add.rectangle(x + BARS.barW / 2, y, 2, 22, INK).setOrigin(0.5))
      const fill = this.add.rectangle(x + 1, y, 0, 14, tone(m.value)).setOrigin(0, 0.5)
      this.bars.add(fill)
      this.bars.add(this.add.text(x + BARS.barW + 8, y, String(m.value), { ...FONT, fontSize: '16px', color: css(m.value < 50 ? 'maroon' : 'ink') }).setOrigin(0, 0.5))
      fills.push(this.tween({ targets: fill, width: ((BARS.barW - 2) * m.value) / 100, duration: 500, ease: 'Quad.out' }))
    })
    await Promise.all(fills)
  }

  /** People down the side, the plan's meters across the top; a dot where a person watches a meter. */
  private async drawMatrix(p: PlanResult, run: number) {
    this.matrix.removeAll(true)
    const nameW = 110
    const colW = Math.min(44, (MATRIX.w - nameW - 40) / p.meters.length)
    const top = MATRIX.y + 4
    p.meters.forEach((m, j) => this.matrix.add(this.add.text(MATRIX.x + nameW + j * colW + colW / 2, top, METER_ICON[m.id], { ...FONT, fontSize: '18px' }).setOrigin(0.5, 0)))
    for (const [i, who] of PEOPLE.entries()) {
      if (run !== this.runId) return
      const y = top + 44 + i * MATRIX.rowH
      if (i % 2) this.matrix.add(this.add.rectangle(MATRIX.x - 6, y - MATRIX.rowH / 2 + 4, MATRIX.w + 12, MATRIX.rowH, hex('parchment')).setOrigin(0, 0))
      this.matrix.add(this.add.text(MATRIX.x, y, `${PERSON_ICON[who]} ${t(this.lang, PERSON_KEY[who])}`, { ...FONT, fontSize: '16px' }).setOrigin(0, 0.5))
      p.meters.forEach((m, j) => {
        const x = MATRIX.x + nameW + j * colW + colW / 2
        if (CARES[who].includes(m.id)) this.matrix.add(this.add.circle(x, y + 2, 9, tone(m.value)).setStrokeStyle(2, INK))
        else this.matrix.add(this.add.text(x, y, '·', { ...FONT, fontSize: '16px', color: css('ink-muted') }).setOrigin(0.5))
      })
      const mood = moodOf(who, p)
      this.matrix.add(this.add.text(MATRIX.x + MATRIX.w - 4, y, MOOD_ICON[mood], { ...FONT, fontSize: '22px', color: css('ink-muted') }).setOrigin(1, 0.5))
      await this.wait(120)
    }
  }

  private logPlan(p: PlanResult, log: LogFn) {
    const L = this.lang
    log(t(L, 'oLogWeek', { plan: t(L, PLAN_KEY[p.plan]) }))
    const f = p.facts
    if (p.plan === 'attend') log(t(L, 'oLogAttend', { missed: f.missed }), f.missed > 1 ? 'bad' : 'info')
    else if (p.plan === 'essay1' || p.plan === 'essay2') log(t(L, 'oLogEssay', { caught: f.caught, accused: f.accused }), f.accused > 0 ? 'bad' : 'info')
    else if (p.plan === 'chat') log(t(L, 'oLogChat', { wrong: f.wrong, load: f.load }), f.wrong > 0 ? 'bad' : 'info')
    else log(t(L, 'oLogGate', { days: f.days }))
    if (p.ok) {
      log(t(L, 'oLogOk', { plan: t(L, PLAN_KEY[p.plan]) }), 'good')
      return
    }
    for (const who of PEOPLE) {
      if (moodOf(who, p) !== 'upset') continue
      const low = p.meters.filter((m) => CARES[who].includes(m.id)).sort((a, b) => a.value - b.value)[0]
      log(t(L, 'oFailMeter', { who: t(L, PERSON_KEY[who]), meter: t(L, METER_KEY[low.id]), value: low.value }), 'bad')
    }
  }

  async play(rawEvents: unknown[], log: LogFn, milestones: Milestones = NO_MILESTONES): Promise<void> {
    await this.readyPromise
    const res = rawEvents[0] as OsisResult
    this.reset()
    const run = this.runId
    this.milestones = milestones
    const many = res.plans.length > 1
    const left: Rect = { x: 6, y: 4, w: 322, h: H - 8 }
    const right: Rect = { x: MATRIX.x - 12, y: 6, w: MATRIX.w + 24, h: H - 12 }
    for (const p of res.plans) {
      if (run !== this.runId) return
      this.speed = many ? 2 : 1
      await this.drawWeek(p, run)
      await this.drawBars(p)
      await this.drawMatrix(p, run)
      if (run !== this.runId) return
      this.logPlan(p, log)
      if (!p.ok) this.cameras.main.shake(120, 0.002)
      // Notebook moments.
      if (p.plan === 'attend' && p.facts.faces) await this.milestone('dataPrivacy', 'right', right, run, { n: p.facts.faces })
      if ((p.plan === 'essay1' || p.plan === 'essay2') && p.facts.accused) await this.milestone('falsePositive', 'left', left, run, { n: p.facts.accused })
      if ((p.plan === 'essay1' || p.plan === 'essay2') && p.facts.missed) await this.milestone('falseNegative', 'left', left, run, { n: p.facts.missed })
      const human = (p.plan === 'essay2' && res.settings.flag === 'talk') || (p.plan === 'chat' && res.settings.unsure === 'handoff')
      if (p.ok && human) await this.milestone('humanInTheLoop', 'right', right, run)
      if (many) await this.wait(900)
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
        this.sparkleAt(Phaser.Math.Between(340, 620), Phaser.Math.Between(40, 360), Phaser.Math.RND.pick([hex('tosca'), hex('amber'), hex('maroon')])),
      )
    }
  }
}
