import * as Phaser from 'phaser'
import { registerPixelTextures } from './pixels'
import { NO_MILESTONES, STAGE_HEIGHT, STAGE_WIDTH, type LogFn, type Milestones, type PopupSide, type SessionScene } from './types'
import { num, t, type CardId, type Key, type Lang } from '../i18n'
import { END, QUESTIONS, firstWord, type Answer, type BoardResult, type Pick } from '../levels/board/model'
import { FONTS, css, hex } from '../theme'

const W = STAGE_WIDTH
const H = STAGE_HEIGHT
const INK = hex('ink')
const FONT = { fontFamily: FONTS.pixel, color: css('ink') }
const BOARD = { x: 14, y: 14, w: 246, h: H - 28 }
const STRIP = { x: 276, y: 14, w: W - 290, h: 86 }
const BARS = { x: 280, y: 156, rowH: 30, labelW: 108, barW: 150 }
const FRIEND_KEY: Record<string, Key> = { dinda: 'friendDinda', raka: 'friendRaka', sari: 'friendSari' }

type Rect = { x: number; y: number; w: number; h: number }

/**
 * Session 5: the notice board Kata learned from, on the left; on the right,
 * Kata's answer growing word by word, and the bars for the next word.
 * The last bars stay up after a run, so they can be studied.
 */
export class WordScene extends Phaser.Scene implements SessionScene {
  private lang: Lang = 'id'
  private notes!: Phaser.GameObjects.Container
  private chips!: Phaser.GameObjects.Container
  private bars!: Phaser.GameObjects.Container
  private memory!: Phaser.GameObjects.Text
  private settings!: Phaser.GameObjects.Text
  private stamp!: Phaser.GameObjects.Text
  private boardTitle!: Phaser.GameObjects.Text
  private barsTitle!: Phaser.GameObjects.Text
  private robot!: Phaser.GameObjects.Image
  private chipPos: { x: number; y: number; w: number }[] = []
  private noteRects: { text: string; rect: Rect }[] = []
  private focusBox?: Phaser.GameObjects.Graphics
  private milestones: Milestones = NO_MILESTONES
  private runId = 0
  private speed = 1
  readyPromise: Promise<void>
  private resolveReady!: () => void

  constructor() {
    super('word')
    this.readyPromise = new Promise((r) => (this.resolveReady = r))
  }

  create() {
    registerPixelTextures(this)
    this.cameras.main.setBackgroundColor(css('cream'))
    const g = this.add.graphics()
    // The cork board with a wooden frame
    g.fillStyle(INK).fillRect(BOARD.x + 4, BOARD.y + 4, BOARD.w, BOARD.h)
    g.fillStyle(hex('wood')).fillRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h)
    g.fillStyle(hex('path')).fillRect(BOARD.x + 8, BOARD.y + 8, BOARD.w - 16, BOARD.h - 16)
    g.lineStyle(2, INK).strokeRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h)
    this.boardTitle = this.add.text(BOARD.x + BOARD.w / 2, BOARD.y + 12, '', { ...FONT, fontSize: '16px', color: css('white'), backgroundColor: css('maroon'), padding: { x: 6, y: 1 } }).setOrigin(0.5, 0)
    this.notes = this.add.container(0, 0)
    // The answer strip
    g.fillStyle(INK).fillRect(STRIP.x + 3, STRIP.y + 3, STRIP.w, STRIP.h)
    g.fillStyle(hex('white')).fillRect(STRIP.x, STRIP.y, STRIP.w, STRIP.h)
    g.lineStyle(2, INK).strokeRect(STRIP.x, STRIP.y, STRIP.w, STRIP.h)
    this.chips = this.add.container(0, 0)
    this.barsTitle = this.add.text(BARS.x, BARS.y - 28, '', { ...FONT, fontSize: '18px' })
    this.bars = this.add.container(0, 0)
    this.memory = this.add.text(STRIP.x + 6, STRIP.y + STRIP.h + 6, '', { ...FONT, fontSize: '16px', color: css('tosca-dark') })
    this.robot = this.add.image(320, H - 46, 'robot0').setScale(3)
    this.tweens.add({ targets: this.robot, y: this.robot.y - 3, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
    this.settings = this.add.text(360, H - 76, '', { ...FONT, fontSize: '18px' })
    this.stamp = this.add.text(W - 16, H - 40, '', { ...FONT, fontSize: '20px', color: css('white'), padding: { x: 6, y: 2 } }).setOrigin(1, 0.5)
    this.setLang(this.lang)
    this.resolveReady()
  }

  setLang(lang: Lang) {
    this.lang = lang
    this.boardTitle?.setText(t(lang, 'wSceneBoard'))
    this.barsTitle?.setText(t(lang, 'wSceneNext'))
  }

  /** Pins every board sentence as a note; a new notice gets a NEW tag. */
  private drawBoard(sentences: string[], notice: string | null) {
    this.notes.removeAll(true)
    this.noteRects = []
    const top = BOARD.y + 38
    const h = Math.min(30, (BOARD.h - 48) / sentences.length)
    sentences.forEach((s, i) => {
      const y = top + i * h
      const isNew = s === notice
      const text = this.add.text(BOARD.x + 20, y + 4, s.replace(/ \.$/, '.'), { ...FONT, fontSize: '15px' })
      const bg = this.add.rectangle(BOARD.x + 14, y, BOARD.w - 28, h - 4, isNew ? hex('amber-tint') : hex('cream')).setOrigin(0, 0).setStrokeStyle(1, INK)
      const pin = this.add.circle(BOARD.x + BOARD.w / 2, y + 1, 3, hex('maroon'))
      this.notes.add([bg, text, pin])
      if (isNew) this.notes.add(this.add.text(BOARD.x + BOARD.w - 18, y + 3, t(this.lang, 'wSceneNew'), { ...FONT, fontSize: '14px', color: css('maroon') }).setOrigin(1, 0))
      this.noteRects.push({ text: s, rect: { x: BOARD.x + 12, y: y - 2, w: BOARD.w - 24, h } })
    })
  }

  private addChip(word: string, kind: 'prompt' | 'word' | 'end') {
    const label = this.add.text(0, 0, word, { ...FONT, fontSize: '18px', color: css(kind === 'prompt' ? 'ink' : 'white') }).setOrigin(0.5)
    const w = Math.max(22, label.width + 12)
    const last = this.chipPos.at(-1)
    let x = last ? last.x + last.w / 2 + 5 + w / 2 : STRIP.x + 10 + w / 2
    let y = last ? last.y : STRIP.y + 20
    if (x + w / 2 > STRIP.x + STRIP.w - 8) {
      x = STRIP.x + 10 + w / 2
      y += 26
    }
    const colour = kind === 'prompt' ? hex('amber') : kind === 'end' ? hex('maroon') : hex('tosca-dark')
    const bg = this.add.rectangle(0, 0, w, 22, colour).setStrokeStyle(2, INK)
    const chip = this.add.container(x, y, [bg, label])
    this.chips.add(chip)
    this.chipPos.push({ x, y, w })
    return chip
  }

  private drawBars(pick: Pick) {
    this.bars.removeAll(true)
    return pick.candidates.slice(0, 5).map((c, i) => {
      const y = BARS.y + i * BARS.rowH + 8
      const label = this.add.text(BARS.x, y, c.word, { ...FONT, fontSize: '18px' }).setOrigin(0, 0.5)
      const back = this.add.rectangle(BARS.x + BARS.labelW, y, BARS.barW, 16, hex('white')).setOrigin(0, 0.5).setStrokeStyle(2, INK)
      const fill = this.add.rectangle(BARS.x + BARS.labelW + 1, y, 0, 14, hex('tosca')).setOrigin(0, 0.5)
      // Thin grey line: the chance straight from the counts, before temperature
      const rawLine = this.add.rectangle(BARS.x + BARS.labelW + 1, y + 6, (BARS.barW - 2) * c.raw, 3, hex('ink-muted')).setOrigin(0, 0.5)
      const pct = this.add.text(BARS.x + BARS.labelW + BARS.barW + 6, y, `${Math.round(c.p * 100)}%`, { ...FONT, fontSize: '18px' }).setOrigin(0, 0.5)
      this.bars.add([label, back, fill, rawLine, pct])
      this.tweens.add({ targets: fill, width: (BARS.barW - 2) * c.p, duration: 240 / this.speed, ease: 'Quad.out' })
      return { word: c.word, fill, y }
    })
  }

  private wait(ms: number) {
    return new Promise<void>((resolve) => this.time.delayedCall(ms / this.speed, resolve))
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig) {
    return new Promise<void>((resolve) => {
      this.tweens.add({ ...config, duration: (Number(config.duration) || 300) / this.speed, onComplete: () => resolve() })
    })
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
    if (!this.chips) return
    this.chips.removeAll(true)
    this.chipPos = []
    this.bars.removeAll(true)
    this.memory.setText('')
    this.stamp.setText('').setBackgroundColor('')
  }

  private async writeAnswer(a: Answer, temperature: number, run: number, log: LogFn, first: boolean) {
    this.chips.removeAll(true)
    this.chipPos = []
    this.stamp.setText('').setBackgroundColor('')
    for (const w of a.prompt) this.addChip(w, 'prompt')
    let warnedBackoff = false
    for (const [i, pick] of a.picks.entries()) {
      if (run !== this.runId) return
      this.speed = i < 2 ? 1 : 2.5
      this.memory.setText(`${t(this.lang, 'wSceneMemory')}: "${pick.used.join(' ')}"`)
      const rows = this.drawBars(pick)
      await this.wait(360)
      if (pick.backedOff && !warnedBackoff && pick.history.length > pick.used.length) {
        warnedBackoff = true
        const tried = pick.history.slice(-Math.min(3, pick.history.length)).join(' ')
        log(t(this.lang, 'wLogBackoff', { ctx: tried, used: pick.used.join(' ') }), 'bad')
      }
      if (first && i === 0) {
        await this.milestone('generativeAI', 'right', { x: BARS.x - 8, y: BARS.y - 34, w: W - BARS.x, h: 5 * BARS.rowH + 40 }, run, {
          ctx: pick.used.join(' '),
          word: pick.chosen,
          pct: Math.round(pick.candidates[0].raw * 100),
        })
      }
      // Above temperature 0 a pointer hops between bars before it settles.
      const marker = this.add.text(BARS.x - 6, rows[0].y, '▶', { ...FONT, fontSize: '18px', color: css('gold') }).setOrigin(1, 0.5)
      this.bars.add(marker)
      if (temperature > 0 && rows.length > 1) {
        for (let h = 0; h < 4 + (i % 3); h++) {
          marker.y = rows[h % rows.length].y
          await this.wait(130)
        }
      }
      const won = rows.find((r) => r.word === pick.chosen) ?? rows[0]
      marker.y = won.y
      won.fill.setFillStyle(hex('amber'))
      await this.wait(200)
      const chip = this.addChip(pick.chosen, pick.chosen === END ? 'end' : 'word')
      const target = { x: chip.x, y: chip.y }
      chip.setPosition(BARS.x + 40, won.y).setScale(0.6)
      await this.tween({ targets: chip, x: target.x, y: target.y, scale: 1, duration: 320, ease: 'Quad.out' })
    }
    log(t(this.lang, 'wLogAnswer', { text: a.text.join(' ').replace(/ \./g, '.') }))
    if (a.looped) {
      log(t(this.lang, 'wLogLoop'), 'bad')
      this.cameras.main.shake(140, 0.003)
    }
  }

  private async showCheck(a: Answer, run: number, log: LogFn) {
    if (!a.check) return
    if (a.check.supported) {
      this.stamp.setText(t(this.lang, 'wSceneOnBoard')).setBackgroundColor(css('tosca-dark'))
      log(t(this.lang, 'wLogSupported', { sentence: a.check.sentence!.replace(/ \.$/, '.') }), 'good')
      const note = this.noteRects.find((n) => n.text === a.check!.sentence)
      if (note) {
        this.highlight(note.rect)
        await this.wait(700)
        if (run === this.runId) this.highlight(null)
      }
    } else {
      this.stamp.setText(t(this.lang, 'wSceneNotOnBoard')).setBackgroundColor(css('maroon'))
      log(t(this.lang, 'wLogNotOnBoard'), 'bad')
      this.cameras.main.shake(140, 0.003)
      await this.milestone('hallucination', 'left', { x: BOARD.x - 2, y: BOARD.y - 2, w: BOARD.w + 8, h: BOARD.h + 8 }, run, { answer: firstWord(a) ?? '' })
    }
  }

  async play(rawEvents: unknown[], log: LogFn, milestones: Milestones = NO_MILESTONES): Promise<void> {
    await this.readyPromise
    const res = rawEvents[0] as BoardResult
    this.reset()
    const run = this.runId
    this.milestones = milestones
    const L = this.lang
    this.drawBoard(res.board, res.notice)
    this.settings.setText(`T=${num(L, res.temperature)} · ${t(L, 'wSceneMemory')} ${res.context}`)
    let first = true
    for (const e of res.events) {
      if (run !== this.runId) return
      this.speed = 1
      if (e.kind === 'noAsk') log(t(L, 'wFailNoAsk'), 'bad')
      else if (e.kind === 'reread') {
        log(t(L, 'wLogReread', { notice: e.notice.replace(/ \.$/, '.') }), 'good')
        this.tweens.add({ targets: this.robot, angle: { from: -8, to: 8 }, duration: 120, yoyo: true, repeat: 3 })
        await this.wait(500)
      } else if (e.kind === 'answer') {
        await this.writeAnswer(e.answer, e.temperature, run, log, first)
        first = false
        await this.showCheck(e.answer, run, log)
        await this.wait(300)
      }
    }
    if (run !== this.runId) return
    // Puzzle 5: say whose question each answer was for.
    const qs = QUESTIONS[L]
    if (res.answers.length === qs.length) {
      let right = 0
      qs.forEach((q, i) => {
        const got = firstWord(res.answers[i]) ?? '-'
        const ok = got === q.answer
        if (ok) right++
        log(t(L, 'wLogFriend', { who: t(L, FRIEND_KEY[q.who]), about: q.about.join(' '), answer: got, verdict: t(L, ok ? 'wRight' : 'wWrong') }), ok ? 'good' : 'bad')
      })
      if (right === qs.length) await this.milestone('prompt', 'right', { x: STRIP.x - 4, y: STRIP.y - 4, w: STRIP.w + 8, h: STRIP.h + 8 }, run, { n: right })
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
        this.sparkleAt(Phaser.Math.Between(290, 620), Phaser.Math.Between(40, 300), Phaser.Math.RND.pick([hex('tosca'), hex('amber'), hex('maroon')])),
      )
    }
    this.tweens.add({ targets: this.robot, angle: { from: -10, to: 10 }, duration: 140, yoyo: true, repeat: 5 })
  }
}
