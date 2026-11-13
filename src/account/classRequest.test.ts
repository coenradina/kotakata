import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CLASS_SESSIONS, CODE_ALPHABET, codeFrom, cleanClassRequest, cleanNote, daysFrom, isDay, jakartaToday } from './classRequest'
import { PLAY_IDS } from '../staticRoutes'

const today = '2026-11-13'
const good = {
  institution: '  SMP Negeri 5   Bandung ',
  city: 'Bandung',
  mode: 'offline',
  participants: ['teachers', 'students'],
  count: 32,
  grades: ['9', '8'],
  sessions: ['s2', 's1', 'hill'],
  start: '2026-11-20',
  end: '2026-11-27',
  purpose: ' Kelas informatika kelas 8 dan 9. ',
  ownerUid: 'forged',
  status: 'approved',
}

describe('cleanClassRequest', () => {
  it('keeps a good request, in list order, and drops what the form may not set', () => {
    expect(cleanClassRequest(good, today)).toEqual({
      ok: true,
      value: {
        institution: 'SMP Negeri 5 Bandung',
        city: 'Bandung',
        mode: 'offline',
        participants: ['students', 'teachers'],
        count: 32,
        grades: ['8', '9'],
        sessions: ['s1', 's2', 'hill'],
        start: '2026-11-20',
        end: '2026-11-27',
        purpose: 'Kelas informatika kelas 8 dan 9.',
      },
    })
  })

  it('needs grades only when students take part', () => {
    expect(cleanClassRequest({ ...good, grades: [] }, today)).toEqual({ ok: false, reason: 'grades' })
    const teachers = cleanClassRequest({ ...good, participants: ['teachers'], grades: ['7'] }, today)
    expect(teachers.ok && teachers.value.grades).toEqual([])
  })

  it('keeps the count between 1 and 60', () => {
    expect(cleanClassRequest({ ...good, count: 0 }, today).ok).toBe(false)
    expect(cleanClassRequest({ ...good, count: 61 }, today).ok).toBe(false)
    expect(cleanClassRequest({ ...good, count: 2.5 }, today).ok).toBe(false)
    expect(cleanClassRequest({ ...good, count: 60 }, today).ok).toBe(true)
  })

  it('starts today or later, and ends 7 to 31 days after the start', () => {
    expect(cleanClassRequest({ ...good, start: today, end: '2026-11-20' }, today).ok).toBe(true)
    expect(cleanClassRequest({ ...good, start: '2026-11-12', end: '2026-11-20' }, today)).toEqual({ ok: false, reason: 'start' })
    expect(cleanClassRequest({ ...good, end: '2026-11-26' }, today)).toEqual({ ok: false, reason: 'end' })
    expect(cleanClassRequest({ ...good, end: '2026-12-21' }, today).ok).toBe(true)
    expect(cleanClassRequest({ ...good, end: '2026-12-22' }, today)).toEqual({ ok: false, reason: 'end' })
    expect(cleanClassRequest({ ...good, start: '2027-06-01', end: '2027-06-10' }, today)).toEqual({ ok: false, reason: 'start' })
    expect(cleanClassRequest({ ...good, start: '2026-02-30', end: '2026-03-09' }, today)).toEqual({ ok: false, reason: 'dates' })
  })

  it('refuses the public levels and unknown sessions', () => {
    expect(cleanClassRequest({ ...good, sessions: ['train'] }, today)).toEqual({ ok: false, reason: 'sessions' })
    expect(cleanClassRequest({ ...good, sessions: [] }, today)).toEqual({ ok: false, reason: 'sessions' })
  })

  it('needs a purpose of at most 600 characters', () => {
    expect(cleanClassRequest({ ...good, purpose: '  ' }, today)).toEqual({ ok: false, reason: 'purpose' })
    expect(cleanClassRequest({ ...good, purpose: 'x'.repeat(601) }, today)).toEqual({ ok: false, reason: 'purpose' })
  })
})

describe('dates', () => {
  it('reads days in Jakarta', () => {
    expect(jakartaToday(Date.parse('2026-11-13T16:59:00Z'))).toBe('2026-11-13')
    expect(jakartaToday(Date.parse('2026-11-13T17:00:00Z'))).toBe('2026-11-14')
    expect(daysFrom('2026-11-13', '2026-12-14')).toBe(31)
    expect(isDay('2026-11-31')).toBe(false)
  })
})

describe('cleanNote', () => {
  it('allows no note, trims, and caps the length', () => {
    expect(cleanNote(undefined)).toBe('')
    expect(cleanNote('  ok ')).toBe('ok')
    expect(cleanNote('x'.repeat(601))).toBeNull()
    expect(cleanNote(5)).toBeNull()
  })
})

describe('class codes', () => {
  it('uses 32 characters without O, 0, I or 1, so every byte maps evenly', () => {
    expect(CODE_ALPHABET).toHaveLength(32)
    expect(CODE_ALPHABET).not.toMatch(/[O0I1]/)
    expect(codeFrom([0, 31, 32, 255, 8, 24])).toBe('A9A9J2')
  })
})

describe('sessions and rules', () => {
  const rules = readFileSync(join(__dirname, '../../firestore.rules'), 'utf8')
  it('offers only sessions that exist, never the public classic 1 and 2', () => {
    for (const s of CLASS_SESSIONS) expect(PLAY_IDS).toContain(s)
    expect(CLASS_SESSIONS).not.toContain('train')
    expect(CLASS_SESSIONS).not.toContain('tree')
  })
  it('lets only the owner and admins read requests, and nobody write them', () => {
    const block = /match \/classRequests\/\{id\} \{([^}]*)\}/.exec(rules)?.[1] ?? ''
    expect(block).toMatch(/allow read: if/)
    expect(block).not.toMatch(/allow (create|update|delete|write)/)
  })
})
