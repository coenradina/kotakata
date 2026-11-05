// Level 3: "Hill of Loss". Gradient descent on a one-dimensional hill.
//
// The robot stands at x = START_X on a hill shaped like loss = a·x², with
// the valley (lowest loss) at x = 0. Each step it looks at the slope there
// (the gradient, 2·a·x) and moves the other way, by learning rate × gradient:
//
//   x ← x − lr · 2·a·x   which is   x ← x · (1 − 2·a·lr)
//
// So the learning rate decides everything: too small and it creeps, just
// right and it lands in a step or two, too big and it overshoots the valley,
// bounces, and can fly off the hill entirely.

export type HillId = 'gentle' | 'steep'
export const HILLS: Record<HillId, { a: number }> = {
  gentle: { a: 1 },
  steep: { a: 2.5 },
}

export const START_X = -2.5
/** Within this distance of the bottom counts as being in the valley. */
export const GOAL = 0.1
/** Beyond this the robot has flown off the hill. */
export const EDGE = 3.2
export const LEARNING_RATES = [0.02, 0.1, 0.2, 0.4, 0.5, 1.1]
export const DEFAULT_LR = 0.1

export const loss = (hill: HillId, x: number) => HILLS[hill].a * x * x
export const gradient = (hill: HillId, x: number) => 2 * HILLS[hill].a * x

export type Step = { kind: 'lr'; value: number; id: string } | { kind: 'steps'; n: number; id: string }

export interface Move {
  from: number
  to: number
  grad: number
  lr: number
  lossBefore: number
  lossAfter: number
}

export interface HillResult {
  hill: HillId
  budget: number
  moves: Move[]
  /** True when steps ran without any learning rate set (the default was used). */
  noLr: boolean
  /** Ran out of energy before the program finished. */
  tired: boolean
  flewOff: boolean
  /** Step number of the first landing in the valley, or null. */
  arrivedAt: number | null
  finalX: number
}

/**
 * Plays the program on a hill, with at most `budget` steps of energy.
 * Learning-rate blocks apply to the steps after them.
 */
export function runHill(program: Step[], hill: HillId, budget: number): HillResult {
  let x = START_X
  let lr: number | null = null
  let noLr = false
  let tired = false
  let flewOff = false
  let arrivedAt: number | null = null
  const moves: Move[] = []

  outer: for (const step of program) {
    if (step.kind === 'lr') {
      lr = step.value
      continue
    }
    for (let i = 0; i < step.n; i++) {
      if (moves.length >= budget) {
        tired = true
        break outer
      }
      if (lr === null) {
        noLr = true
        lr = DEFAULT_LR
      }
      const grad = gradient(hill, x)
      const to = x - lr * grad
      moves.push({ from: x, to, grad, lr, lossBefore: loss(hill, x), lossAfter: loss(hill, to) })
      x = to
      if (arrivedAt === null && Math.abs(x) < GOAL) arrivedAt = moves.length
      if (Math.abs(x) > EDGE) {
        flewOff = true
        break outer
      }
    }
  }
  return { hill, budget, moves, noLr, tired, flewOff, arrivedAt, finalX: x }
}

/**
 * Where the robot is after `k` steps of this run (the run itself may have
 * gone further), and whether it's safely in the valley there.
 */
export function inValleyAfter(result: HillResult, k: number): boolean {
  const n = Math.min(k, result.moves.length)
  // Flying off within the first k steps fails, even if a later step would not.
  if (result.flewOff && result.moves.length <= k) return false
  const x = n === 0 ? START_X : result.moves[n - 1].to
  return Math.abs(x) < GOAL
}

/** Whether the robot ever crossed over the valley to the other side. */
export function overshot(result: HillResult): boolean {
  return result.moves.some((m) => Math.sign(m.from) !== Math.sign(m.to) && m.to !== 0)
}
