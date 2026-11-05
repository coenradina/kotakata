import { describe, expect, it } from 'vitest'
import type { CardId } from '../i18n'
import { rng } from '../levels/train/model'
import { accuracyFromRun, availableQuestions, pickQuestion, shouldQuiz } from './questions'

const ALL: CardId[] = ['dataset', 'label', 'training', 'testing', 'accuracy', 'classification']

describe('quiz questions', () => {
  it('has about 20 questions once every card is found', () => {
    const qs = availableQuestions(new Set(ALL), { correct: 9, total: 12 }, rng(1))
    expect(qs.length).toBeGreaterThanOrEqual(17)
    expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length)
  })

  it('only asks about terms the player has found', () => {
    const found = new Set<CardId>(['dataset', 'label'])
    for (const q of availableQuestions(found, null, rng(2))) {
      expect(q.terms.every((t) => found.has(t))).toBe(true)
    }
  })

  it('gives every multiple-choice question exactly one right answer, in both languages', () => {
    for (const q of availableQuestions(new Set(ALL), { correct: 7, total: 10 }, rng(3))) {
      if (q.kind !== 'choice') continue
      expect(q.options.filter((o) => o.correct)).toHaveLength(1)
      for (const o of q.options) expect(o.text.id && o.text.en).toBeTruthy()
    }
  })

  it('puts every answer chip in the chip tray, and one blank per answer', () => {
    for (const q of availableQuestions(new Set(ALL), null, rng(4))) {
      if (q.kind !== 'blank') continue
      for (const a of q.answers) expect(q.chips).toContain(a)
      for (const lang of ['id', 'en'] as const) {
        expect(q.sentence[lang].match(/\{\d\}/g)).toHaveLength(q.answers.length)
      }
    }
  })

  it('builds the accuracy question from the run, with distinct wrong answers', () => {
    const q = accuracyFromRun({ correct: 9, total: 12 })!
    const values = q.options.map((o) => o.text.en)
    expect(q.options.find((o) => o.correct)!.text.en).toBe('75%')
    expect(new Set(values).size).toBe(values.length)
    expect(accuracyFromRun({ correct: 12, total: 12 })!.options.find((o) => o.correct)!.text.en).toBe('100%')
  })

  it('avoids recently asked questions while others are left', () => {
    const found = new Set(ALL)
    const all = availableQuestions(found, null, rng(5)).map((q) => q.id)
    const recent = all.slice(0, -1)
    for (let s = 0; s < 20; s++) {
      expect(pickQuestion(found, {}, recent, null, rng(s))!.id).toBe(all.at(-1))
    }
  })

  it('asks about weak terms more often than mastered ones', () => {
    const found = new Set<CardId>(['dataset', 'label'])
    const stars = { dataset: 3, label: 0 }
    let labelCount = 0
    for (let s = 0; s < 400; s++) if (pickQuestion(found, stars, [], null, rng(s))!.terms.includes('label')) labelCount++
    expect(labelCount).toBeGreaterThan(200)
  })

  it('never quizzes right after a new card, twice in a row, or too early', () => {
    const base = { foundCount: 4, showedNewCard: false, quizzedLastRun: false, roll: 0.1 }
    expect(shouldQuiz(base)).toBe(true)
    expect(shouldQuiz({ ...base, showedNewCard: true })).toBe(false)
    expect(shouldQuiz({ ...base, quizzedLastRun: true })).toBe(false)
    expect(shouldQuiz({ ...base, foundCount: 1 })).toBe(false)
    expect(shouldQuiz({ ...base, roll: 0.9 })).toBe(false)
  })
})
