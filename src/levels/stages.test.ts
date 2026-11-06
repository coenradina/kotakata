import { describe, expect, it } from 'vitest'
// Uses the stage modules directly: the level index pulls in Phaser scenes,
// which need a browser.
import { run, type Step } from './train/model'
import { TRAIN_ACHIEVEMENTS, TRAIN_STAGES, type TrainRun } from './train/stages'
import { runTree, type Question, type Tree } from './tree/model'
import { STAGE_CRITTERS, TREE_STAGES, type TreeRun } from './tree/stages'
import type { TreeProgram } from './tree/blocks'

const trainRun = (p: Step[]): TrainRun => {
  const raw = run(p, 1)
  return { raw, events: raw.events, accuracy: raw.accuracy, passed: raw.passed, context: null }
}
const treeRun = (p: TreeProgram, stageId: string): TreeRun => {
  const raw = runTree(p.tree!, 1, STAGE_CRITTERS[stageId])
  return { raw, events: raw.events, accuracy: raw.accuracy, passed: raw.passed, context: { correct: 0, total: raw.walks.length } }
}
const trainStage = (id: string) => TRAIN_STAGES.find((s) => s.id === id)!
const treeStage = (id: string) => TREE_STAGES.find((s) => s.id === id)!
const apples: Step = { kind: 'collect', label: 'apple', count: 5 }
const bananas: Step = { kind: 'collect', label: 'banana', count: 5 }

describe('Level 1 stages', () => {
  const passes = (program: Step[], id: string) => trainStage(id).check(program, trainRun(program))

  it('stage 1 needs both apples and bananas', () => {
    expect(passes([apples], 'collect')).toBe(false)
    expect(passes([apples, bananas], 'collect')).toBe(true)
  })

  it('stage 2 needs training on both labels', () => {
    expect(passes([apples, bananas], 'train')).toBe(false)
    expect(passes([apples, bananas, { kind: 'train', rounds: 1 }], 'train')).toBe(true)
  })

  it('stage 3 needs 90% on at least 10, and the bonus needs 100% on 20+', () => {
    const good: Step[] = [apples, bananas, { kind: 'train', rounds: 4 }, { kind: 'test', count: 12 }]
    expect(passes(good, 'test')).toBe(true)
    expect(passes([...good.slice(0, 3), { kind: 'test', count: 20 }], 'perfect')).toBe(true)
    expect(passes(good, 'perfect')).toBe(false)
  })

  it('a full program clears every main stage in one run', () => {
    const good: Step[] = [apples, bananas, { kind: 'train', rounds: 4 }, { kind: 'test', count: 12 }]
    const r = trainRun(good)
    expect(TRAIN_STAGES.filter((s) => !s.bonus).every((s) => s.check(good, r))).toBe(true)
  })

  it('gives the balanced badge only for equal counts', () => {
    const balanced = TRAIN_ACHIEVEMENTS.find((a) => a.id === 'balanced')!
    const s = trainStage('collect')
    expect(balanced.check([apples, bananas], trainRun([apples, bananas]), s, true)).toBe(true)
    const uneven: Step[] = [apples, { ...bananas, count: 3 }]
    expect(balanced.check(uneven, trainRun(uneven), s, true)).toBe(false)
  })
})

describe('Level 2 stages', () => {
  let n = 0
  const leaf = (pen: 'bird' | 'bee' | 'frog'): Tree => ({ kind: 'leaf', id: `l${n++}`, pen })
  const ask = (q: Question, yes: Tree | null, no: Tree | null): Tree => ({ kind: 'split', id: `s${n++}`, q, yes, no })
  const passes = (tree: Tree, id: string) => {
    const p: TreeProgram = { tree }
    return treeStage(id).check(p, treeRun(p, id))
  }

  it('stage 1 only has bees and frogs, so one question is enough', () => {
    expect(passes(ask('wings', leaf('bee'), leaf('frog')), 'pair')).toBe(true)
    expect(passes(ask('yellow', leaf('bee'), leaf('frog')), 'pair')).toBe(true)
    // One frog is brown, so "green?" sends it the wrong way
    expect(passes(ask('green', leaf('frog'), leaf('bee')), 'pair')).toBe(false)
    expect(treeRun({ tree: leaf('bee') }, 'pair').raw.walks).toHaveLength(8)
  })

  it('stage 2 brings the birds, so the one-question tree fails', () => {
    expect(passes(ask('wings', leaf('bee'), leaf('frog')), 'all')).toBe(false)
    expect(passes(ask('wings', ask('big', leaf('bird'), leaf('bee')), leaf('frog')), 'all')).toBe(true)
  })

  it('the bonus wants at most 2 questions and no colour', () => {
    const best = ask('wings', ask('big', leaf('bird'), leaf('bee')), leaf('frog'))
    const wordy = ask('wings', ask('big', leaf('bird'), ask('yellow', leaf('bee'), leaf('bee'))), leaf('frog'))
    expect(passes(best, 'lean')).toBe(true)
    expect(passes(wordy, 'lean')).toBe(false)
  })
})

import { runHill, type Step as HillStep } from './hill/model'
import { HILL_STAGES, STAGE_SETUP, type HillRun } from './hill/stages'

describe('Level 3 stages', () => {
  const lr = (value: number): HillStep => ({ kind: 'lr', value, id: 'lr' })
  const steps = (n: number): HillStep => ({ kind: 'steps', n, id: 's' })
  const hillRun = (p: HillStep[], stageId: string): HillRun => {
    const { hill, budget } = STAGE_SETUP[stageId]
    const raw = runHill(p, hill, budget)
    return { raw, events: [raw], accuracy: null, passed: false, context: null }
  }
  const check = (p: HillStep[], ranOn: string, stageId: string) => HILL_STAGES.find((s) => s.id === stageId)!.check(p, hillRun(p, ranOn))

  it('a strong gentle-hill run also clears the low-energy stage, but not the steep hill', () => {
    const good = [lr(0.4), steps(5)]
    expect(check(good, 'gentle', 'gentle')).toBe(true)
    expect(check(good, 'gentle', 'short')).toBe(true)
    expect(check(good, 'gentle', 'steep')).toBe(false)
  })

  it('the slow learning rate clears stage 1 but not stage 2', () => {
    const slow = [lr(0.1), steps(20)]
    expect(check(slow, 'gentle', 'gentle')).toBe(true)
    expect(check(slow, 'short', 'short')).toBe(false)
  })

  it('the steep hill needs a smaller learning rate, and the bonus needs exactly 0.5', () => {
    expect(check([lr(0.4), steps(10)], 'steep', 'steep')).toBe(false)
    expect(check([lr(0.1), steps(10)], 'steep', 'steep')).toBe(true)
    expect(check([lr(0.5), steps(1)], 'one', 'one')).toBe(true)
    expect(check([lr(0.5), steps(1)], 'gentle', 'one')).toBe(true)
  })
})

import { runTavern, type Step as TavernStep } from './tavern/model'
import { TAVERN_STAGES, type TavernRun } from './tavern/stages'

describe('Level 4 stages', () => {
  const start: TavernStep = { kind: 'start', token: 'the', id: 'st' }
  const temp = (value: number): TavernStep => ({ kind: 'temp', value, id: 't' })
  const ctx = (value: number): TavernStep => ({ kind: 'context', value, id: 'c' })
  const write = (n: number): TavernStep => ({ kind: 'write', n, id: 'w' })
  const tavernRun = (p: TavernStep[], seed = 1): TavernRun => {
    const raw = runTavern(p, seed)
    return { raw, events: [raw], accuracy: null, passed: false, context: null }
  }
  const check = (p: TavernStep[], stageId: string, seed = 1) => TAVERN_STAGES.find((s) => s.id === stageId)!.check(p, tavernRun(p, seed))

  it('stage 1 wants at least 4 tokens', () => {
    expect(check([start, write(1)], 'first')).toBe(false)
    expect(check([start, write(4)], 'first')).toBe(true)
  })

  it('stage 2 wants a warm, different story, which some seeds give', () => {
    expect(check([start, temp(0), write(6)], 'surprise')).toBe(false)
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((seed) => check([start, temp(1), write(6)], 'surprise', seed))
    expect(seeds.length).toBeGreaterThan(3)
  })

  it('stage 3 needs temperature 0 and a two-word memory to finish', () => {
    expect(check([start, temp(0), write(10)], 'context')).toBe(false)
    expect(check([start, temp(0), ctx(2), write(10)], 'context')).toBe(true)
    expect(check([start, temp(1), ctx(2), write(10)], 'context')).toBe(false)
  })

  it('the bonus is reachable with a warm, two-word memory', () => {
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((seed) => check([start, temp(1), ctx(2), write(10)], 'creative', seed))
    expect(seeds.length).toBeGreaterThan(1)
  })
})

describe('every puzzle has a place in its arc', () => {
  // Imported here, not at the top, to keep the earlier tests' imports as they were.
  it('opens with an introduce beat, ends free play in the sandbox, and shows each demo as a twist', async () => {
    const { HILL_STAGES } = await import('./hill/stages')
    const { TAVERN_STAGES } = await import('./tavern/stages')
    for (const puzzles of [TRAIN_STAGES, TREE_STAGES, HILL_STAGES, TAVERN_STAGES] as { id: string; beat: string; bonus?: boolean; demo?: object; firstRunTarget: number }[][]) {
      expect(puzzles[0].beat).toBe('introduce')
      for (const p of puzzles) {
        expect(p.beat === 'sandbox', p.id).toBe(Boolean(p.bonus))
        if (p.demo) expect(p.beat, p.id).toBe('twist')
        expect(p.firstRunTarget, p.id).toBeGreaterThan(0)
        expect(p.firstRunTarget, p.id).toBeLessThanOrEqual(1)
      }
    }
  })
})
