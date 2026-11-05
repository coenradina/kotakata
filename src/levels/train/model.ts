// Level 1: "Train the Robot". A small but real classifier.
//
// Every fruit has two features, both between 0 and 1:
//   x = colour (0 = red, 1 = yellow)
//   y = shape  (0 = long, 1 = round)
// The robot learns one "centroid" (average point) per label, and predicts
// whichever centroid a new fruit is closest to. Training moves each centroid
// part of the way towards the average of its examples, once per round. The
// robot starts with its guesses swapped, so too few rounds visibly fail.

export type Label = 'apple' | 'banana'
export const LABELS: Label[] = ['apple', 'banana']

export interface Point { x: number; y: number }
export interface Example extends Point { label: Label }

const TRUE_CENTRE: Record<Label, Point> = {
  apple: { x: 0.25, y: 0.75 },
  banana: { x: 0.75, y: 0.28 },
}
// Deliberately wrong starting guesses: an untrained robot has it backwards.
const START_GUESS: Record<Label, Point> = {
  apple: { x: 0.82, y: 0.2 },
  banana: { x: 0.18, y: 0.82 },
}
const NOISE = 0.11
const LEARNING_RATE = 0.5
export const TARGET_ACCURACY = 0.9

/** Small seeded PRNG (mulberry32) so a run is reproducible from its seed. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussian(rand: () => number) {
  const u = Math.max(rand(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
}

const clamp = (v: number) => Math.min(1, Math.max(0, v))

export function sample(label: Label, rand: () => number): Example {
  const c = TRUE_CENTRE[label]
  return { label, x: clamp(c.x + gaussian(rand) * NOISE), y: clamp(c.y + gaussian(rand) * NOISE) }
}

export type Centroids = Partial<Record<Label, Point>>

/**
 * Runs `rounds` training rounds, continuing from `start` when given. Labels
 * seen for the first time begin at the robot's (wrong) starting guess.
 * Returns one entry per round; index 0 is the robot before this training.
 */
export function train(data: Example[], rounds: number, start: Centroids = {}): Centroids[] {
  const seen = LABELS.filter((l) => data.some((d) => d.label === l))
  let current: Centroids = Object.fromEntries(seen.map((l) => [l, { ...(start[l] ?? START_GUESS[l]) }]))
  const history: Centroids[] = [current]
  for (let r = 0; r < rounds; r++) {
    const next: Centroids = {}
    for (const l of seen) {
      const own = data.filter((d) => d.label === l)
      const mean = { x: avg(own.map((d) => d.x)), y: avg(own.map((d) => d.y)) }
      const c = current[l]!
      next[l] = { x: c.x + LEARNING_RATE * (mean.x - c.x), y: c.y + LEARNING_RATE * (mean.y - c.y) }
    }
    current = next
    history.push(current)
  }
  return history
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

/** Nearest centroid. Returns null when the robot has learned nothing yet. */
export function predict(centroids: Centroids, p: Point): Label | null {
  let best: Label | null = null
  let bestDist = Infinity
  for (const l of LABELS) {
    const c = centroids[l]
    if (!c) continue
    const d = (c.x - p.x) ** 2 + (c.y - p.y) ** 2
    if (d < bestDist) { bestDist = d; best = l }
  }
  return best
}

export interface TestResult { item: Example; guess: Label | null; correct: boolean }

export function test(centroids: Centroids, count: number, rand: () => number): TestResult[] {
  return Array.from({ length: count }, (_, i) => {
    const item = sample(LABELS[i % 2], rand)
    const guess = predict(centroids, item)
    return { item, guess, correct: guess === item.label }
  })
}

// ---------------------------------------------------------------------------
// The program a player builds out of blocks, and what running it produces.

export type Step =
  | { kind: 'collect'; label: Label; count: number }
  | { kind: 'train'; rounds: number }
  | { kind: 'test'; count: number }

export type Event =
  | { kind: 'collect'; examples: Example[] }
  | { kind: 'train'; history: Centroids[] }
  | { kind: 'test'; results: TestResult[]; accuracy: number }
  | { kind: 'warn'; code: 'test-before-train' | 'train-without-data' | 'one-label-only' }

export interface RunResult { events: Event[]; accuracy: number | null; passed: boolean }

export function run(program: Step[], seed: number): RunResult {
  const rand = rng(seed)
  const data: Example[] = []
  let centroids: Centroids = {}
  let trained = false
  let lastAccuracy: number | null = null
  const events: Event[] = []

  for (const step of program) {
    if (step.kind === 'collect') {
      const examples = Array.from({ length: step.count }, () => sample(step.label, rand))
      data.push(...examples)
      events.push({ kind: 'collect', examples })
    } else if (step.kind === 'train') {
      if (data.length === 0) {
        events.push({ kind: 'warn', code: 'train-without-data' })
        continue
      }
      if (new Set(data.map((d) => d.label)).size < LABELS.length) {
        events.push({ kind: 'warn', code: 'one-label-only' })
      }
      // Training continues from where the robot currently is.
      const history = train(data, step.rounds, centroids)
      centroids = history.at(-1)!
      trained = true
      events.push({ kind: 'train', history })
    } else {
      if (!trained) events.push({ kind: 'warn', code: 'test-before-train' })
      const results = test(centroids, step.count, rand)
      lastAccuracy = results.filter((r) => r.correct).length / results.length
      events.push({ kind: 'test', results, accuracy: lastAccuracy })
    }
  }

  const testedEnough = events.some((e) => e.kind === 'test' && e.results.length >= 10)
  return { events, accuracy: lastAccuracy, passed: testedEnough && (lastAccuracy ?? 0) >= TARGET_ACCURACY }
}
