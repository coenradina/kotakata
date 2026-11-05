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
