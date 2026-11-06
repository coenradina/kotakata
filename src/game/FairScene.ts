import { ChatScene } from './ChatScene'
import { NO_MILESTONES, STAGE_WIDTH, type LogFn, type Milestones } from './types'
import { t, type Key } from '../i18n'
import type { ChatResult, Sorted } from '../levels/chat/model'
import { SENDERS, type FairResult, type Judged, type Sender } from '../levels/fair/model'
import { setName, sourceName } from '../levels/fair/blocks'
import { FONTS, css, hex } from '../theme'

const FONT = { fontFamily: FONTS.pixel, color: css('ink') }
const PANEL = { x: 270, y: 236, w: STAGE_WIDTH - 284 }
const SENDER_KEY: Record<Sender, Key> = { dinda: 'senderDinda', raka: 'senderRaka', ayu: 'senderAyu', bimo: 'senderBimo' }
const NO_RULES = { rules: [], fallback: null } as unknown as ChatResult
const asSorted = (js: Judged[]): Sorted[] => js.map((j) => ({ text: j.text, truth: j.truth, kata: j.kata }))
const pct = (n: number) => Math.round(n * 100)

/**
 * Session 3 reuses Session 1's chat and balance, and adds two panels: the
 * data check (where the examples came from, which words Kata knows) and
 * the score for each person.
 */
export class FairScene extends ChatScene {
  constructor() {
    super('fair')
  }

  private showInspect(e: Extract<FairResult['events'][number], { kind: 'inspect' }>) {
    this.clearPanel('fSceneInspect')
    const L = this.lang
    const sources = Object.entries(e.bySource).map(([s, n]) => `${sourceName(L, s as never)} ${n}`).join(' · ')
    this.panel.add(this.add.text(10, 30, sources || '-', { ...FONT, fontSize: '16px', wordWrap: { width: PANEL.w - 20 } }))
    // How much of the target chat's words Kata knows
    const barW = PANEL.w - 20
    this.panel.add(this.add.rectangle(10, 66, barW, 14, hex('white')).setOrigin(0, 0.5).setStrokeStyle(2, hex('ink')))
    this.panel.add(this.add.rectangle(11, 66, (barW - 2) * e.knownShare, 12, hex('tosca')).setOrigin(0, 0.5))
    this.panel.add(this.add.text(10, 76, `${pct(e.knownShare)}% ${t(L, 'fSceneKnown')} · ${setName(L, e.on)}`, { ...FONT, fontSize: '16px' }))
    e.unknown.slice(0, 6).forEach((w, i) => {
      this.panel.add(
        this.add.text(10 + (i % 3) * 112, 98 + Math.floor(i / 3) * 22, `${w} ?`, { ...FONT, fontSize: '16px', color: css('white'), backgroundColor: css('ink-muted'), padding: { x: 4, y: 1 } }),
      )
    })
  }

  private showSenders(scores: Record<Sender, { right: number; total: number }>) {
    this.clearPanel('fSceneSenders')
    SENDERS.forEach((s, i) => {
      const { right, total } = scores[s]
      const ok = total === 0 || right / total >= 5 / 6 - 1e-9
      const y = 34 + i * 26
      this.panel.add(this.add.text(10, y, t(this.lang, SENDER_KEY[s]), { ...FONT, fontSize: '18px', color: ok ? css('ink') : css('maroon') }))
      const x = 130
      const w = PANEL.w - x - 60
      this.panel.add(this.add.rectangle(x, y + 9, w, 12, hex('white')).setOrigin(0, 0.5).setStrokeStyle(1, hex('ink')))
      this.panel.add(this.add.rectangle(x + 1, y + 9, (w - 2) * (total ? right / total : 0), 10, ok ? hex('tosca') : hex('maroon')).setOrigin(0, 0.5))
      this.panel.add(this.add.text(x + w + 8, y, `${right}/${total}${ok ? '' : ' ✗'}`, { ...FONT, fontSize: '18px', color: ok ? css('ink') : css('maroon') }))
    })
  }

  private showCount(titleKey: Key, n: number) {
    this.clearPanel(titleKey)
    this.panel.add(this.add.text(10, 34, String(n), { ...FONT, fontSize: '48px' }))
  }

  async play(rawEvents: unknown[], log: LogFn, milestones: Milestones = NO_MILESTONES): Promise<void> {
    await this.readyPromise
    const res = rawEvents[0] as FairResult
    this.reset()
    const run = this.runId
    this.milestones = milestones
    const L = this.lang
    const panelRect = { x: PANEL.x - 4, y: PANEL.y - 4, w: PANEL.w + 8, h: 160 }
    const examples = { penting: 0, santai: 0 }
    let firstTest = true

    for (const e of res.events) {
      if (run !== this.runId) return
      this.speed = 1
      if (e.kind === 'noModel') {
        log(t(L, 'fFailNoTrain'), 'bad')
        this.cameras.main.shake(140, 0.003)
      } else if (e.kind === 'emptyHoldout') {
        log(t(L, 'fLogEmptyHoldout'), 'bad')
      } else if (e.kind === 'collect') {
        this.header.setText(t(L, 'cSceneExamples'))
        const label = t(L, e.label === 'penting' ? 'cPenting' : 'cSantai')
        log(t(L, 'fLogCollect', { n: e.got.length, label, src: sourceName(L, e.source) }))
        if (e.got.length < e.asked) log(t(L, 'fLogCollectShort', { n: e.got.length, label, src: sourceName(L, e.source) }), 'bad')
        this.speed = 4
        for (const m of e.got.slice(0, 5)) {
          if (run !== this.runId) return
          const b = await this.addBubble(m.text)
          this.tag(b, m.label, true)
        }
        examples[e.label] += e.got.length
        this.showExamples(examples)
        await this.wait(200)
      } else if (e.kind === 'checkLabels') {
        this.showCount('fSceneFixed', e.fixed)
        log(t(L, 'fLogCheck', { of: e.of, fixed: e.fixed }), 'good')
        await this.wait(500)
        if (e.fixed > 0) await this.milestone('dataQuality', 'left', panelRect, run, { fixed: e.fixed })
      } else if (e.kind === 'holdout') {
        this.showCount('fSceneSetAside', e.count)
        log(t(L, 'fLogHoldout', { n: e.count }))
        await this.wait(400)
      } else if (e.kind === 'train') {
        log(t(L, 'cLogTrain', { n: e.examples.penting + e.examples.santai }))
        this.header.setText(t(L, 'cSceneBrain'))
        this.tweens.add({ targets: this.robot, angle: { from: -8, to: 8 }, duration: 120, yoyo: true, repeat: 3 })
        this.showBrain(e.top)
        await this.wait(500)
      } else if (e.kind === 'test') {
        this.header.setText(setName(L, e.on).toUpperCase())
        await this.sortBatch(asSorted(e.judged), NO_RULES, firstTest ? 3 : 0, run, (n) => this.score.setText(`${n}/${e.judged.length}`))
        firstTest = false
        log(t(L, 'fLogTest', { set: setName(L, e.on), n: e.right, total: e.judged.length }), e.right / e.judged.length >= 0.85 ? 'good' : 'bad')
        const nw = res.nextWeek
        if (e.on === 'train' && nw) {
          log(t(L, 'fLogNextWeek', { n: nw.right, total: nw.size }), nw.right < nw.size ? 'bad' : 'info')
          if (nw.right < nw.size) await this.milestone('overfitting', 'right', panelRect, run, { train: pct(e.right / e.judged.length), next: pct(nw.right / nw.size) })
        }
        if (e.on === 'holdout') await this.milestone('testData', 'right', panelRect, run, { n: e.judged.length })
      } else if (e.kind === 'inspect') {
        this.showInspect(e)
        log(t(L, 'fLogInspectSources', { list: Object.entries(e.bySource).map(([s, n]) => `${sourceName(L, s as never)} ${n}`).join(', ') || '-' }))
        log(t(L, 'fLogInspect', { pct: pct(e.knownShare), set: setName(L, e.on), words: e.unknown.slice(0, 5).join(', ') || '-' }), e.knownShare < 0.85 ? 'bad' : 'info')
        if (e.suspicious.length) log(t(L, 'fLogSuspicious', { text: e.suspicious[0] }), 'bad')
        await this.wait(600)
        if (e.on === '8c' && e.knownShare < 0.9) await this.milestone('bias', 'left', panelRect, run, { pct: pct(e.knownShare) })
      } else if (e.kind === 'bySender') {
        this.header.setText(t(L, 'fSceneSenders'))
        await this.sortBatch(asSorted(e.judged), NO_RULES, 0, run, (n) => this.score.setText(`${n}/${e.judged.length}`))
        this.showSenders(e.scores)
        for (const s of SENDERS) {
          const sc = e.scores[s]
          const ok = sc.right / sc.total >= 5 / 6 - 1e-9
          log(t(L, 'fLogSender', { name: t(L, SENDER_KEY[s]), n: sc.right, total: sc.total }), ok ? 'info' : 'bad')
        }
        log(t(L, 'fLogOverall', { pct: pct(e.overall) }))
        await this.wait(400)
        await this.milestone('fairness', 'left', panelRect, run, { pct: pct(e.overall), bimo: e.scores.bimo.right })
      }
    }
  }
}
