import * as Phaser from 'phaser'
import { registerPixelTextures } from './pixels'
import { NO_MILESTONES, STAGE_HEIGHT, STAGE_WIDTH, type LogFn, type Milestones, type PopupSide, type SessionScene } from './types'
import { t, type CardId, type Key, type Lang } from '../i18n'
import type { ChatEvent, ChatResult, Label, Sorted } from '../levels/chat/model'
import { FONTS, css, hex } from '../theme'

const W = STAGE_WIDTH
const H = STAGE_HEIGHT
const INK = hex('ink')
const FONT = { fontFamily: FONTS.pixel, color: css('ink') }
const PHONE = { x: 14, y: 14, w: 240, h: H - 28 }
const FEED = { x: PHONE.x + 10, top: PHONE.y + 44, bottom: PHONE.y + PHONE.h - 12, w: PHONE.w - 20 }
const PIVOT = { x: 446, y: 108 }
const ARM = 118
const PAN_DROP = 64
const PANEL = { x: 270, y: 236, w: W - 284, h: H - 250 }

const LABEL_COLOUR: Record<Label, number> = { penting: hex('maroon'), santai: hex('tosca') }
const labelText = (lang: Lang, l: Label) => t(lang, l === 'penting' ? 'cPenting' : 'cSantai')

type Rect = { x: number; y: number; w: number; h: number }

/**
 * Session 1: the class chat on a phone, on the left. On the right, a
 * balance: every word of a message drops onto the side it pushes Kata
 * towards, and the beam tips to the answer. Under it, Kata's brain (the
 * words it learned) or the player's rules.
 */
export class ChatScene extends Phaser.Scene implements SessionScene {
  protected lang: Lang = 'id'
  protected feed!: Phaser.GameObjects.Container
  protected bubbles: Phaser.GameObjects.Container[] = []
  protected beam!: Phaser.GameObjects.Container
  protected pans!: Record<Label, Phaser.GameObjects.Container>
  protected chips!: Phaser.GameObjects.Container
  protected panel!: Phaser.GameObjects.Container
  protected header!: Phaser.GameObjects.Text
  protected chatTitle!: Phaser.GameObjects.Text
  protected score!: Phaser.GameObjects.Text
  protected robot!: Phaser.GameObjects.Image
  protected focusBox?: Phaser.GameObjects.Graphics
  protected milestones: Milestones = NO_MILESTONES
  protected runId = 0
  protected speed = 1
  readyPromise: Promise<void>
  protected resolveReady!: () => void

  constructor(key = 'chat') {
    super(key)
    this.readyPromise = new Promise((r) => (this.resolveReady = r))
  }

  create() {
    registerPixelTextures(this)
    this.cameras.main.setBackgroundColor(css('cream'))
    const g = this.add.graphics()
    // The phone
    g.fillStyle(INK).fillRoundedRect(PHONE.x + 4, PHONE.y + 4, PHONE.w, PHONE.h, 16)
    g.fillStyle(hex('ink')).fillRoundedRect(PHONE.x, PHONE.y, PHONE.w, PHONE.h, 16)
    g.fillStyle(hex('parchment')).fillRoundedRect(PHONE.x + 6, PHONE.y + 34, PHONE.w - 12, PHONE.h - 40, 10)
    this.chatTitle = this.add.text(PHONE.x + PHONE.w / 2, PHONE.y + 18, '', { ...FONT, fontSize: '18px', color: css('cream') }).setOrigin(0.5)
    this.feed = this.add.container(0, 0)
    const mask = this.make.graphics({}).fillRect(PHONE.x + 6, PHONE.y + 34, PHONE.w - 12, PHONE.h - 40)
    this.feed.setMask(mask.createGeometryMask())

    // The balance: a post, a beam that tilts, and a pan hanging from each end
    g.fillStyle(INK).fillRect(PIVOT.x - 4, PIVOT.y, 8, 112)
    g.fillStyle(hex('wood')).fillRect(PIVOT.x - 40, PIVOT.y + 108, 80, 12)
    g.lineStyle(2, INK).strokeRect(PIVOT.x - 40, PIVOT.y + 108, 80, 12)
    this.beam = this.add.container(PIVOT.x, PIVOT.y)
    const bar = this.add.rectangle(0, 0, ARM * 2 + 20, 8, INK)
    const hub = this.add.circle(0, 0, 8, hex('amber')).setStrokeStyle(2, INK)
    this.beam.add([bar, hub])
    this.pans = { penting: this.makePan('penting'), santai: this.makePan('santai') }
    this.chips = this.add.container(0, 0)
    this.robot = this.add.image(PIVOT.x, PIVOT.y - 48, 'robot0').setScale(2.4)

    this.header = this.add.text(270, 12, '', { ...FONT, fontSize: '20px' })
    this.score = this.add.text(W - 14, 12, '', { ...FONT, fontSize: '20px' }).setOrigin(1, 0)

    // The panel: Kata's brain, the examples it has, or the player's rules
    g.fillStyle(INK).fillRect(PANEL.x + 3, PANEL.y + 3, PANEL.w, PANEL.h)
    g.fillStyle(hex('white')).fillRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h)
    g.lineStyle(2, INK).strokeRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h)
    this.panel = this.add.container(PANEL.x, PANEL.y)

    this.setLang(this.lang)
    this.positionPans(0)
    this.resolveReady()
  }

  setLang(lang: Lang) {
    this.lang = lang
    this.chatTitle?.setText(t(lang, 'cSceneChat'))
    if (this.pans) {
      for (const l of ['penting', 'santai'] as Label[]) (this.pans[l].getData('label') as Phaser.GameObjects.Text).setText(labelText(lang, l))
    }
  }

  protected makePan(label: Label) {
    const pan = this.add.container(0, 0)
    const strings = this.add.graphics()
    strings.lineStyle(2, INK).lineBetween(0, 0, -34, PAN_DROP).lineBetween(0, 0, 34, PAN_DROP)
    const dish = this.add.rectangle(0, PAN_DROP + 4, 84, 10, LABEL_COLOUR[label]).setStrokeStyle(2, INK)
    const text = this.add.text(0, PAN_DROP + 14, '', { ...FONT, fontSize: '16px', color: css(label === 'penting' ? 'maroon' : 'tosca-dark') }).setOrigin(0.5, 0)
    pan.add([strings, dish, text])
    pan.setData('label', text)
    return pan
  }

  /** Tilts the beam: positive tips towards penting (left). */
  protected positionPans(angleDeg: number) {
    this.beam.setAngle(-angleDeg)
    const a = Phaser.Math.DegToRad(-angleDeg)
    this.pans.penting.setPosition(PIVOT.x - Math.cos(a) * ARM, PIVOT.y - Math.sin(a) * ARM)
    this.pans.santai.setPosition(PIVOT.x + Math.cos(a) * ARM, PIVOT.y + Math.sin(a) * ARM)
  }

  protected async tilt(score: number) {
    const target = Phaser.Math.Clamp(score * 4, -14, 14)
    const from = { v: -this.beam.angle }
    await this.tween({ targets: from, v: target, duration: 380, ease: 'Back.out', onUpdate: () => this.positionPans(from.v) })
  }

  // --- the phone -------------------------------------------------------------

  /** Adds a message bubble at the bottom of the feed and scrolls the rest up. */
  protected async addBubble(text: string) {
    const label = this.add.text(10, 6, text, { ...FONT, fontSize: '18px', wordWrap: { width: FEED.w - 24 } })
    // Room under the text for the verdict tag
    const h = label.height + 26
    const bg = this.add.graphics()
    bg.fillStyle(hex('white')).fillRoundedRect(0, 0, FEED.w - 4, h, 8)
    bg.lineStyle(2, INK).strokeRoundedRect(0, 0, FEED.w - 4, h, 8)
    const bubble = this.add.container(FEED.x, FEED.bottom - h, [bg, label])
    bubble.setData('h', h)
    this.feed.add(bubble)
    // Push older bubbles up; forget the ones that scrolled away.
    for (const b of this.bubbles) b.y -= h + 8
    this.bubbles = [...this.bubbles.filter((b) => b.y + (b.getData('h') as number) > FEED.top - 40 || (b.destroy(), false)), bubble]
    bubble.setAlpha(0)
    await this.tween({ targets: bubble, alpha: 1, duration: 160 })
    return bubble
  }

  /** Marks a bubble with the verdict: the label it went to, and ✓ or ✗. */
  protected tag(bubble: Phaser.GameObjects.Container, label: Label | null, right: boolean) {
    const h = bubble.getData('h') as number
    const text = label ? `${labelText(this.lang, label)} ${right ? '✓' : '✗'}` : `? ${t(this.lang, 'cSceneNoRule')} ✗`
    const chip = this.add.text(FEED.w - 10, h - 4, text, {
      ...FONT,
      fontSize: '14px',
      color: css('white'),
      backgroundColor: label ? css(label === 'penting' ? 'maroon' : 'tosca-dark') : css('ink-muted'),
      padding: { x: 4, y: 1 },
    })
    chip.setOrigin(1, 1)
    bubble.add(chip)
    if (!right) {
      const g = bubble.list[0] as Phaser.GameObjects.Graphics
      g.lineStyle(3, hex('apple')).strokeRoundedRect(0, 0, FEED.w - 4, h, 8)
    }
  }

  // --- the panel ---------------------------------------------------------------

  protected clearPanel(titleKey: Key) {
    this.panel.removeAll(true)
    this.panel.add(this.add.text(10, 6, t(this.lang, titleKey), { ...FONT, fontSize: '18px' }))
  }

  protected showExamples(count: Record<Label, number>) {
    this.clearPanel('cSceneExamples')
    ;(['penting', 'santai'] as Label[]).forEach((l, i) => {
      const x = 10 + i * (PANEL.w / 2)
      this.panel.add(this.add.text(x, 34, labelText(this.lang, l), { ...FONT, fontSize: '18px', color: css(l === 'penting' ? 'maroon' : 'tosca-dark') }))
      this.panel.add(this.add.text(x, 58, String(count[l]), { ...FONT, fontSize: '48px' }))
    })
  }

  protected showBrain(top: Extract<ChatEvent, { kind: 'train' }>['top']) {
    this.clearPanel('cSceneBrain')
    const max = Math.max(0.01, ...top.penting.map((x) => x.w), ...top.santai.map((x) => -x.w))
    ;(['penting', 'santai'] as Label[]).forEach((l, i) => {
      const x = 10 + i * (PANEL.w / 2)
      top[l].forEach((wd, k) => {
        const y = 32 + k * 26
        this.panel.add(this.add.text(x, y, wd.word, { ...FONT, fontSize: '18px', color: css(l === 'penting' ? 'maroon' : 'tosca-dark') }))
        const len = (Math.abs(wd.w) / max) * 60
        this.panel.add(this.add.rectangle(x + 92, y + 9, len, 10, LABEL_COLOUR[l]).setOrigin(0, 0.5).setStrokeStyle(1, INK))
      })
    })
  }

  protected showRules(rules: ChatResult['rules'], fallback: Label | null, active: number | 'else' | null) {
    this.clearPanel('cSceneRules')
    const rows = [...rules.map((r) => `${r.word || '…'} → ${labelText(this.lang, r.label)}`), ...(fallback ? [`* → ${labelText(this.lang, fallback)}`] : [])]
    rows.slice(0, 5).forEach((row, i) => {
      const on = active === i || (active === 'else' && i === rows.length - 1 && fallback !== null)
      this.panel.add(this.add.text(10, 32 + i * 22, row, { ...FONT, fontSize: '18px', color: on ? css('maroon') : css('ink'), backgroundColor: on ? css('amber-tint') : undefined }))
    })
    if (rows.length > 5) this.panel.add(this.add.text(10, 32 + 5 * 22, `+${rows.length - 5}`, { ...FONT, fontSize: '16px', color: css('ink-muted') }))
  }

  // --- weighing one message ----------------------------------------------------

  /** Drops each word on the pan it pushes towards; words Kata never saw fall away. */
  protected async weigh(s: Sorted, slow: boolean) {
    this.chips.removeAll(true)
    const k = s.kata!
    if (!slow) {
      await this.tilt(k.score)
      return
    }
    let tilt = 0
    for (const [i, p] of k.pushes.slice(0, 8).entries()) {
      const colour = p.w > 0 ? css('maroon') : p.w < 0 ? css('tosca-dark') : css('ink-muted')
      const chip = this.add.text(PIVOT.x, PIVOT.y + 20, p.word, { ...FONT, fontSize: '16px', color: css('white'), backgroundColor: colour, padding: { x: 4, y: 1 } }).setOrigin(0.5)
      this.chips.add(chip)
      const side: Label | null = p.w > 0 ? 'penting' : p.w < 0 ? 'santai' : null
      if (!side) {
        // An unknown word: Kata has no weight for it, so it drops off the scale.
        chip.setText(`${p.word} ?`)
        await this.tween({ targets: chip, y: PIVOT.y + 104, alpha: 0.35, duration: 260 })
        continue
      }
      const pan = this.pans[side]
      const stack = this.chips.list.filter((c) => c.getData('side') === side).length
      chip.setData('side', side)
      await this.tween({ targets: chip, x: pan.x + (i % 2 ? 14 : -14), y: pan.y + PAN_DROP - 8 - stack * 14, duration: 220, ease: 'Quad.in' })
      tilt += p.w
      this.positionPans(Phaser.Math.Clamp(tilt * 4, -14, 14))
    }
    await this.tilt(k.score)
  }

  // --- playback ----------------------------------------------------------------

  protected wait(ms: number) {
    return new Promise<void>((resolve) => this.time.delayedCall(ms / this.speed, resolve))
  }

  protected tween(config: Phaser.Types.Tweens.TweenBuilderConfig) {
    return new Promise<void>((resolve) => {
      this.tweens.add({ ...config, duration: (Number(config.duration) || 300) / this.speed, onComplete: () => resolve() })
    })
  }

  protected highlight(rect: Rect | null) {
    this.focusBox?.destroy()
    this.focusBox = undefined
    if (!rect) return
    const g = this.add.graphics().setDepth(20)
    g.lineStyle(4, hex('amber')).strokeRect(rect.x, rect.y, rect.w, rect.h)
    this.tweens.add({ targets: g, alpha: 0.25, duration: 450, yoyo: true, repeat: -1 })
    this.focusBox = g
  }

  protected async milestone(id: CardId, side: PopupSide, rect: Rect, run: number, vars?: Record<string, string | number>) {
    if (run !== this.runId || !this.milestones.isNew(id)) return
    this.highlight(rect)
    await this.milestones.show(id, side, vars)
    if (run === this.runId) this.highlight(null)
  }

  reset() {
    this.runId++
    this.highlight(null)
    if (!this.feed) return
    this.feed.removeAll(true)
    this.bubbles = []
    this.chips.removeAll(true)
    this.panel.removeAll(true)
    this.header.setText('')
    this.score.setText('')
    this.positionPans(0)
  }

  /** Sorts a batch of messages: slowly for the first few, then fast. */
  protected async sortBatch(sorted: Sorted[], res: ChatResult, slowFirst: number, run: number, onEach: (right: number) => void) {
    let right = 0
    for (const [i, s] of sorted.entries()) {
      if (run !== this.runId) return
      const slow = i < slowFirst
      this.speed = slow ? 1 : 3
      const bubble = await this.addBubble(s.text)
      if (s.kata) await this.weigh(s, slow)
      else if (s.rule) {
        this.showRules(res.rules, res.fallback, s.rule.by)
        if (slow) await this.wait(260)
      }
      // Kata decides when it's been trained; otherwise the rules do.
      const verdict = s.kata ? s.kata.label : (s.rule?.label ?? null)
      const ok = verdict === s.truth
      if (ok) right++
      this.tag(bubble, verdict, ok)
      onEach(right)
      await this.wait(slow ? 380 : 90)
    }
  }

  async play(rawEvents: unknown[], log: LogFn, milestones: Milestones = NO_MILESTONES): Promise<void> {
    await this.readyPromise
    const res = rawEvents[0] as ChatResult
    this.reset()
    const run = this.runId
    this.milestones = milestones
    const L = this.lang
    const hasKata = res.events.some((e) => e.kind === 'train')
    if (!hasKata && (res.rules.length || res.fallback)) this.showRules(res.rules, res.fallback, null)
    const examples: Record<Label, number> = { penting: 0, santai: 0 }
    let firstTestShown = false

    for (const e of res.events) {
      if (run !== this.runId) return
      this.speed = 1
      if (e.kind === 'noModel') {
        log(t(L, 'cLogNoModel'), 'bad')
        this.cameras.main.shake(140, 0.003)
      } else if (e.kind === 'collect') {
        this.header.setText(t(L, 'cSceneExamples'))
        log(t(L, 'cLogCollect', { n: e.got.length, label: labelText(L, e.label) }))
        if (e.got.length < e.asked) log(t(L, 'cLogCollectShort', { n: e.got.length, label: labelText(L, e.label) }), 'bad')
        this.speed = 4
        for (const m of e.got.slice(0, 6)) {
          if (run !== this.runId) return
          const b = await this.addBubble(m.text)
          this.tag(b, m.label, true)
        }
        examples[e.label] += e.got.length
        this.showExamples(examples)
        await this.wait(200)
      } else if (e.kind === 'train') {
        log(t(L, 'cLogTrain', { n: e.examples.penting + e.examples.santai }))
        this.header.setText(t(L, 'cSceneBrain'))
        this.tweens.add({ targets: this.robot, angle: { from: -8, to: 8 }, duration: 120, yoyo: true, repeat: 3 })
        this.showBrain(e.top)
        await this.wait(500)
        await this.milestone('trainingData', 'left', { x: PANEL.x - 4, y: PANEL.y - 4, w: PANEL.w + 8, h: PANEL.h + 8 }, run, {
          n: e.examples.penting + e.examples.santai,
        })
      } else if (e.kind === 'test') {
        this.header.setText('')
        const parts = () => [e.ruleScore !== null ? `${t(L, 'cSceneRules')} ${e.ruleScore}/${e.sorted.length}` : '', e.kataScore !== null ? `KATA ${e.kataScore}/${e.sorted.length}` : ''].filter(Boolean).join('  ')
        this.score.setText('')
        await this.sortBatch(e.sorted, res, firstTestShown ? 0 : 3, run, (n) => this.score.setText(`${n}/${e.sorted.length}`))
        firstTestShown = true
        this.score.setText(parts())
        if (e.ruleScore !== null) log(t(L, 'cLogTestRules', { n: e.ruleScore, total: e.sorted.length }))
        if (e.kataScore !== null) log(t(L, 'cLogTestKata', { n: e.kataScore, total: e.sorted.length }), 'good')
        if (e.kataScore !== null) {
          await this.milestone('ai', 'right', { x: PHONE.x - 2, y: PHONE.y - 2, w: PHONE.w + 8, h: PHONE.h + 8 }, run, { kata: e.kataScore, n: e.sorted.length })
        }
      } else if (e.kind === 'day') {
        this.header.setText(t(L, 'cSceneDay', { d: e.day }))
        await this.sortBatch(e.sorted, res, e.slang && e.day === 3 ? 2 : 0, run, (n) => this.score.setText(`${n}/${e.sorted.length}`))
        log(t(L, 'cLogDay', { d: e.day, n: e.kataScore ?? e.ruleScore ?? 0, total: e.sorted.length }), (e.kataScore ?? e.ruleScore ?? 0) >= 5 ? 'good' : 'bad')
        if (e.slang && e.sorted.some((s) => s.kata?.unsure)) {
          const unknown = [...new Set(e.sorted.flatMap((s) => s.kata?.pushes.filter((p) => p.w === 0).map((p) => p.word) ?? []))].slice(0, 4)
          if (unknown.length) log(t(L, 'cLogSlang', { words: unknown.join(', ') }), 'bad')
        }
        await this.wait(300)
      }
    }
    if (run !== this.runId) return
    if (res.daysWorked > 0 && hasKata) {
      log(t(L, 'cLogUnchanged'))
      await this.milestone('model', 'left', { x: PANEL.x - 4, y: PANEL.y - 4, w: PANEL.w + 8, h: PANEL.h + 8 }, run, { days: res.daysWorked })
    }
    const lt = res.lastTest
    if (lt && lt.rules !== null && lt.kata !== null && lt.rules >= lt.kata && lt.rules >= 18) log(t(L, 'cLogRulesWin'))
  }

  protected sparkleAt(x: number, y: number, tint: number) {
    const p = this.add.particles(x, y, 'spark', { speed: { min: 50, max: 150 }, lifespan: 500, scale: { start: 3, end: 0 }, tint, emitting: false })
    p.setDepth(11)
    p.explode(12)
    this.time.delayedCall(650, () => p.destroy())
  }

  celebrate() {
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 140, () =>
        this.sparkleAt(Phaser.Math.Between(280, 620), Phaser.Math.Between(40, 220), Phaser.Math.RND.pick([hex('tosca'), hex('amber'), hex('maroon')])),
      )
    }
    this.tweens.add({ targets: this.robot, angle: { from: -10, to: 10 }, duration: 140, yoyo: true, repeat: 5 })
  }
}
