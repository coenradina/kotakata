import { describe, expect, it } from 'vitest'
import { FEEDBACK_TEXT_MAX, canSendFeedback, cleanClassFeedback, mailingCsv, stageCounts } from './classFeedback'

const good = { rating: 4, hard: ['time', 'intro'], confused: ['s1:p2'], confusedText: ' labels ', moment: '', again: 'yes', training: 'no', mailing: true }

describe('cleanClassFeedback', () => {
  it('keeps a good answer, tidied, in a fixed order', () => {
    const r = cleanClassFeedback({ ...good, extra: 'dropped' }, ['s1', 's2'])
    expect(r).toEqual({ ok: true, value: { rating: 4, hard: ['intro', 'time'], confused: ['s1:p2'], confusedText: 'labels', moment: '', again: 'yes', training: 'no', mailing: true } })
  })
  it('needs a rating from 1 to 5, an again and a training answer', () => {
    expect(cleanClassFeedback({ ...good, rating: 0 }, ['s1'])).toEqual({ ok: false, reason: 'rating' })
    expect(cleanClassFeedback({ ...good, rating: 2.5 }, ['s1'])).toEqual({ ok: false, reason: 'rating' })
    expect(cleanClassFeedback({ ...good, again: undefined }, ['s1'])).toEqual({ ok: false, reason: 'again' })
    expect(cleanClassFeedback({ ...good, training: 'maybe' }, ['s1'])).toEqual({ ok: false, reason: 'training' })
  })
  it('refuses unknown parts and stages outside the class', () => {
    expect(cleanClassFeedback({ ...good, hard: ['nap'] }, ['s1'])).toEqual({ ok: false, reason: 'hard' })
    expect(cleanClassFeedback({ ...good, confused: ['s3:p1'] }, ['s1'])).toEqual({ ok: false, reason: 'confused' })
    expect(cleanClassFeedback({ ...good, confused: ['s1'] }, ['s1'])).toEqual({ ok: false, reason: 'confused' })
  })
  it('drops repeated stages and caps the text', () => {
    const r = cleanClassFeedback({ ...good, confused: ['s1:p2', 's1:p2', 's1:firstData'] }, ['s1'])
    expect(r.ok && r.value.confused).toEqual(['s1:p2', 's1:firstData'])
    expect(cleanClassFeedback({ ...good, moment: 'x'.repeat(FEEDBACK_TEXT_MAX + 1) }, ['s1'])).toEqual({ ok: false, reason: 'moment' })
  })
  it('treats a missing opt-in as no', () => {
    const { mailing: _, ...rest } = good
    const r = cleanClassFeedback(rest, ['s1'])
    expect(r.ok && r.value.mailing).toBe(false)
  })
})

describe('canSendFeedback', () => {
  it('opens on the start date and closes with the class', () => {
    expect(canSendFeedback({ start: '2026-12-01', status: 'active' }, '2026-11-30')).toBe(false)
    expect(canSendFeedback({ start: '2026-12-01', status: 'active' }, '2026-12-01')).toBe(true)
    expect(canSendFeedback({ start: '2026-12-01', status: 'active' }, '2027-02-01')).toBe(true)
    expect(canSendFeedback({ start: '2026-12-01', status: 'closed' }, '2026-12-05')).toBe(false)
  })
})

describe('stageCounts', () => {
  it('counts students per stage of the class sessions only', () => {
    const members: { done: Record<string, string[]> }[] = [{ done: { s1: ['p1', 'p2', 'p1'], s9: ['p1'] } }, { done: { s1: ['p1'] } }, { done: {} }]
    expect(stageCounts(members, ['s1', 's2'])).toEqual({ 's1:p1': 2, 's1:p2': 1 })
  })
})

describe('mailingCsv', () => {
  it('writes a header, quotes commas and defuses formulas', () => {
    const csv = mailingCsv([{ name: 'Ani, S.Pd', email: 'ani@example.com', role: 'educator', institution: 'smp', city: '=HYPERLINK("x")', training: 'yes', lang: 'id', optInAt: Date.UTC(2026, 10, 20) }])
    expect(csv.split('\r\n')).toEqual([
      'name,email,role,institution,city,training,lang,opt_in_at',
      `"Ani, S.Pd",ani@example.com,educator,smp,"'=HYPERLINK(""x"")",yes,id,2026-11-20T00:00:00.000Z`,
      '',
    ])
  })
})
