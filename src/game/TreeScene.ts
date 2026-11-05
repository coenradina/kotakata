import * as Phaser from 'phaser'
import { registerPixelTextures } from './pixels'
import { NO_MILESTONES, STAGE_HEIGHT, STAGE_WIDTH, type LevelScene, type LogFn, type Milestones, type PopupSide } from './types'
import { t, type CardId, type Lang } from '../i18n'
import { depth, type Creature, type Critter, type Tree, type TreeEvent, type Walk } from '../levels/tree/model'
import { questionText } from '../levels/tree/blocks'

/** Events the tree scene plays: the tree to draw, then the level's own events. */
export type TreeSceneEvent = { kind: 'tree'; tree: Tree | null } | TreeEvent

const W = STAGE_WIDTH
const H = STAGE_HEIGHT
const INK = 0x0f172a
const PATH = 0xd6b98c
const GATE = { x: 46, y: 46 }
const PEN_Y = 326
const TOP_Y = 92
const FONT = { fontFamily: 'VT323, monospace', color: '#0F172A' }
const PEN_ICON: Record<Critter, string> = { bird: 'bird-brown', bee: 'bee', frog: 'frog-green' }

interface Placed {
  node: Tree | null
  x: number
  y: number
  /** For splits: where the yes and no children sit. */
  yes?: Placed
  no?: Placed
}

function textureFor(c: Creature) {
  if (c.kind === 'bee') return 'bee'
  return `${c.kind}-${c.kind === 'frog' ? (c.colour === 'brown' ? 'brown' : 'green') : c.colour === 'yellow' ? 'yellow' : 'brown'}`
}

/**
 * The garden: the player's tree drawn as paths and signposts, with pens at
 * the ends. Critters walk it one by one.
 */
export class TreeScene extends Phaser.Scene implements LevelScene {
  private lang: Lang = 'id'
  private layer!: Phaser.GameObjects.Container
  private critters!: Phaser.GameObjects.Container
  private status!: Phaser.GameObjects.Text
  private hintText!: Phaser.GameObjects.Text
  private placed: Placed | null = null
  private penCounts = new Map<string, { right: number; wrong: number; label: Phaser.GameObjects.Text }>()
  private focusBox?: Phaser.GameObjects.Graphics
  private milestones: Milestones = NO_MILESTONES
  private runId = 0
  private speed = 1
  private lastTree: Tree | null | undefined
  readyPromise: Promise<void>
  private resolveReady!: () => void

  constructor() {
    super('tree')
    this.readyPromise = new Promise((r) => (this.resolveReady = r))
  }

  create() {
    registerPixelTextures(this)
    this.cameras.main.setBackgroundColor('#FDF6E3')
    const g = this.add.graphics()
    g.lineStyle(1, INK, 0.05)
    for (let x = 0; x <= W; x += 24) g.lineBetween(x, 0, x, H)
    for (let y = 0; y <= H; y += 24) g.lineBetween(0, y, W, y)
    // Grass along the bottom, and the gate where critters arrive
    g.fillStyle(0xd9f99d, 0.6).fillRect(0, PEN_Y + 10, W, H - PEN_Y)
    g.lineStyle(3, INK).lineBetween(0, PEN_Y + 10, W, PEN_Y + 10)
    g.fillStyle(0x92400e).fillRect(GATE.x - 26, GATE.y - 22, 8, 40).fillRect(GATE.x + 18, GATE.y - 22, 8, 40)
    g.lineStyle(3, INK).strokeRect(GATE.x - 26, GATE.y - 22, 8, 40).strokeRect(GATE.x + 18, GATE.y - 22, 8, 40)
    g.fillStyle(0x92400e).fillRect(GATE.x - 26, GATE.y - 26, 52, 8)
    g.lineStyle(3, INK).strokeRect(GATE.x - 26, GATE.y - 26, 52, 8)

    this.layer = this.add.container(0, 0)
    this.critters = this.add.container(0, 0).setDepth(10)
    this.status = this.add.text(W - 16, 14, '', { ...FONT, fontSize: '24px' }).setOrigin(1, 0).setDepth(12)
    this.hintText = this.add.text(W / 2, H / 2 - 20, '', { ...FONT, fontSize: '22px', align: 'center' }).setOrigin(0.5).setAlpha(0.6)
    this.resolveReady()
    if (this.lastTree !== undefined) this.drawTree(this.lastTree)
    else this.setLang(this.lang)
  }

  setLang(lang: Lang) {
    this.lang = lang
    if (!this.layer) return
    if (this.lastTree !== undefined) this.drawTree(this.lastTree)
    else this.hintText.setText(lang === 'id' ? 'Susun pohonmu di sebelah kiri.\nPratinjaunya muncul di sini.' : 'Build your tree on the left.\nA preview shows up here.')
  }

  /** Draws the tree as the player edits it, without running anything. */
  preview(data: unknown) {
    const tree = data as Tree | null
    this.lastTree = tree
    if (!this.layer || this.sys.isPaused()) return
    this.drawTree(tree)
  }

  // --- layout ----------------------------------------------------------------

  /** Leaves (and empty branches) get evenly spaced slots along the bottom. */
  private layout(tree: Tree | null): Placed {
    const slots: Placed[] = []
    const maxDepth = Math.max(1, depth(tree))
    const rowH = (PEN_Y - 70 - TOP_Y) / maxDepth
    const place = (node: Tree | null, d: number): Placed => {
      if (!node || node.kind === 'leaf') {
        const p: Placed = { node, x: 0, y: PEN_Y }
        slots.push(p)
        return p
      }
      const yes = place(node.yes, d + 1)
      const no = place(node.no, d + 1)
      return { node, x: (yes.x + no.x) / 2, y: TOP_Y + d * rowH, yes, no }
    }
    const root = place(tree, 0)
    // Spread the slots, then centre each split over its children.
    const margin = 70
    const step = slots.length > 1 ? (W - margin * 2) / (slots.length - 1) : 0
    slots.forEach((s, i) => (s.x = slots.length > 1 ? margin + i * step : W / 2))
    const centre = (p: Placed): number => {
      if (!p.yes || !p.no) return p.x
      p.x = (centre(p.yes) + centre(p.no)) / 2
      return p.x
    }
    centre(root)
    return root
  }

  private drawTree(tree: Tree | null) {
    this.layer.removeAll(true)
    this.penCounts.clear()
    this.hintText.setText(tree ? '' : this.lang === 'id' ? 'Belum ada pohon.\nSeret blok pertanyaan ke "saat ▶ ditekan".' : 'No tree yet.\nDrag a question under "when ▶ clicked".')
    if (!tree) {
      this.placed = null
      return
    }
    this.placed = this.layout(tree)
    const g = this.add.graphics()
    this.layer.add(g)

    // Path from the gate to the first sign
    const drawPath = (x1: number, y1: number, x2: number, y2: number, dashed = false) => {
      if (dashed) {
        g.lineStyle(5, INK, 0.45)
        const len = Math.hypot(x2 - x1, y2 - y1)
        for (let d = 0; d < len; d += 16) {
          const a = d / len
          const b = Math.min(d + 8, len) / len
          g.lineBetween(x1 + (x2 - x1) * a, y1 + (y2 - y1) * a, x1 + (x2 - x1) * b, y1 + (y2 - y1) * b)
        }
        return
      }
      g.lineStyle(12, INK).lineBetween(x1, y1, x2, y2)
      g.lineStyle(8, PATH).lineBetween(x1, y1, x2, y2)
    }
    drawPath(GATE.x, GATE.y + 18, this.placed.x, this.placed.y)

    const visit = (p: Placed) => {
      if (p.yes && p.no) {
        for (const [child, yes] of [
          [p.yes, true],
          [p.no, false],
        ] as const) {
          drawPath(p.x, p.y, child.x, child.y - (child.node ? 22 : 10), !child.node)
          const lx = p.x + (child.x - p.x) * 0.28
          const ly = p.y + (child.y - p.y) * 0.28
          const label = this.add
            .text(lx + (yes ? -10 : 10), ly, yes ? (this.lang === 'id' ? 'ya' : 'yes') : this.lang === 'id' ? 'tidak' : 'no', {
              ...FONT,
              fontSize: '18px',
              color: yes ? '#0D9488' : '#881337',
              backgroundColor: '#FDF6E3',
            })
            .setOrigin(yes ? 1 : 0, 0.5)
          this.layer.add(label)
          visit(child)
        }
      }
    }
    visit(this.placed)

    // Signs and pens on top of the paths
    const drawNodes = (p: Placed) => {
      if (p.node?.kind === 'split') {
        const label = this.add.text(p.x, p.y, `${questionText(this.lang, p.node.q)}?`, { ...FONT, fontSize: '20px', color: '#FDF6E3' }).setOrigin(0.5)
        const bw = label.width + 18
        const sign = this.add.graphics()
        sign.fillStyle(INK).fillRect(p.x - 3, p.y + 10, 6, 18)
        sign.fillStyle(INK).fillRect(p.x - bw / 2 + 3, p.y - 12 + 3, bw, 24)
        sign.fillStyle(0x92400e).fillRect(p.x - bw / 2, p.y - 12, bw, 24)
        sign.lineStyle(2, INK).strokeRect(p.x - bw / 2, p.y - 12, bw, 24)
        this.layer.add([sign, label])
        drawNodes(p.yes!)
        drawNodes(p.no!)
      } else if (p.node?.kind === 'leaf') {
        const pen = this.add.image(p.x, p.y, 'pen').setScale(3)
        const icon = this.add.image(p.x, p.y - 26, PEN_ICON[p.node.pen]).setScale(2)
        const count = this.add.text(p.x, p.y + 24, '', { ...FONT, fontSize: '18px' }).setOrigin(0.5, 0)
        this.layer.add([pen, icon, count])
        this.penCounts.set(p.node.id, { right: 0, wrong: 0, label: count })
      } else {
        const hole = this.add.text(p.x, p.y - 6, '?', { ...FONT, fontSize: '34px', color: '#881337' }).setOrigin(0.5)
        this.layer.add(hole)
      }
    }
    drawNodes(this.placed)
  }

  /** Where a critter that took this path ends up, including empty branches. */
  private endOf(walk: Walk): Placed | null {
    let p = this.placed
    for (const step of walk.path) {
      if (!p || !p.yes || !p.no) return p
      p = step.yes ? p.yes : p.no
    }
    return p
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

  private sparkle(x: number, y: number, tint: number) {
    const p = this.add.particles(x, y, 'spark', { speed: { min: 50, max: 140 }, lifespan: 450, scale: { start: 3, end: 0 }, tint, emitting: false })
    p.setDepth(11)
    p.explode(10)
    this.time.delayedCall(600, () => p.destroy())
  }

  private highlight(rect: { x: number; y: number; w: number; h: number } | null) {
    this.focusBox?.destroy()
    this.focusBox = undefined
    if (!rect) return
    const g = this.add.graphics().setDepth(20)
    g.lineStyle(4, 0xe5a93c).strokeRect(rect.x, rect.y, rect.w, rect.h)
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
    this.critters?.removeAll(true)
    this.status?.setText('')
    if (this.layer && this.lastTree !== undefined) this.drawTree(this.lastTree)
  }

  // --- playback ----------------------------------------------------------------

  async play(rawEvents: unknown[], log: LogFn, milestones: Milestones = NO_MILESTONES): Promise<void> {
    await this.readyPromise
    const events = rawEvents as TreeSceneEvent[]
    this.reset()
    const id = this.runId
    this.milestones = milestones

    for (const e of events) {
      if (id !== this.runId) return
      if (e.kind === 'tree') {
        this.lastTree = e.tree
        this.drawTree(e.tree)
      } else if (e.kind === 'warn') {
        log(t(this.lang, e.code === 'one-pen' ? 'warnOnePen' : 'warnEmptyBranch'), 'bad')
        this.cameras.main.shake(180, 0.003)
        await this.wait(400)
      } else {
        await this.playSort(e.walks, log, id)
        if (id !== this.runId) return
        const correct = e.walks.filter((w) => w.correct).length
        const lost = e.walks.filter((w) => w.pen === null).length
        this.status.setText(`${correct}/${e.walks.length} ✓`)
        if (lost) log(t(this.lang, 'logLost', { n: lost }), 'bad')
        log(t(this.lang, 'logSorted', { correct, total: e.walks.length }), correct === e.walks.length ? 'good' : 'bad')
        await this.milestone('prediction', 'left', { x: W - 150, y: 6, w: 144, h: 40 }, id, { correct, total: e.walks.length })
      }
    }
  }

  private async playSort(walks: Walk[], _log: LogFn, id: number) {
    let first = true
    let firstPen = true
    for (const [i, w] of walks.entries()) {
      if (id !== this.runId) return
      // The first two walk slowly so the player can follow; the rest hurry.
      this.speed = i < 2 ? 1 : 2.6
      this.status.setText(`${i + 1}/${walks.length}`)
      const big = w.creature.big
      const sprite = this.add.image(GATE.x, GATE.y, textureFor(w.creature)).setScale(big ? 3.4 : 2.4)
      this.critters.add(sprite)
      await this.tween({ targets: sprite, scale: { from: 0, to: sprite.scale }, duration: 200, ease: 'Back.out' })

      let at: Placed | null = this.placed
      if (at) await this.tween({ targets: sprite, x: at.x, y: at.y + 44, duration: 520, ease: 'Sine.inOut' })

      for (const step of w.path) {
        if (id !== this.runId || !at || !at.yes || !at.no) break
        if (first) {
          const signRect = { x: at.x - 70, y: at.y - 24, w: 140, h: 48 }
          const side: PopupSide = at.x > W / 2 ? 'left' : 'right'
          await this.milestone('feature', side, signRect, id)
          await this.milestone('split', side, signRect, id)
          first = false
        }
        // The critter's answer pops up over its head
        // Beside the critter, so it doesn't cover the question on the sign
        const bubble = this.add
          .text(sprite.x + 26, sprite.y, step.yes ? (this.lang === 'id' ? '✓ ya' : '✓ yes') : this.lang === 'id' ? '✗ tidak' : '✗ no', {
            ...FONT,
            fontSize: '18px',
            color: '#FDF6E3',
            backgroundColor: step.yes ? '#0D9488' : '#881337',
            padding: { x: 4, y: 0 },
          })
          .setOrigin(0, 0.5)
          .setDepth(12)
        this.critters.add(bubble)
        await this.wait(260)
        bubble.destroy()
        const next: Placed = step.yes ? at.yes : at.no
        const targetY = next.node?.kind === 'split' ? next.y + 44 : next.y - 8
        await this.tween({ targets: sprite, x: next.x, y: targetY, duration: 480, ease: 'Sine.inOut' })
        at = next
      }

      const end = this.endOf(w)
      if (w.pen && end?.node?.kind === 'leaf') {
        // Hop into the pen, and stay there small
        const slot = this.penCounts.get(end.node.id)
        const n = slot ? slot.right + slot.wrong : 0
        await this.tween({ targets: sprite, y: end.y - 40, duration: 140, ease: 'Quad.out' })
        await this.tween({ targets: sprite, x: end.x - 22 + (n % 4) * 15, y: end.y - 2 + Math.floor(n / 4) * 6, scale: 1.5, duration: 200, ease: 'Quad.in' })
        if (w.correct) {
          this.sparkle(sprite.x, sprite.y, 0x22c55e)
          if (slot) slot.right++
        } else {
          this.sparkle(sprite.x, sprite.y, 0xef4444)
          sprite.setTint(0xfca5a5)
          this.cameras.main.shake(100, 0.003)
          if (slot) slot.wrong++
        }
        if (slot) slot.label.setText(`✓${slot.right}${slot.wrong ? `  ✗${slot.wrong}` : ''}`)
        if (firstPen) {
          firstPen = false
          await this.milestone('leaf', end.x > W / 2 ? 'left' : 'right', { x: end.x - 46, y: end.y - 50, w: 92, h: 84 }, id)
        }
      } else {
        // Lost on an empty branch
        await this.tween({ targets: sprite, alpha: 0, angle: 200, scale: 0.6, duration: 360 })
        sprite.destroy()
      }
      await this.wait(80)
    }
  }

  celebrate() {
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 140, () =>
        this.sparkle(Phaser.Math.Between(60, 580), Phaser.Math.Between(60, 300), Phaser.Math.RND.pick([0x0d9488, 0xe5a93c, 0x881337])),
      )
    }
    this.tweens.add({ targets: this.critters.list, y: '-=8', duration: 140, yoyo: true, repeat: 3 })
  }
}
