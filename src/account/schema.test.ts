import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AVATARS, CHILD_IDS, INSTITUTIONS, LEVELS, MAX_CHILDREN, SOURCES, cleanChild, cleanSignup } from './schema'

// firestore.rules repeats these lists; they must stay the same.
const rules = readFileSync(join(__dirname, '../../firestore.rules'), 'utf8')
const listAfter = (marker: string) => [...new RegExp(`${marker.replace(/[.[\]]/g, '\\$&')} in \\[([^\\]]*)\\]`).exec(rules)![1].matchAll(/'([^']*)'/g)].map((m) => m[1])

const educator = {
  role: 'educator',
  displayName: '  Bu   Sari ',
  lang: 'id',
  survey: { institution: 'smp', city: 'Bandung', level: '8', source: 'colleague', extra: 'x' },
  adult: true,
  terms: true,
  training: 'yes',
  mailing: false,
  access: { sessions: true },
}

describe('cleanSignup', () => {
  it('keeps an educator and drops what the form may not set', () => {
    const r = cleanSignup(educator)
    expect(r).toEqual({
      ok: true,
      value: { role: 'educator', displayName: 'Bu Sari', lang: 'id', survey: { institution: 'smp', city: 'Bandung', level: '8', source: 'colleague' }, adult: true, terms: true, training: 'yes', mailing: false },
    })
  })

  it('needs the survey from educators, and ignores it from parents', () => {
    expect(cleanSignup({ ...educator, survey: null })).toEqual({ ok: false, reason: 'survey' })
    expect(cleanSignup({ ...educator, survey: { ...educator.survey, level: '13' } })).toEqual({ ok: false, reason: 'survey' })
    expect(cleanSignup({ ...educator, training: null })).toEqual({ ok: false, reason: 'training' })
    const parent = cleanSignup({ ...educator, role: 'parent' })
    expect(parent.ok && parent.value).toMatchObject({ role: 'parent', survey: null, training: null })
  })

  it('needs both ticks and a real role', () => {
    expect(cleanSignup({ ...educator, adult: false })).toEqual({ ok: false, reason: 'adult' })
    expect(cleanSignup({ ...educator, terms: 'yes' })).toEqual({ ok: false, reason: 'terms' })
    expect(cleanSignup({ ...educator, role: 'admin' })).toEqual({ ok: false, reason: 'role' })
    expect(cleanSignup({ ...educator, role: 'student' })).toEqual({ ok: false, reason: 'role' })
  })

  it('rejects an empty or long name', () => {
    expect(cleanSignup({ ...educator, displayName: '   ' })).toEqual({ ok: false, reason: 'displayName' })
    expect(cleanSignup({ ...educator, displayName: 'x'.repeat(61) })).toEqual({ ok: false, reason: 'displayName' })
  })
})

describe('child profiles', () => {
  it('allows six ids, the same list the rules check', () => {
    expect(CHILD_IDS).toEqual(['c1', 'c2', 'c3', 'c4', 'c5', 'c6'])
    expect(CHILD_IDS).toHaveLength(MAX_CHILDREN)
  })
  it('keeps a nickname and a known avatar', () => {
    expect(cleanChild({ nickname: ' Adik ', avatar: '🐸' })).toEqual({ nickname: 'Adik', avatar: '🐸' })
    expect(cleanChild({ nickname: 'Adik', avatar: '💀' })).toBeNull()
    expect(cleanChild({ nickname: '', avatar: '🐸' })).toBeNull()
  })
})

describe('firestore.rules', () => {
  it('checks the same lists as the schema', () => {
    expect(listAfter('c.avatar')).toEqual([...AVATARS])
    expect(listAfter('childId')).toEqual(CHILD_IDS)
    expect(listAfter('s.institution')).toEqual([...INSTITUTIONS])
    expect(listAfter('s.source')).toEqual([...SOURCES])
    expect(listAfter('s.level')).toEqual([...LEVELS])
  })
})
