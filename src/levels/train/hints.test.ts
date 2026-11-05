import { describe, expect, it } from 'vitest'
import { chooseTrainHint as chooseHint } from './hints'
import { run, type Step } from './model'

const hintFor = (program: Step[] | null) => chooseHint(program, program ? run(program, 1) : null)?.key ?? null

const apples: Step = { kind: 'collect', label: 'apple', count: 5 }
const bananas: Step = { kind: 'collect', label: 'banana', count: 5 }
const train = (rounds: number): Step => ({ kind: 'train', rounds })
const test = (count: number): Step => ({ kind: 'test', count })

describe('hints', () => {
  it('points at the start block when there is no program', () => {
    expect(hintFor(null)).toBe('start')
  })

  it('asks for data first', () => {
    expect(hintFor([])).toBe('addData')
    expect(hintFor([train(3), test(10)])).toBe('dataFirst')
    expect(hintFor([train(3), apples, bananas, test(10)])).toBe('dataFirst')
  })

  it('asks for a test, then for training before the test', () => {
    expect(hintFor([apples, bananas])).toBe('addTest')
    expect(hintFor([apples, test(10)])).toBe('addTrain')
    expect(hintFor([apples, bananas, test(10), train(3)])).toBe('addTrain')
  })

  it('points at the missing label', () => {
    expect(hintFor([apples, train(4), test(10)])).toBe('addBanana')
    expect(hintFor([bananas, train(4), test(10)])).toBe('addApple')
  })

  it('points at the test size, then the rounds', () => {
    expect(hintFor([apples, bananas, train(4), test(5)])).toBe('testMore')
    expect(hintFor([apples, bananas, train(1), test(12)])).toBe('moreRounds')
  })

  it('says nothing after a passing run', () => {
    expect(hintFor([apples, bananas, train(4), test(12)])).toBeNull()
  })
})
