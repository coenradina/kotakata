import { describe, expect, it } from 'vitest'
import { chooseTavernHint } from './hints'
import { runTavern, type Step } from './model'

const start: Step = { kind: 'start', token: 'the', id: 'st' }
const temp = (value: number): Step => ({ kind: 'temp', value, id: 't' })
const ctx = (value: number): Step => ({ kind: 'context', value, id: 'c' })
const write = (n: number): Step => ({ kind: 'write', n, id: 'w' })
const hintFor = (p: Step[], stage: string) => chooseTavernHint(p, runTavern(p, 1), stage)?.key ?? null

describe('tavern hints', () => {
  it('points at a setting placed below the write block', () => {
    const h = chooseTavernHint([start, write(4), temp(2)], runTavern([start, write(4), temp(2)], 1), 'surprise')
    expect(h).toMatchObject({ key: 'tokOrder', target: { where: 'field', field: 'T', blockId: 't' } })
  })

  it('asks for a write block, then more tokens', () => {
    expect(chooseTavernHint(null, null)?.key).toBe('start')
    expect(hintFor([start], 'first')).toBe('tokAddWrite')
    expect(hintFor([start, write(1)], 'first')).toBe('tokMoreTokens')
    expect(hintFor([start, write(5)], 'first')).toBeNull()
  })

  it('asks for warmth when the story is the usual one', () => {
    expect(hintFor([start, write(5)], 'surprise')).toBe('tokAddTemp')
    expect(hintFor([start, temp(0), write(5)], 'surprise')).toBe('tokWarmUp')
  })

  it('asks for a longer memory when the bard loops', () => {
    expect(hintFor([start, temp(0), write(8)], 'context')).toBe('tokAddContext')
    expect(hintFor([start, temp(0), ctx(1), write(8)], 'context')).toBe('tokContextTwo')
    expect(hintFor([start, temp(1), ctx(2), write(8)], 'context')).toBe('tokCool')
    expect(hintFor([start, temp(0), ctx(2), write(8)], 'context')).toBeNull()
  })
})
