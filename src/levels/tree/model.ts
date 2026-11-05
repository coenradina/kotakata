// Level 2: "Decision Tree Garden".
//
// Critters arrive at the garden gate. The player's decision tree asks yes/no
// questions about each critter's features and sends it down a branch until
// it reaches a pen. Colour is deliberately misleading: some birds are yellow
// like bees, and some frogs are brown like birds. Wings and size sort them
// perfectly.

export type Critter = 'bird' | 'bee' | 'frog'
export const CRITTERS: Critter[] = ['bird', 'bee', 'frog']

export type Colour = 'green' | 'yellow' | 'brown'
export type Question = 'wings' | 'big' | 'green' | 'yellow' | 'brown'
export const QUESTIONS: Question[] = ['wings', 'big', 'green', 'yellow', 'brown']

export interface Creature {
  kind: Critter
  wings: boolean
  big: boolean
  colour: Colour
}

/** The garden's visitors: 4 of each kind, with colours that overlap. */
export const GARDEN: Creature[] = [
  { kind: 'bird', wings: true, big: true, colour: 'brown' },
  { kind: 'bird', wings: true, big: true, colour: 'yellow' },
  { kind: 'bird', wings: true, big: true, colour: 'brown' },
  { kind: 'bird', wings: true, big: true, colour: 'yellow' },
  { kind: 'bee', wings: true, big: false, colour: 'yellow' },
  { kind: 'bee', wings: true, big: false, colour: 'yellow' },
  { kind: 'bee', wings: true, big: false, colour: 'yellow' },
  { kind: 'bee', wings: true, big: false, colour: 'yellow' },
  { kind: 'frog', wings: false, big: false, colour: 'green' },
  { kind: 'frog', wings: false, big: true, colour: 'green' },
  { kind: 'frog', wings: false, big: false, colour: 'brown' },
  { kind: 'frog', wings: false, big: false, colour: 'green' },
]

export function answer(q: Question, c: Creature): boolean {
  if (q === 'wings') return c.wings
  if (q === 'big') return c.big
  return c.colour === q
}

/** A node is a yes/no question (a split) or a pen (a leaf). Null is an empty branch. */
export type Tree =
  | { kind: 'split'; id: string; q: Question; yes: Tree | null; no: Tree | null }
  | { kind: 'leaf'; id: string; pen: Critter }

export interface Walk {
  creature: Creature
  /** The split nodes visited and the answer at each. */
  path: { id: string; q: Question; yes: boolean }[]
  /** The pen it ended in, or null if it hit an empty branch. */
  pen: Critter | null
  leafId: string | null
  correct: boolean
}

export function walk(tree: Tree | null, creature: Creature): Walk {
  const path: Walk['path'] = []
  let node = tree
  while (node && node.kind === 'split') {
    const yes = answer(node.q, creature)
    path.push({ id: node.id, q: node.q, yes })
    node = yes ? node.yes : node.no
  }
  const pen = node?.pen ?? null
  return { creature, path, pen, leafId: node?.id ?? null, correct: pen === creature.kind }
}

export function depth(tree: Tree | null): number {
  if (!tree || tree.kind === 'leaf') return 0
  return 1 + Math.max(depth(tree.yes), depth(tree.no))
}

export function pensUsed(tree: Tree | null, acc = new Set<Critter>()): Set<Critter> {
  if (!tree) return acc
  if (tree.kind === 'leaf') acc.add(tree.pen)
  else {
    pensUsed(tree.yes, acc)
    pensUsed(tree.no, acc)
  }
  return acc
}

export function hasEmptyBranch(tree: Tree | null): boolean {
  if (!tree) return true
  if (tree.kind === 'leaf') return false
  return hasEmptyBranch(tree.yes) || hasEmptyBranch(tree.no)
}

/** Small seeded shuffle so a run's order is reproducible. */
function shuffled<T>(items: T[], seed: number): T[] {
  let a = seed >>> 0 || 1
  const rand = () => {
    a = (a * 1664525 + 1013904223) >>> 0
    return a / 4294967296
  }
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export type TreeEvent =
  | { kind: 'warn'; code: 'one-pen' | 'empty-branch' }
  | { kind: 'sort'; walks: Walk[]; accuracy: number }

export interface TreeResult {
  events: TreeEvent[]
  walks: Walk[]
  accuracy: number
  passed: boolean
}

/** Splits in the tree, and whether any of them asks about colour. */
export function splitStats(tree: Tree | null): { splits: number; colour: boolean } {
  if (!tree || tree.kind === 'leaf') return { splits: 0, colour: false }
  const a = splitStats(tree.yes)
  const b = splitStats(tree.no)
  return { splits: 1 + a.splits + b.splits, colour: tree.q === 'green' || tree.q === 'yellow' || tree.q === 'brown' || a.colour || b.colour }
}

/**
 * Sends every critter through the tree once. Passing means every critter
 * lands in the right pen. `critters` limits who visits (stage 1 is bees and
 * frogs only).
 */
export function runTree(tree: Tree, seed: number, critters: Critter[] = CRITTERS): TreeResult {
  const visitors = GARDEN.filter((c) => critters.includes(c.kind))
  const events: TreeEvent[] = []
  if (pensUsed(tree).size < 2) events.push({ kind: 'warn', code: 'one-pen' })
  if (hasEmptyBranch(tree)) events.push({ kind: 'warn', code: 'empty-branch' })
  const walks = shuffled(visitors, seed).map((c) => walk(tree, c))
  const accuracy = walks.filter((w) => w.correct).length / walks.length
  events.push({ kind: 'sort', walks, accuracy })
  return { events, walks, accuracy, passed: accuracy === 1 }
}
