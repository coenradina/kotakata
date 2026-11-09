import { describe, expect, it } from 'vitest'
import { toAnswer, type Draft } from './questions'

const full: Draft = { role: 'student', session: 's2', fun: 4, clear: 2, stuck: ['run', 'mission'], again: 'maybe', essay: '  tombolnya bikin bingung  ' }

describe('toAnswer', () => {
  it('waits for every required question', () => {
    expect(toAnswer({ ...full, role: null }, 'id', 'phone')).toBeNull()
    expect(toAnswer({ ...full, fun: null }, 'id', 'phone')).toBeNull()
    expect(toAnswer({ ...full, clear: 6 }, 'id', 'phone')).toBeNull()
    expect(toAnswer({ ...full, again: null }, 'id', 'phone')).toBeNull()
  })

  it('needs neither the confusing parts nor the essay', () => {
    expect(toAnswer({ ...full, stuck: [], essay: '' }, 'en', 'wide')).toMatchObject({ stuck: [], essay: '' })
  })

  it('keeps the parts in a fixed order, trims the essay and caps its length', () => {
    const a = toAnswer({ ...full, essay: `${'x'.repeat(700)}` }, 'id', 'phone')!
    expect(a.stuck).toEqual(['mission', 'run'])
    expect(a.essay).toHaveLength(600)
    expect(toAnswer(full, 'id', 'phone')!.essay).toBe('tombolnya bikin bingung')
  })

  it('drops "nothing was confusing" when a part was picked too', () => {
    expect(toAnswer({ ...full, stuck: ['none', 'blocks'] }, 'id', 'phone')!.stuck).toEqual(['blocks'])
  })
})
