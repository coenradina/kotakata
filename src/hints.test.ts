import { describe, expect, it } from 'vitest'
import { ladderHint, rungFor, type Hint } from './hints'
import { run as runTrain, type Step as TrainStep } from './levels/train/model'
import { TRAIN_STAGES, type TrainRun } from './levels/train/stages'
import { runHill, type Step as HillStep } from './levels/hill/model'
import { HILL_STAGES, STAGE_SETUP, type HillRun } from './levels/hill/stages'

describe('hint ladder', () => {
  it('climbs a rung after 1, 2 and 4 failed runs', () => {
    expect([1, 2, 3, 4, 7].map(rungFor)).toEqual([1, 2, 2, 3, 3])
  })

  const puzzle = { id: 'p', nudgeKey: 'nTrainTest', exampleKey: 'xTrainTest' } as const
  const pointer: Hint = { key: 'moreRounds', target: { where: 'field', type: 'kk_train', field: 'ROUNDS' } }

  it('starts with a question about the idea, pointing at the mission, not a block', () => {
    const h = ladderHint(1, puzzle, pointer)
    expect(h.target).toEqual({ where: 'element', id: 'mission' })
    expect(h.textKey).toBe('nTrainTest')
    expect(h.exampleKey).toBeUndefined()
  })

  it('then points at the block, then adds the example', () => {
    expect(ladderHint(2, puzzle, pointer)).toMatchObject({ key: 'moreRounds', rung: 2 })
    expect(ladderHint(2, puzzle, pointer).exampleKey).toBeUndefined()
    expect(ladderHint(3, puzzle, pointer)).toMatchObject({ key: 'moreRounds', rung: 3, exampleKey: 'xTrainTest' })
  })

  it('falls back to the mission when the session has no pointer', () => {
    expect(ladderHint(2, puzzle, null).target).toEqual({ where: 'element', id: 'mission' })
    expect(ladderHint(3, puzzle, null).exampleKey).toBe('xTrainTest')
  })
})

// The rung-3 example has to actually work, or the last hint misleads.
describe('rung-3 examples pass their puzzles', () => {
  const trainRun = (p: TrainStep[], seed: number): TrainRun => {
    const raw = runTrain(p, seed)
    return { raw, events: raw.events, accuracy: raw.accuracy, passed: raw.passed, context: null }
  }
  const collect = (label: 'apple' | 'banana', count: number): TrainStep => ({ kind: 'collect', label, count })
  const train = (rounds: number): TrainStep => ({ kind: 'train', rounds })
  const test = (count: number): TrainStep => ({ kind: 'test', count })
  const trainExamples: Record<string, TrainStep[]> = {
    collect: [collect('apple', 3), collect('banana', 3)],
    train: [collect('apple', 3), collect('banana', 3), train(1)],
    test: [collect('apple', 6), collect('banana', 6), train(3), test(10)],
    perfect: [collect('apple', 10), collect('banana', 10), train(4), test(20)],
  }
  for (const stage of TRAIN_STAGES) {
    it(`Level 1, ${stage.id}, on most seeds`, () => {
      const program = trainExamples[stage.id]
      const passes = Array.from({ length: 40 }, (_, i) => stage.check(program, trainRun(program, i + 1))).filter(Boolean).length
      // Testing has noise; a perfect score can miss on an unlucky seed.
      expect(passes).toBeGreaterThanOrEqual(stage.id === 'perfect' ? 30 : 38)
    })
  }

  const hillExamples: Record<string, [number, number]> = { gentle: [0.4, 10], short: [0.4, 6], steep: [0.1, 10], one: [0.5, 1] }
  for (const stage of HILL_STAGES) {
    it(`Level 3, ${stage.id}`, () => {
      const [lr, n] = hillExamples[stage.id]
      const program: HillStep[] = [{ kind: 'lr', value: lr, id: 'a' }, { kind: 'steps', n, id: 'b' }]
      const { hill, budget } = STAGE_SETUP[stage.id]
      const raw = runHill(program, hill, budget)
      const r: HillRun = { raw, events: [], accuracy: null, passed: false, context: null }
      expect(stage.check(program, r)).toBe(true)
    })
  }
})

describe('rung-3 examples pass their puzzles, Levels 2 and 4', async () => {
  const { runTree } = await import('./levels/tree/model')
  const { TREE_STAGES, STAGE_CRITTERS } = await import('./levels/tree/stages')
  const { runTavern } = await import('./levels/tavern/model')
  const { TAVERN_STAGES } = await import('./levels/tavern/stages')
  type Tree = import('./levels/tree/model').Tree
  type TavernStep = import('./levels/tavern/model').Step

  const leaf = (pen: 'bird' | 'bee' | 'frog', id: string): Tree => ({ kind: 'leaf', id, pen })
  const wingsThenSize: Tree = {
    kind: 'split', id: 's1', q: 'wings',
    yes: { kind: 'split', id: 's2', q: 'big', yes: leaf('bird', 'l1'), no: leaf('bee', 'l2') },
    no: leaf('frog', 'l3'),
  }
  const treeExamples: Record<string, Tree> = {
    pair: { kind: 'split', id: 's1', q: 'wings', yes: leaf('bee', 'l1'), no: leaf('frog', 'l2') },
    all: wingsThenSize,
    lean: wingsThenSize,
  }
  for (const stage of TREE_STAGES) {
    it(`Level 2, ${stage.id}`, () => {
      const tree = treeExamples[stage.id]
      const raw = runTree(tree, 1, STAGE_CRITTERS[stage.id] ?? STAGE_CRITTERS.all)
      const r = { raw, events: raw.events, accuracy: raw.accuracy, passed: raw.passed, context: null }
      expect(stage.check({ tree }, r)).toBe(true)
    })
  }

  const s = (kind: TavernStep['kind'], v: string | number, id: string): TavernStep =>
    (kind === 'start' ? { kind, token: v, id } : kind === 'write' ? { kind, n: v, id } : { kind, value: v, id }) as TavernStep
  const tavernExamples: Record<string, TavernStep[]> = {
    first: [s('start', 'the', 'a'), s('write', 4, 'b')],
    surprise: [s('start', 'the', 'a'), s('temp', 1, 'b'), s('write', 4, 'c')],
    context: [s('start', 'the', 'a'), s('context', 2, 'b'), s('temp', 0, 'c'), s('write', 10, 'd')],
    creative: [s('start', 'cat', 'a'), s('context', 2, 'b'), s('temp', 1, 'c'), s('write', 10, 'd')],
  }
  for (const stage of TAVERN_STAGES) {
    it(`Level 4, ${stage.id}, on most seeds`, () => {
      const program = tavernExamples[stage.id]
      const passes = Array.from({ length: 40 }, (_, i) => {
        const raw = runTavern(program, i + 1)
        return stage.check(program, { raw, events: [], accuracy: null, passed: false, context: null } as never)
      }).filter(Boolean).length
      // At temperature 1 a run can still repeat the cold story, so the
      // warm examples only need to pass most runs; their hint says to retry.
      expect(passes, `${passes}/40`).toBeGreaterThanOrEqual(stage.id === 'first' || stage.id === 'context' ? 40 : 25)
    })
  }
})
