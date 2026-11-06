import { describe, expect, it } from 'vitest'
import { CORPUS } from './messages'
import { applyRules, classify, cleanRuleWord, learn, runChat, weight, words, type Lang, type Step } from './model'
import { CHAT_STAGES, TEST_SIZE, p5Passes, type ChatRun } from './stages'
import { chooseChatHint } from './hints'

const LANGS: Lang[] = ['id', 'en']
const SEEDS = Array.from({ length: 60 }, (_, i) => i + 1)
const rule = (word: string, label: 'penting' | 'santai'): Step => ({ kind: 'rule', word, label, id: `r-${word}` })
const otherwise = (label: 'penting' | 'santai'): Step => ({ kind: 'else', label, id: 'else' })
const collect = (label: 'penting' | 'santai', count: number, id = `c-${label}-${count}`): Step => ({ kind: 'collect', label, count, id })
const train: Step = { kind: 'train', id: 'train' }
const test: Step = { kind: 'test', count: 20, id: 'test' }
const work = (days: number, id = `w-${days}`): Step => ({ kind: 'work', days, id })
const RULE_WORD = { id: 'ulangan', en: 'test' }

const stage = (id: string) => CHAT_STAGES.find((s) => s.id === id)!
const run = (p: Step[], seed: number, lang: Lang, puzzle: string): ChatRun => {
  const raw = runChat(p, seed, lang, TEST_SIZE[puzzle] ?? 20)
  return { raw, events: [raw], accuracy: raw.accuracy, passed: false, context: null }
}
const passes = (p: Step[], lang: Lang, puzzle: string, seed = 1) => stage(puzzle).check(p, run(p, seed, lang, puzzle))
const passRate = (p: Step[], lang: Lang, puzzle: string) => SEEDS.filter((s) => passes(p, lang, puzzle, s)).length / SEEDS.length

describe('words', () => {
  it('lowercases, drops punctuation, and treats any laughter as one word', () => {
    expect(words('PR-nya susah BGT wkwkwk!!')).toEqual(['pr', 'nya', 'susah', 'bgt', 'wkwk'])
    expect(words('lool haha')).toEqual(['lol', 'haha'])
  })
  it('keeps a rule word to one plain word', () => {
    expect(cleanRuleWord('  Ulangan! ')).toBe('ulangan')
    expect(cleanRuleWord('two words')).toBe('two')
  })
})

describe('rules', () => {
  it('uses the first rule that matches a whole word, then the fallback', () => {
    const rs = [rule('pr', 'santai'), rule('ulangan', 'penting')] as Extract<Step, { kind: 'rule' }>[]
    expect(applyRules(rs, null, 'PR ulangan').by).toBe(0)
    expect(applyRules(rs, 'penting', 'praktikum').by).toBe('else')
    expect(applyRules(rs, null, 'praktikum').label).toBeNull()
  })
})

describe('the learner', () => {
  const m = learn([
    { text: 'besok ulangan', label: 'penting' },
    { text: 'wkwk lucu', label: 'santai' },
  ])
  it('pushes each word towards the label it came with, and unknown words nowhere', () => {
    expect(weight(m, 'ulangan')).toBeGreaterThan(0)
    expect(weight(m, 'wkwk')).toBeLessThan(0)
    expect(weight(m, 'otw')).toBe(0)
  })
  it('falls back to santai, unsure, when it knows none of the words', () => {
    const w = classify(m, 'otw gercep')
    expect(w.label).toBe('santai')
    expect(w.unsure).toBe(true)
  })
})

describe('the corpus', () => {
  for (const lang of LANGS) {
    it(`${lang}: has balanced pools of the right sizes`, () => {
      const c = CORPUS[lang]
      expect(c.test).toHaveLength(20)
      expect(c.test.filter((m) => m.label === 'penting')).toHaveLength(10)
      expect(c.train.filter((m) => m.label === 'penting').length).toBeGreaterThanOrEqual(20)
      expect(c.train.filter((m) => m.label === 'santai').length).toBeGreaterThanOrEqual(20)
      for (const day of c.days) expect(day).toHaveLength(6)
    })
  }
})

// The balance targets from docs/plan/02-sessions.md, section 3. A content
// change that breaks one fails here, before a playtest has to find it.
describe('Session 1 balance', () => {
  for (const lang of LANGS) {
    const w = RULE_WORD[lang]
    it(`${lang} P1: the starter fails, and one fallback rule fixes it`, () => {
      expect(passes([rule(w, 'penting'), test], lang, 'p1')).toBe(false)
      expect(passes([rule(w, 'penting'), otherwise('santai'), test], lang, 'p1')).toBe(true)
    })

    it(`${lang} P2: the P1 rules break on the 20 messages`, () => {
      const r = runChat([rule(w, 'penting'), otherwise('santai'), test], 1, lang)
      expect(r.lastTest!.rules).toBeGreaterThanOrEqual(8)
      expect(r.lastTest!.rules).toBeLessThan(15)
    })

    it(`${lang} P3: examples beat the usual rules on almost every run`, () => {
      const demoRules = lang === 'id' ? ['ulangan', 'pr', 'besok'] : ['test', 'hw', 'tomorrow']
      const p = [...demoRules.map((x) => rule(x, 'penting')), otherwise('santai'), collect('penting', 10), collect('santai', 10), train, test]
      expect(passRate(p, lang, 'p3')).toBeGreaterThanOrEqual(0.95)
      // And the prediction's answer is "better" nearly always.
      const better = SEEDS.filter((s) => stage('p3').prediction!.outcome(p, run(p, s, lang, 'p3')) === 0).length
      expect(better / SEEDS.length).toBeGreaterThanOrEqual(0.9)
    })

    it(`${lang} P4: 2 examples each fails; 12 each passes`, () => {
      expect(passRate([collect('penting', 2), collect('santai', 2), train, test], lang, 'p4')).toBeLessThanOrEqual(0.1)
      expect(passRate([collect('penting', 12), collect('santai', 12), train, test], lang, 'p4')).toBeGreaterThanOrEqual(0.95)
    })

    it(`${lang} P5: the slang breaks Kata, working never changes it, and retraining fixes it`, () => {
      for (const seed of SEEDS) {
        const before = runChat([collect('penting', 10), collect('santai', 10), train, work(3)], seed, lang)
        expect(before.lastDay!.kata!).toBeLessThanOrEqual(4)
        expect(before.unchangedByWork).toBe(true)
        expect(p5Passes(before)).toBe(false)
        const fixed = runChat([collect('penting', 10), collect('santai', 10), train, work(3), collect('penting', 3, 'b'), collect('santai', 3, 'c'), train, work(1, 'w2')], seed, lang)
        expect(p5Passes(fixed)).toBe(true)
      }
    })

    it(`${lang} sandbox: chit-chat rules first can reach 18`, () => {
      const casual = lang === 'id' ? ['wkwk', 'yuk', 'mabar', 'lucu', 'kantin', 'nonton', 'kocak'] : ['lol', 'gaming', 'movie', 'cute', 'canteen', 'omg', 'bakso', 'mall']
      expect(passes([...casual.map((x) => rule(x, 'santai')), otherwise('penting'), test], lang, 'sandbox')).toBe(true)
    })
  }
})

describe('Session 1 hints', () => {
  it('point at what each broken program is missing', () => {
    const hint = (p: Step[] | null, puzzle: string) => chooseChatHint(p, p ? runChat(p, 1, 'id', TEST_SIZE[puzzle] ?? 20) : null, puzzle)?.key
    expect(hint(null, 'p1')).toBe('c_start')
    expect(hint([rule('ulangan', 'penting')], 'p1')).toBe('c_addTest')
    expect(hint([rule('ulangan', 'penting'), test], 'p1')).toBe('c_addElse')
    expect(hint([test], 'p3')).toBe('c_collect')
    expect(hint([collect('penting', 10), test], 'p3')).toBe('c_bothLabels')
    expect(hint([collect('penting', 10), collect('santai', 10), test], 'p3')).toBe('c_train')
    expect(hint([collect('penting', 2), collect('santai', 2), train, test], 'p4')).toBe('c_moreExamples')
    expect(hint([collect('penting', 10), collect('santai', 10), train], 'p5')).toBe('c_work')
    expect(hint([collect('penting', 10), collect('santai', 10), train, work(1)], 'p5')).toBe('c_moreDays')
    expect(hint([collect('penting', 10), collect('santai', 10), train, work(3)], 'p5')).toBe('c_retrain')
  })
})
