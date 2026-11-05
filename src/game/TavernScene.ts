import * as Phaser from 'phaser'
import { registerPixelTextures } from './pixels'
import { NO_MILESTONES, STAGE_HEIGHT, STAGE_WIDTH, type LevelScene, type LogFn, type Milestones, type PopupSide } from './types'
import { num, t, type CardId, type Lang } from '../i18n'
import type { Pick, TavernResult, Token } from '../levels/tavern/model'
import { tokenWord } from '../levels/tavern/blocks'
import { FONTS, css, hex } from '../theme'

const W = STAGE_WIDTH
const H = STAGE_HEIGHT
const INK = hex('ink')
const FONT = { fontFamily: FONTS.pixel, color: css('ink') }
const SCROLL = { x: 16, y: 12, w: W - 32, h: 86 }
const BARS = { x: 266, y: 128, rowH: 36, labelW: 96, barW: 170 }
const THERMO = { x: 216, top: 140, bottom: 300 }
const FLOOR_Y = 336

/**
 * The tavern: a story scroll at the top, the bard on the left, and the
 * next-token probability bars on the right, redrawn for every token.
 */
export class TavernScene extends Phaser.Scene implements LevelScene {
  private lang: Lang = 'id'
  private chips!: Phaser.GameObjects.Container
  private bars!: Phaser.GameObjects.Container
  private memory!: Phaser.GameObjects.Graphics
  private memoryLabel!: Phaser.GameObjects.Text
  private thermo!: Phaser.GameObjects.Graphics
  private thermoText!: Phaser.GameObjects.Text
  private barsTitle!: Phaser.GameObjects.Text
  private bard!: Phaser.GameObjects.Image
  private chipPos: { x: number; y: number; w: number }[] = []
  private focusBox?: Phaser.GameObjects.Graphics
  private milestones: Milestones = NO_MILESTONES
  private runId = 0
  private speed = 1
  readyPromise: Promise<void>
  private resolveReady!: () => void

  constructor() {
    super('tavern')
    this.readyPromise = new Promise((r) => (this.resolveReady = r))
  }

  create() {
    registerPixelTextures(this)
    this.cameras.main.setBackgroundColor(css('parchment'))
    const g = this.add.graphics()
    // Wooden wall and floor
    g.lineStyle(2, hex('plank'))
    for (let y = 120; y < FLOOR_Y; y += 30) g.lineBetween(0, y, W, y)
    g.fillStyle(hex('wood')).fillRect(0, FLOOR_Y, W, H - FLOOR_Y)
    g.lineStyle(2, hex('wood-dark'))
    for (let x = 0; x < W; x += 48) g.lineBetween(x, FLOOR_Y, x + 20, H)
    g.lineStyle(3, INK).lineBetween(0, FLOOR_Y, W, FLOOR_Y)
    // The story scroll
    g.fillStyle(INK).fillRect(SCROLL.x + 4, SCROLL.y + 4, SCROLL.w, SCROLL.h)
    g.fillStyle(hex('cream')).fillRect(SCROLL.x, SCROLL.y, SCROLL.w, SCROLL.h)
    g.lineStyle(3, INK).strokeRect(SCROLL.x, SCROLL.y, SCROLL.w, SCROLL.h)
    // A little table for the bars
    g.fillStyle(hex('cream'), 0.85).fillRect(BARS.x - 12, BARS.y - 30, W - BARS.x - 4, 5 * BARS.rowH + 40)
    g.lineStyle(2, INK).strokeRect(BARS.x - 12, BARS.y - 30, W - BARS.x - 4, 5 * BARS.rowH + 40)

    this.memory = this.add.graphics()
    this.memoryLabel = this.add.text(0, 0, '', { ...FONT, fontSize: '16px', color: css('tosca') }).setOrigin(0.5, 0)
    this.chips = this.add.container(0, 0)
    this.bars = this.add.container(0, 0)
    this.thermo = this.add.graphics()
    this.thermoText = this.add.text(THERMO.x, THERMO.bottom + 22, '', { ...FONT, fontSize: '20px' }).setOrigin(0.5, 0)
    this.barsTitle = this.add.text(BARS.x, BARS.y - 26, '', { ...FONT, fontSize: '20px' })
    this.bard = this.add.image(96, FLOOR_Y - 37, 'bard').setScale(4.2)
    this.tweens.add({ targets: this.bard, y: this.bard.y - 3, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut' })

    this.setLang(this.lang)
    this.drawThermo(0)
    this.resolveReady()
  }

  setLang(lang: Lang) {
    this.lang = lang
    this.barsTitle?.setText(lang === 'id' ? 'TOKEN BERIKUTNYA?' : 'NEXT TOKEN?')
  }

  private drawThermo(temp: number) {
    const g = this.thermo
    g.clear()
    const h = THERMO.bottom - THERMO.top
    const frac = Math.min(1, temp / 2)
    g.fillStyle(hex('white')).fillRect(THERMO.x - 7, THERMO.top, 14, h)
    g.fillStyle(hex('apple')).fillRect(THERMO.x - 7, THERMO.bottom - h * frac, 14, h * frac)
    g.lineStyle(3, INK).strokeRect(THERMO.x - 7, THERMO.top, 14, h)
    g.fillStyle(hex('apple')).fillCircle(THERMO.x, THERMO.bottom + 8, 11)
    g.lineStyle(3, INK).strokeCircle(THERMO.x, THERMO.bottom + 8, 11)
    this.thermoText.setText(`T=${num(this.lang, temp)}`)
  }

  /** Lays the story out as chips on the scroll, wrapping to a second line. */
  private addChip(token: Token, kind: 'start' | 'word' | 'end') {
    const word = tokenWord(this.lang, token)
    const label = this.add.text(0, 0, word, { ...FONT, fontSize: '22px', color: css('cream') }).setOrigin(0.5)
    const w = Math.max(28, label.width + 14)
    const last = this.chipPos.at(-1)
    let x = last ? last.x + last.w / 2 + 6 + w / 2 : SCROLL.x + 12 + w / 2
    let y = last ? last.y : SCROLL.y + 26
    if (x + w / 2 > SCROLL.x + SCROLL.w - 10) {
      x = SCROLL.x + 12 + w / 2
      y += 36
    }
    const bg = this.add.graphics()
    const colour = kind === 'start' ? hex('gold') : kind === 'end' ? hex('maroon') : hex('tosca')
    bg.fillStyle(INK).fillRoundedRect(-w / 2 + 2, -13, w, 28, 8)
    bg.fillStyle(colour).fillRoundedRect(-w / 2, -15, w, 28, 8)
    const chip = this.add.container(x, y, [bg, label])
    this.chips.add(chip)
    this.chipPos.push({ x, y, w })
    return chip
  }

  /** Underlines the tokens the bard is remembering right now. */
  private drawMemory(count: number) {
    const g = this.memory
    g.clear()
    const mem = this.chipPos.slice(-count)
    if (!mem.length) return
    const y = mem[mem.length - 1].y + 18
    const sameLine = mem.filter((m) => m.y === mem[mem.length - 1].y)
    const x1 = sameLine[0].x - sameLine[0].w / 2
    const x2 = sameLine[sameLine.length - 1].x + sameLine[sameLine.length - 1].w / 2
    g.lineStyle(6, hex('tosca')).lineBetween(x1, y, x2, y)
    g.lineBetween(x1, y, x1, y - 8).lineBetween(x2, y, x2, y - 8)
    this.memoryLabel.setPosition((x1 + x2) / 2, y + 2).setText(this.lang === 'id' ? 'ingat' : 'memory')
  }

  private drawBars(pick: Pick) {
    this.bars.removeAll(true)
    const rows = pick.candidates.slice(0, 5)
    return rows.map((c, i) => {
      const y = BARS.y + i * BARS.rowH + 10
      const label = this.add.text(BARS.x, y, tokenWord(this.lang, c.token), { ...FONT, fontSize: '22px' }).setOrigin(0, 0.5)
      const back = this.add.graphics()
      back.fillStyle(hex('white')).fillRect(BARS.x + BARS.labelW, y - 10, BARS.barW, 20)
      back.lineStyle(2, INK).strokeRect(BARS.x + BARS.labelW, y - 10, BARS.barW, 20)
      const fill = this.add.rectangle(BARS.x + BARS.labelW + 1, y, 0, 18, hex('tosca')).setOrigin(0, 0.5)
      // Thin grey line: the raw chance from the stories, before temperature
      const rawLine = this.add.rectangle(BARS.x + BARS.labelW + 1, y + 8, (BARS.barW - 2) * c.raw, 4, hex('ink-muted')).setOrigin(0, 0.5)
      const pct = this.add.text(BARS.x + BARS.labelW + BARS.barW + 8, y, `${Math.round(c.p * 100)}%`, { ...FONT, fontSize: '20px' }).setOrigin(0, 0.5)
      this.bars.add([label, back, fill, rawLine, pct])
      this.tweens.add({ targets: fill, width: (BARS.barW - 2) * c.p, duration: 260 / this.speed, ease: 'Quad.out' })
      return { token: c.token, fill, y }
    })
  }

  // --- helpers -----------------------------------------------------------------

  private wait(ms: number) {
    return new Promise<void>((resolve) => this.time.delayedCall(ms / this.speed, resolve))
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig) {
    return new Promise<void>((resolve) => {
      this.tweens.add({ ...config, duration: (Number(config.duration) || 300) / this.speed, onComplete: () => resolve() })
    })
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

  reset() {
    this.runId++
    this.highlight(null)
    if (!this.chips) return
    this.chips.removeAll(true)
    this.bars.removeAll(true)
    this.memory.clear()
    this.memoryLabel.setText('')
    this.chipPos = []
    this.drawThermo(0)
  }

  // --- playback ----------------------------------------------------------------

  async play(rawEvents: unknown[], log: LogFn, milestones: Milestones = NO_MILESTONES): Promise<void> {
    await this.readyPromise
    const result = rawEvents[0] as TavernResult
    this.reset()
    const id = this.runId
    this.milestones = milestones

    this.addChip(result.start, 'start')
    if (result.unused.length) {
      log(t(this.lang, 'warnUnusedSetting'), 'bad')
      this.cameras.main.shake(160, 0.003)
    }
    let warned = false
    for (const [i, pick] of result.picks.entries()) {
      if (id !== this.runId) return
      this.speed = i < 2 ? 1 : 1.8
      this.drawThermo(pick.temperature)
      this.drawMemory(pick.usedContext.length)
      const rows = this.drawBars(pick)
      await this.wait(380)
      if (i === 0) {
        await this.milestone('probability', 'left', { x: BARS.x - 16, y: BARS.y - 34, w: W - BARS.x + 4, h: 5 * BARS.rowH + 48 }, id, {
          word: tokenWord(this.lang, pick.candidates[0].token),
          raw: Math.round(pick.candidates[0].raw * 100),
        })
      }
      if (pick.temperature > 0) {
        await this.milestone('temperature', 'right', { x: THERMO.x - 34, y: THERMO.top - 10, w: W - THERMO.x + 22, h: THERMO.bottom - THERMO.top + 60 }, id, {
          t: num(this.lang, pick.temperature),
        })
      }

      // At temperature 0 the top bar wins outright; otherwise a pointer
      // hops between bars like a spinner before it settles.
      const marker = this.add.text(BARS.x - 8, rows[0].y, '▶', { ...FONT, fontSize: '22px', color: css('gold') }).setOrigin(1, 0.5)
      this.bars.add(marker)
      const chosenRow = rows.findIndex((r) => r.token === pick.chosen)
      if (pick.temperature > 0 && rows.length > 1) {
        const hops = 5 + (i % 3)
        for (let h = 0; h < hops; h++) {
          marker.y = rows[h % rows.length].y
          await this.wait(150)
        }
      }
      marker.y = rows[Math.max(0, chosenRow)].y
      const won = rows[Math.max(0, chosenRow)]
      won.fill.setFillStyle(hex('amber'))
      await this.wait(240)

      // The chosen token flies up into the story
      const chip = this.addChip(pick.chosen, pick.chosen === 'end' ? 'end' : 'word')
      const target = { x: chip.x, y: chip.y }
      chip.setPosition(BARS.x + 40, won.y).setScale(0.6)
      await this.tween({ targets: chip, x: target.x, y: target.y, scale: 1, duration: 360, ease: 'Quad.out' })
      if (i === 0) await this.milestone('token', 'right', { x: SCROLL.x - 4, y: SCROLL.y - 4, w: Math.min(SCROLL.w + 8, target.x + 60), h: SCROLL.h + 8 }, id)

      // The context card comes up when memory matters: a loop, or a longer memory in use
      const story = [...pick.history, pick.chosen]
      const grams = story.slice(0, -2).map((_, k) => story.slice(k, k + 3).join(' '))
      const loopingNow = grams.length > 1 && grams.indexOf(grams[grams.length - 1]) !== grams.length - 1
      if (loopingNow && !warned) {
        warned = true
        log(t(this.lang, 'logTokLoop'), 'bad')
        this.cameras.main.shake(140, 0.003)
      }
      if (loopingNow || pick.usedContext.length > 1) {
        await this.milestone('context', 'right', { x: SCROLL.x - 4, y: SCROLL.y - 4, w: SCROLL.w + 8, h: SCROLL.h + 8 }, id)
      }
      await this.wait(90)
    }
    if (id !== this.runId) return
    // The last step's bars stay up, so the player can look at them after the run.
    const words = result.story.map((tk) => tokenWord(this.lang, tk)).join(' ').replace(/ \.$/, '.')
    log(t(this.lang, 'logTokStory', { story: words }))
    if (result.finished) log(t(this.lang, 'logTokFinished'), 'good')
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
        this.sparkleAt(Phaser.Math.Between(60, 580), Phaser.Math.Between(60, 300), Phaser.Math.RND.pick([hex('tosca'), hex('amber'), hex('maroon')])),
      )
    }
    this.tweens.add({ targets: this.bard, angle: { from: -10, to: 10 }, duration: 140, yoyo: true, repeat: 5 })
  }
}
