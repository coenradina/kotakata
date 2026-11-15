import { describe, expect, it } from 'vitest'
import { PICTURES, STUCK_MS, classState, cleanNickname, cleanPicture, isCode, isStuck, nicknameKey } from './classes'
import { AVATARS } from './schema'
import { CODE_ALPHABET, CODE_LENGTH } from './classRequest'

describe('nicknames', () => {
  it('tidies spaces and keeps letters from any script', () => {
    expect(cleanNickname('  Budi   S ')).toBe('Budi S')
    expect(cleanNickname("Ni'mah")).toBe("Ni'mah")
    expect(cleanNickname('Ayu-2')).toBe('Ayu-2')
  })
  it('refuses empty, long, and odd ones', () => {
    expect(cleanNickname('   ')).toBeNull()
    expect(cleanNickname('x'.repeat(21))).toBeNull()
    expect(cleanNickname('<b>hi</b>')).toBeNull()
    expect(cleanNickname('a/b')).toBeNull()
    expect(cleanNickname(5)).toBeNull()
  })
  it('treats case as the same name', () => {
    expect(nicknameKey('BUDI')).toBe(nicknameKey('budi'))
  })
})

describe('picture passwords', () => {
  it('are two of the twelve pictures, in order', () => {
    expect(PICTURES).toEqual(AVATARS)
    expect(cleanPicture([0, 11])).toEqual([0, 11])
    expect(cleanPicture([3, 3])).toEqual([3, 3])
    expect(cleanPicture([12, 0])).toBeNull()
    expect(cleanPicture([1])).toBeNull()
    expect(cleanPicture([1, 2, 3])).toBeNull()
    expect(cleanPicture([1.5, 2])).toBeNull()
  })
})

describe('class codes', () => {
  it('matches the codes reviewClassRequest makes', () => {
    expect(isCode('A9A9J2')).toBe(true)
    expect(isCode('a9a9j2')).toBe(false)
    expect(isCode('AB0CD1')).toBe(false)
    expect([...CODE_ALPHABET].every((ch) => isCode(ch.repeat(CODE_LENGTH)))).toBe(true)
  })
})

describe('classState', () => {
  const c = { start: '2026-11-20', end: '2026-11-27', status: 'active' }
  it('is open from the start date to the end date, both included', () => {
    expect(classState(c, '2026-11-19')).toBe('notYet')
    expect(classState(c, '2026-11-20')).toBe('open')
    expect(classState(c, '2026-11-27')).toBe('open')
    expect(classState(c, '2026-11-28')).toBe('ended')
    expect(classState({ ...c, status: 'closed' }, '2026-11-21')).toBe('closed')
  })
})

describe('isStuck', () => {
  const live = { session: 's1', puzzle: 'p1', since: 0, runs: 2, hint: 1, at: 0 }
  it('after 5 minutes on a stage, or at the third hint', () => {
    expect(isStuck(live, STUCK_MS - 1)).toBe(false)
    expect(isStuck(live, STUCK_MS)).toBe(true)
    expect(isStuck({ ...live, hint: 3 }, 1000)).toBe(true)
    expect(isStuck({ ...live, puzzle: null }, STUCK_MS * 2)).toBe(false)
  })
})
