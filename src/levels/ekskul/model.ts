// Session 4: "Ekskul Apa?" (Which ekskul?).
//
// Kata recommends an extracurricular club to new students from a short
// survey. Players build a yes/no tree by hand, then let Kata learn one from
// past members' answers. The past data hides two traps: every past
// basketball member came from class A, and a few members joined a club
// only to follow a friend. Nothing is random.

export type Ekskul = 'basket' | 'choir' | 'robot'
export const EKSKULS: Ekskul[] = ['basket', 'choir', 'robot']

export type Feature = 'music' | 'team' | 'build' | 'after' | 'classA'
export const FEATURES: Feature[] = ['music', 'team', 'build', 'after', 'classA']

export type Answers = Record<Feature, boolean>

export interface Student {
  /** A name for the new students; past members are numbered. */
  id: string
  answers: Answers
  /** The club they joined (past members) or want (new students). */
  ekskul: Ekskul
}

/** What a student would choose for themselves: building first, then team games, else choir. */
export const wants = (a: Answers): Ekskul => (a.build ? 'robot' : a.team ? 'basket' : 'choir')

/** Survey answers from a short code: m t b s a for music, team, build, after school, class A. */
function parse(code: string): Answers {
  return { music: code.includes('m'), team: code.includes('t'), build: code.includes('b'), after: code.includes('s'), classA: code.includes('a') }
}

let seq = 0
const rows = (spec: [string, number, Ekskul?][], prefix: string): Student[] =>
  spec.flatMap(([code, n, joined]) =>
    Array.from({ length: n }, () => {
      const answers = parse(code)
      return { id: `${prefix}${++seq}`, answers, ekskul: joined ?? wants(answers) }
    }),
  )

/** Puzzles 1 and 2: six students, each with one interest. */
export const FIRST: Student[] = rows(
  [
    ['ms', 1],
    ['ma', 1],
    ['ts', 1],
    ['ta', 1],
    ['bs', 1],
    ['ba', 1],
  ],
  'f',
)

/** The new students. Their ekskul is the one they say they want. */
export const NEW: Student[] = (
  [
    ['dinda', 'mts'],
    ['raka', 'tbsa'],
    ['sari', 'ma'],
    ['bimo', 't'],
    ['ayu', 'mb'],
    ['tono', 'ts'],
    ['wulan', 'msa'],
    ['gilang', 'ba'],
  ] as const
).map(([id, code]) => ({ id, answers: parse(code), ekskul: wants(parse(code)) }))

export type NewId = (typeof NEW)[number]['id']
export const NEW_IDS = NEW.map((s) => s.id)

/** 24 past members whose clubs match what they like, from both classes: 10 basketball, 7 choir, 7 robotics. */
const CLEAN: [string, number][] = [
  ['t', 1],
  ['ts', 2],
  ['ta', 2],
  ['mt', 1],
  ['mts', 1],
  ['mta', 1],
  ['tsa', 1],
  ['mtsa', 1],
  ['m', 2],
  ['ms', 2],
  ['ma', 1],
  ['msa', 2],
  ['b', 1],
  ['bs', 1],
  ['ba', 1],
  ['tb', 1],
  ['tbsa', 1],
  ['mb', 1],
  ['mbs', 1],
]
export const PAST: Student[] = rows(CLEAN, 'p')

/** The same members, except every basketball member was in class A and nobody else was. */
export const PAST_BIASED: Student[] = PAST.map((s) => ({ ...s, id: s.id.replace('p', 'q'), answers: { ...s.answers, classA: s.ekskul === 'basket' } }))

/** The clean members plus six who joined choir to follow a friend, though they like team sports. */
export const PAST_NOISY: Student[] = [
  ...PAST.map((s) => ({ ...s, id: s.id.replace('p', 'n') })),
  ...rows(
    [
      ['t', 2, 'choir'],
      ['ts', 4, 'choir'],
    ],
    'x',
  ),
]

export interface PuzzleData {
  train: Student[]
  /** Who Kata recommends for after training. Empty in puzzle 1. */
  test: Student[]
  /** The questions this puzzle's table shows and the learner may use. */
  features: Feature[]
}

const nb = (id: string) => NEW.find((s) => s.id === id)!

export const PUZZLE_DATA: Record<string, PuzzleData> = {
  p1: { train: FIRST, test: [], features: ['music', 'team', 'build'] },
  p2: { train: FIRST, test: [nb('dinda')], features: ['music', 'team', 'build'] },
  p3: { train: PAST, test: NEW, features: ['music', 'team', 'build', 'after'] },
  p4: { train: PAST_BIASED, test: NEW, features: FEATURES },
  p5: { train: PAST_NOISY, test: NEW, features: FEATURES },
  sandbox: { train: PAST_NOISY, test: NEW, features: FEATURES },
}

// --- trees -------------------------------------------------------------------

export type Tree =
  | { kind: 'split'; id: string; q: Feature; yes: Tree | null; no: Tree | null }
  | { kind: 'leaf'; id: string; ekskul: Ekskul }

export interface Walk {
  student: Student
  path: { id: string; q: Feature; yes: boolean }[]
  /** The recommendation, or null if the walk hit an empty branch. */
  got: Ekskul | null
  leafId: string | null
  right: boolean
}

export function walk(tree: Tree | null, student: Student): Walk {
  const path: Walk['path'] = []
  let node = tree
  while (node && node.kind === 'split') {
    const yes = student.answers[node.q]
    path.push({ id: node.id, q: node.q, yes })
    node = yes ? node.yes : node.no
  }
  const got = node?.ekskul ?? null
  return { student, path, got, leafId: node?.id ?? null, right: got === student.ekskul }
}

export function depthOf(tree: Tree | null): number {
  if (!tree || tree.kind === 'leaf') return 0
  return 1 + Math.max(depthOf(tree.yes), depthOf(tree.no))
}

export function splitsOf(tree: Tree | null): number {
  if (!tree || tree.kind === 'leaf') return 0
  return 1 + splitsOf(tree.yes) + splitsOf(tree.no)
}

export function asks(tree: Tree | null, q: Feature): boolean {
  if (!tree || tree.kind === 'leaf') return false
  return tree.q === q || asks(tree.yes, q) || asks(tree.no, q)
}

export function hasEmptyBranch(tree: Tree | null): boolean {
  if (!tree) return true
  if (tree.kind === 'leaf') return false
  return hasEmptyBranch(tree.yes) || hasEmptyBranch(tree.no)
}

// --- the learner -------------------------------------------------------------

/** Share of students in a group who don't want the group's most common club, the Gini way: 0 is tidy. */
function mess(group: Student[]): number {
  if (!group.length) return 0
  const counts = EKSKULS.map((e) => group.filter((s) => s.ekskul === e).length / group.length)
  return 1 - counts.reduce((a, p) => a + p * p, 0)
}

/** How tidy the two groups are after asking q, from 0 to 1. */
export function tidiness(group: Student[], q: Feature): number {
  const yes = group.filter((s) => s.answers[q])
  const no = group.filter((s) => !s.answers[q])
  const m = (yes.length * mess(yes) + no.length * mess(no)) / group.length
  return 1 - m
}

function majority(group: Student[], fallback: Ekskul): Ekskul {
  let best = fallback
  let n = -1
  for (const e of EKSKULS) {
    const c = group.filter((s) => s.ekskul === e).length
    if (c > n) [best, n] = [e, c]
  }
  return group.length ? best : fallback
}

export interface Choice {
  nodeId: string
  /** Every question tried at this node, with its tidiness. */
  scores: { q: Feature; tidy: number }[]
  chosen: Feature
}

/**
 * Builds a tree one question at a time: at each node, try every allowed
 * question and keep the one that leaves the tidiest groups (ID3-style,
 * scored with Gini impurity). Stops when a group is all one club, when no
 * question helps, or at the depth limit.
 */
export function learnTree(train: Student[], features: Feature[], maxDepth: number | null = null): { tree: Tree; choices: Choice[] } {
  const choices: Choice[] = []
  let n = 0
  const grow = (group: Student[], depth: number, fallback: Ekskul, used: Feature[]): Tree => {
    const here = majority(group, fallback)
    const leaf: Tree = { kind: 'leaf', id: `L${n++}`, ekskul: here }
    if (mess(group) === 0 || (maxDepth !== null && depth >= maxDepth)) return leaf
    const options = features.filter((q) => !used.includes(q) && group.some((s) => s.answers[q]) && group.some((s) => !s.answers[q]))
    if (!options.length) return leaf
    const scores = options.map((q) => ({ q, tidy: tidiness(group, q) }))
    const best = scores.reduce((a, b) => (b.tidy > a.tidy + 1e-9 ? b : a))
    if (best.tidy <= 1 - mess(group) + 1e-9) return leaf
    const id = `S${n++}`
    choices.push({ nodeId: id, scores, chosen: best.q })
    return {
      kind: 'split',
      id,
      q: best.q,
      yes: grow(group.filter((s) => s.answers[best.q]), depth + 1, here, [...used, best.q]),
      no: grow(group.filter((s) => !s.answers[best.q]), depth + 1, here, [...used, best.q]),
    }
  }
  return { tree: grow(train, 0, 'choir', []), choices }
}

// --- a run -------------------------------------------------------------------

export interface Program {
  /** The tree built by hand, or null. */
  tree: Tree | null
  learn: boolean
  ignore: Feature[]
  maxDepth: number | null
  explain: string[]
  /** Block ids for hints that point at a setting. */
  ids: { learn?: string; depth?: string }
}

export const EMPTY: Program = { tree: null, learn: false, ignore: [], maxDepth: null, explain: [], ids: {} }

export interface EkskulResult {
  tree: Tree | null
  learned: boolean
  choices: Choice[]
  features: Feature[]
  train: Walk[]
  test: Walk[]
  trainRight: number
  testRight: number
  /** Walks for the students the program asked to explain, in order. */
  explained: Walk[]
  emptyBranch: boolean
}

export function runEkskul(program: Program, puzzle: string): EkskulResult {
  const data = PUZZLE_DATA[puzzle] ?? PUZZLE_DATA.sandbox
  const allowed = data.features.filter((f) => !program.ignore.includes(f))
  const learned = program.learn ? learnTree(data.train, allowed, program.maxDepth) : null
  const tree = learned?.tree ?? program.tree
  const train = data.train.map((s) => walk(tree, s))
  const test = data.test.map((s) => walk(tree, s))
  const explained = program.explain.map((id) => test.find((w) => w.student.id === id)).filter((w): w is Walk => !!w)
  return {
    tree,
    learned: !!learned,
    choices: learned?.choices ?? [],
    features: data.features,
    train,
    test,
    trainRight: train.filter((w) => w.right).length,
    testRight: test.filter((w) => w.right).length,
    explained,
    emptyBranch: !learned && hasEmptyBranch(tree),
  }
}
