import * as Phaser from 'phaser'
import { registerPixelTextures } from './pixels'
import { NO_MILESTONES, STAGE_HEIGHT, STAGE_WIDTH, type LogFn, type Milestones, type PopupSide, type SessionScene } from './types'
import { t, type CardId, type Lang } from '../i18n'
import { PUZZLE_DATA, depthOf, splitsOf, type Ekskul, type EkskulResult, type Feature, type Student, type Tree, type Walk } from '../levels/ekskul/model'
import { EKSKUL_ICON, EKSKUL_KEY, FEATURE_KEY, FEATURE_SHORT, NAME_KEY } from '../levels/ekskul/blocks'
import { FONTS, css, hex } from '../theme'

/** The run result, plus which puzzle it was for. */
export type EkskulEvent = EkskulResult & { puzzle: string; maxDepth: number | null }

const W = STAGE_WIDTH
const H = STAGE_HEIGHT
const INK = hex('ink')
const FONT = { fontFamily: FONTS.pixel, color: css('ink') }
const TABLE = { x: 10, y: 10, w: 258, h: H - 20 }
const TREE = { x: 280, y: 34, w: W - 290, bottom: 268 }
const CHIPS = { x: 280, y: 300, w: 86, h: 42, gap: 4 }

type Rect = { x: number; y: number; w: number; h: number }

/** Students with the same visible answers and the same club share a table row. */
interface Group {
  key: string
  answers: Student['answers']
  ekskul: Ekskul
  members: Student[]
  y: number
}

interface Placed {
  node: Tree | null
  x: number
  y: number
  yes?: Placed
  no?: Placed
}

/**
 * Session 4: the survey table on the left (one row per kind of answer,
 * with how many students gave it), the suggestion tree on the right, and
 * the new students under it. Each walk lights its path through the tree.
 */
export class EkskulScene extends Phaser.Scene implements SessionScene {
  private lang: Lang = 'id'
  private table!: Phaser.GameObjects.Container
  private treeLayer!: Phaser.GameObjects.Container
  private pathLayer!: Phaser.GameObjects.Container
  private chips!: Phaser.GameObjects.Container
  private idle?: Phaser.GameObjects.Text
  private tag!: Phaser.GameObjects.Text
  private groups: Group[] = []
  private placed: Placed | null = null
  private nodes = new Map<string, Placed>()
  private focusBox?: Phaser.GameObjects.Graphics
  private milestones: Milestones = NO_MILESTONES
  private runId = 0
  private speed = 1
  private playing = false
  private lastPreview: { tree: Tree | null; puzzle: string } | null = null
  readyPromise: Promise<void>
  private resolveReady!: () => void

  constructor() {
    super('ekskul')
    this.readyPromise = new Promise((r) => (this.resolveReady = r))
  }

  create() {
    registerPixelTextures(this)
    this.cameras.main.setBackgroundColor(css('cream'))
    const g = this.add.graphics()
    g.fillStyle(INK).fillRect(TABLE.x + 3, TABLE.y + 3, TABLE.w, TABLE.h)
    g.fillStyle(hex('white')).fillRect(TABLE.x, TABLE.y, TABLE.w, TABLE.h)
    g.lineStyle(2, INK).strokeRect(TABLE.x, TABLE.y, TABLE.w, TABLE.h)
    this.table = this.add.container(0, 0)
    this.treeLayer = this.add.container(0, 0)
    this.pathLayer = this.add.container(0, 0).setDepth(3)
    this.chips = this.add.container(0, 0)
    this.tag = this.add.text(W - 12, 8, '', { ...FONT, fontSize: '14px', color: css('white'), backgroundColor: css('tosca-dark'), padding: { x: 5, y: 1 } }).setOrigin(1, 0).setVisible(false)
    this.idle = this.add.text(TREE.x + TREE.w / 2, (TREE.y + TREE.bottom) / 2, '', { ...FONT, fontSize: '18px', color: css('ink-muted'), align: 'center' }).setOrigin(0.5)
    this.resolveReady()
    this.setLang(this.lang)
  }

  setLang(lang: Lang) {
    this.lang = lang
    this.idle?.setText(t(lang, 'eSceneIdle'))
    if (this.table && this.lastPreview && !this.playing) this.preview(this.lastPreview)
  }

  /** Shows the stage's table and the hand-built tree while the player edits. */
  preview(data: unknown) {
    const d = data as { tree: Tree | null; puzzle: string } | null
    if (!d) return
    this.lastPreview = d
    if (!this.table || this.playing) return
    const pd = PUZZLE_DATA[d.puzzle] ?? PUZZLE_DATA.sandbox
    this.drawTable(pd.train, pd.features)
    this.drawChips(pd.test.map((s) => ({ student: s, walk: null })))
    this.drawTree(d.tree)
    this.idle?.setVisible(!d.tree)
    this.tag.setText('').setVisible(false)
  }

  // --- table -------------------------------------------------------------------

  private drawTable(train: Student[], features: Feature[]) {
    this.table.removeAll(true)
    const L = this.lang
    const byKey = new Map<string, Group>()
    for (const s of train) {
      const key = features.map((f) => (s.answers[f] ? 1 : 0)).join('') + s.ekskul
      if (!byKey.has(key)) byKey.set(key, { key, answers: s.answers, ekskul: s.ekskul, members: [], y: 0 })
      byKey.get(key)!.members.push(s)
    }
    this.groups = [...byKey.values()]
    // Narrower columns when there are more questions, so the result tag fits on the right.
    const colW = Math.min(34, 150 / features.length)
    const x0 = TABLE.x + 8
    const head = TABLE.y + 8
    this.table.add(this.add.text(x0, head, `${t(L, 'eSceneTable')} · ${train.length}`, { ...FONT, fontSize: '14px', color: css('maroon') }))
    features.forEach((f, i) => this.table.add(this.add.text(x0 + i * colW + colW / 2, head + 20, t(L, FEATURE_SHORT[f]), { ...FONT, fontSize: '12px' }).setOrigin(0.5, 0)))
    const rowH = Math.min(26, (TABLE.h - 50) / Math.max(1, this.groups.length))
    const font = rowH >= 22 ? '16px' : '13px'
    this.groups.forEach((gr, r) => {
      const y = head + 40 + r * rowH
      gr.y = y + rowH / 2
      if (r % 2) this.table.add(this.add.rectangle(TABLE.x + 2, y, TABLE.w - 4, rowH, hex('parchment')).setOrigin(0, 0))
      features.forEach((f, i) => this.table.add(this.add.text(x0 + i * colW + colW / 2, gr.y, gr.answers[f] ? '✓' : '·', { ...FONT, fontSize: font, color: css(gr.answers[f] ? 'tosca-dark' : 'ink-muted') }).setOrigin(0.5)))
      const xe = x0 + features.length * colW + 4
      this.table.add(this.add.text(xe, gr.y, `${EKSKUL_ICON[gr.ekskul]}${gr.members.length > 1 ? ` ×${gr.members.length}` : ''}`, { ...FONT, fontSize: font }).setOrigin(0, 0.5))
    })
  }

  private markGroup(gr: Group, walks: Walk[]) {
    const right = walks.filter((w) => w.right).length
    const wrong = walks.length - right
    const text = wrong === 0 ? '✓' : right === 0 ? '✗' : `✓${right} ✗${wrong}`
    const got = walks[0]?.got
    const label = `${got ? EKSKUL_ICON[got] : '·'} ${text}`
    this.table.add(
      this.add
        .text(TABLE.x + TABLE.w - 8, gr.y, label, { ...FONT, fontSize: '13px', color: css('white'), backgroundColor: css(wrong === 0 ? 'tosca-dark' : 'maroon'), padding: { x: 3, y: 0 } })
        .setOrigin(1, 0.5),
    )
  }

  // --- new students --------------------------------------------------------------

  private chipPos(i: number) {
    return { x: CHIPS.x + (i % 4) * (CHIPS.w + CHIPS.gap), y: CHIPS.y + Math.floor(i / 4) * (CHIPS.h + CHIPS.gap) }
  }

  private drawChips(list: { student: Student; walk: Walk | null }[]) {
    this.chips.removeAll(true)
    if (!list.length) return
    this.chips.add(this.add.text(CHIPS.x, CHIPS.y - 20, t(this.lang, 'eSceneNew'), { ...FONT, fontSize: '14px', color: css('maroon') }))
    list.forEach((item, i) => this.drawChip(i, item.student, item.walk))
  }

  private drawChip(i: number, s: Student, w: Walk | null) {
    const { x, y } = this.chipPos(i)
    const bg = w ? (w.right ? hex('tosca-tint') : hex('maroon-tint')) : hex('white')
    this.chips.add(this.add.rectangle(x, y, CHIPS.w, CHIPS.h, bg).setOrigin(0, 0).setStrokeStyle(2, INK))
    this.chips.add(this.add.text(x + 5, y + 3, t(this.lang, NAME_KEY[s.id]), { ...FONT, fontSize: '14px' }))
    const want = `${t(this.lang, 'eLogWants', { want: EKSKUL_ICON[s.ekskul] })}`
    const got = w ? `${w.got ? EKSKUL_ICON[w.got] : '·'} ${w.right ? '✓' : '✗'}` : want
    this.chips.add(this.add.text(x + 5, y + 21, got, { ...FONT, fontSize: '14px', color: css(w && !w.right ? 'maroon' : 'ink') }))
  }

  // --- tree ----------------------------------------------------------------------

  private layout(tree: Tree | null): Placed {
    const slots: Placed[] = []
    const d = Math.max(1, depthOf(tree))
    const rowH = (TREE.bottom - TREE.y) / d
    const place = (node: Tree | null, depth: number): Placed => {
      if (!node || node.kind === 'leaf') {
        const p: Placed = { node, x: 0, y: TREE.y + depth * rowH }
        slots.push(p)
        return p
      }
      const yes = place(node.yes, depth + 1)
      const no = place(node.no, depth + 1)
      return { node, x: 0, y: TREE.y + depth * rowH, yes, no }
    }
    const root = place(tree, 0)
    const step = slots.length > 1 ? (TREE.w - 40) / (slots.length - 1) : 0
    slots.forEach((s, i) => (s.x = slots.length > 1 ? TREE.x + 20 + i * step : TREE.x + TREE.w / 2))
    const centre = (p: Placed): number => {
      if (p.yes && p.no) p.x = (centre(p.yes) + centre(p.no)) / 2
      return p.x
    }
    centre(root)
    return root
  }

  private drawTree(tree: Tree | null) {
    this.treeLayer.removeAll(true)
    this.pathLayer.removeAll(true)
    this.nodes.clear()
    this.placed = tree ? this.layout(tree) : null
    if (!this.placed) return
    const g = this.add.graphics()
    this.treeLayer.add(g)
    const visit = (p: Placed) => {
      const id = p.node?.id
      if (id) this.nodes.set(id, p)
      if (p.yes && p.no) {
        for (const [child, yes] of [
          [p.yes, true],
          [p.no, false],
        ] as const) {
          g.lineStyle(3, INK).lineBetween(p.x, p.y, child.x, child.y)
          const mx = (p.x + child.x) / 2
          const my = (p.y + child.y) / 2
          this.treeLayer.add(this.add.text(mx, my, t(this.lang, yes ? 'eYes' : 'eNo'), { ...FONT, fontSize: '12px', backgroundColor: css('cream'), color: css(yes ? 'tosca-dark' : 'maroon') }).setOrigin(0.5))
          visit(child)
        }
      }
    }
    visit(this.placed)
    // Boxes go on top of the lines.
    const box = (p: Placed) => {
      const n = p.node
      if (!n) {
        this.treeLayer.add(this.add.text(p.x, p.y, '?', { ...FONT, fontSize: '16px', color: css('maroon'), backgroundColor: css('white'), padding: { x: 6, y: 2 } }).setOrigin(0.5))
      } else if (n.kind === 'leaf') {
        this.treeLayer.add(this.add.text(p.x, p.y, EKSKUL_ICON[n.ekskul], { ...FONT, fontSize: '20px', backgroundColor: css('amber-tint'), padding: { x: 4, y: 2 } }).setOrigin(0.5))
      } else {
        this.treeLayer.add(this.add.text(p.x, p.y, `${t(this.lang, FEATURE_SHORT[n.q])}?`, { ...FONT, fontSize: '14px', color: css('white'), backgroundColor: css('tosca-dark'), padding: { x: 4, y: 2 } }).setOrigin(0.5))
      }
      if (p.yes) box(p.yes)
      if (p.no) box(p.no)
    }
    box(this.placed)
  }

  /** Lights one walk's path through the tree. */
  private drawPath(w: Walk, colour: number) {
    this.pathLayer.removeAll(true)
    if (!this.placed) return
    const g = this.add.graphics()
    g.lineStyle(6, colour, 0.8)
    let p: Placed | undefined = this.placed
    for (const step of w.path) {
      const next: Placed | undefined = step.yes ? p?.yes : p?.no
      if (!p || !next) break
      g.lineBetween(p.x, p.y, next.x, next.y)
      p = next
    }
    this.pathLayer.add(g)
  }

  // --- helpers -------------------------------------------------------------------

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
    if (!this.table) return
    this.pathLayer.removeAll(true)
    this.tag.setText('').setVisible(false)
  }

  private pathText(w: Walk) {
    const L = this.lang
    const steps = w.path.map((s) => t(L, 'eLogExplainStep', { q: t(L, FEATURE_KEY[s.q]), ans: t(L, s.yes ? 'eYes' : 'eNo') }))
    return [...steps, w.got ? t(L, EKSKUL_KEY[w.got]) : t(L, 'eLogEmpty')].join(' → ')
  }

  async play(rawEvents: unknown[], log: LogFn, milestones: Milestones = NO_MILESTONES): Promise<void> {
    await this.readyPromise
    const res = rawEvents[0] as EkskulEvent
    this.reset()
    const run = this.runId
    this.milestones = milestones
    this.playing = true
    try {
      await this.playRun(res, run, log)
    } finally {
      if (run === this.runId) this.playing = false
    }
  }

  private async playRun(res: EkskulEvent, run: number, log: LogFn) {
    const L = this.lang
    const data = PUZZLE_DATA[res.puzzle] ?? PUZZLE_DATA.sandbox
    this.drawTable(data.train, data.features)
    this.drawChips(data.test.map((s) => ({ student: s, walk: null })))
    this.drawTree(res.tree)
    const treeRect: Rect = { x: TREE.x - 6, y: TREE.y - 22, w: TREE.w + 12, h: TREE.bottom - TREE.y + 44 }
    if (!res.tree) return
    if (res.learned) {
      this.tag.setText(`🌱 ${t(L, 'eSceneLearned')}`).setVisible(true)
      const root = res.choices[0]
      if (root) {
        log(t(L, 'eLogLearn', { q: t(L, FEATURE_KEY[root.chosen]), pct: Math.round(root.scores.find((s) => s.q === root.chosen)!.tidy * 100) }))
        await this.milestone('treeLearning', 'right', treeRect, run, { k: root.scores.length, q: t(L, FEATURE_KEY[root.chosen]) })
      }
      log(t(L, 'eLogLearnDone', { n: splitsOf(res.tree), d: depthOf(res.tree) }))
    }
    // The table: fast, one row at a time.
    this.speed = this.groups.length > 8 ? 4 : 1.4
    for (const gr of this.groups) {
      if (run !== this.runId) return
      const walks = res.train.filter((w) => gr.members.includes(w.student))
      if (walks[0]) this.drawPath(walks[0], walks.every((w) => w.right) ? hex('tosca') : hex('maroon'))
      this.markGroup(gr, walks)
      await this.wait(260)
    }
    if (run !== this.runId) return
    log(t(L, 'eLogTrain', { n: res.trainRight, total: res.train.length }), res.trainRight === res.train.length ? 'good' : 'bad')
    // The new students: slower, with a line each.
    this.speed = 1
    for (const [i, w] of res.test.entries()) {
      if (run !== this.runId) return
      this.drawPath(w, hex('amber'))
      await this.wait(i === 0 ? 600 : 320)
      this.drawChip(i, w.student, w)
      const name = t(L, NAME_KEY[w.student.id])
      const got = w.got ? `${EKSKUL_ICON[w.got]} ${t(L, EKSKUL_KEY[w.got])}` : t(L, 'eLogEmpty')
      const mark = w.right ? '✓' : `✗ ${t(L, 'eLogWants', { want: t(L, EKSKUL_KEY[w.student.ekskul]) })}`
      log(t(L, 'eLogStudent', { name, got, mark }), w.right ? 'good' : 'bad')
    }
    if (run !== this.runId) return
    this.pathLayer.removeAll(true)
    if (res.test.length) log(t(L, 'eLogTest', { n: res.testRight, total: res.test.length }), res.testRight === res.test.length ? 'good' : 'bad')

    // Reasons, for each student the program asked about.
    for (const w of res.explained) {
      if (run !== this.runId) return
      this.drawPath(w, hex('gold'))
      const name = t(L, NAME_KEY[w.student.id])
      const got = w.got ? t(L, EKSKUL_KEY[w.got]) : t(L, 'eLogEmpty')
      log(t(L, 'eLogExplain', { name, got, path: this.pathText(w) }))
      await this.wait(700)
      await this.milestone('explainability', 'right', treeRect, run, { got, path: this.pathText(w) })
    }

    // Notebook moments for the stage's idea.
    const chipsRect: Rect = { x: CHIPS.x - 6, y: CHIPS.y - 24, w: 4 * (CHIPS.w + CHIPS.gap) + 8, h: 2 * (CHIPS.h + CHIPS.gap) + 26 }
    if (res.puzzle === 'p4' && res.learned && res.choices[0]?.chosen === 'classA') {
      await this.milestone('historicalBias', 'right', chipsRect, run, { n: res.testRight, total: res.test.length })
    }
    if (res.puzzle === 'p5' && res.learned && res.maxDepth !== null && res.testRight === res.test.length) {
      await this.milestone('pruning', 'right', chipsRect, run, { a: res.trainRight, b: res.train.length, n: res.testRight, total: res.test.length })
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
        this.sparkleAt(Phaser.Math.Between(290, 620), Phaser.Math.Between(40, 260), Phaser.Math.RND.pick([hex('tosca'), hex('amber'), hex('maroon')])),
      )
    }
  }
}
