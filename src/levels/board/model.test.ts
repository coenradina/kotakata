import { describe, expect, it } from 'vitest'
import { BOARD, NEW_NOTICE, QUESTIONS, firstWord, learnBoard, nextWords, runBoard, supportOf, type Lang, type Step } from './model'
import { BOARD_STAGES, p2Passes, p3Passes, p4Passes, p5Right, sandboxPasses, type BoardRun } from './stages'
import { chooseBoardHint } from './hints'

const LANGS: Lang[] = ['id', 'en']
const SEEDS = Array.from({ length: 60 }, (_, i) => i + 1)
let n = 0
const ask = (...words: string[]): Step => ({ kind: 'ask', words, id: `ask${n++}` })
const write = (k: number): Step => ({ kind: 'write', n: k, id: `write${n++}` })
const temp = (value: number): Step => ({ kind: 'temp', value, id: 'temp' })
const ctx = (value: number): Step => ({ kind: 'context', value, id: 'ctx' })
const check = (): Step => ({ kind: 'check', id: `check${n++}` })
const reread: Step = { kind: 'reread', id: 'reread' }
const P = {
  p1: { id: ['kelas', 'libur', 'hari'], en: ['no', 'class', 'on'] },
  temp: { id: ['hari'], en: ['on'] },
  loop: { id: ['ulangan'], en: ['english'] },
  ipa: { id: ['ulangan', 'ipa', 'hari'], en: ['science', 'test', 'on'] },
  vague: { id: [['ulangan', 'hari'], ['ekskul', 'hari'], ['piket', 'hari']], en: [['test', 'on'], ['homework', 'due', 'on'], ['class', 'on']] },
  clear: { id: [['ulangan', 'matematika', 'hari'], ['ekskul', 'basket', 'hari'], ['piket', 'kelas', 'hari']], en: [['maths', 'test', 'on'], ['maths', 'homework', 'due'], ['class', 'cleaning', 'on']] },
}

describe('the board model', () => {
  const table = learnBoard(BOARD.id)
  it('picks the most common next word at temperature 0, first seen on a tie', () => {
    const { candidates } = nextWords(table, ['hari'], 1, 0)
    expect(candidates[0].word).toBe('senin')
    expect(candidates[0].p).toBe(1)
  })
  it('backs off to a shorter context it has seen', () => {
    const r = nextWords(table, ['ulangan', 'ipa', 'hari'], 3, 0)
    expect(r.used).toEqual(['hari'])
    expect(r.backedOff).toBe(true)
  })
  it('finds the board sentence that supports an answer', () => {
    expect(supportOf(BOARD.id, ['ulangan', 'matematika', 'hari'], ['rabu'])).toBe('ulangan matematika hari rabu .')
    expect(supportOf(BOARD.id, ['ulangan', 'ipa', 'hari'], ['senin'])).toBeNull()
  })
  it('applies settings wherever they are placed (usability finding B1)', () => {
    const below = runBoard([ask('hari'), write(2), temp(2)], 1, 'id')
    expect(below.temperature).toBe(2)
  })
})

// The balance targets from docs/plan/02-sessions.md, section 5.
describe('Session 5 balance', () => {
  for (const lang of LANGS) {
    it(`${lang} P1: the starter question gets the board's answer`, () => {
      const r = runBoard([ask(...P.p1[lang]), write(1)], 1, lang)
      expect(supportOf(BOARD[lang], r.answers[0].prompt, [firstWord(r.answers[0])!])).not.toBeNull()
    })

    it(`${lang} P2: temperature 0 never changes; temperature 1 usually does`, () => {
      expect(SEEDS.some((s) => p2Passes(runBoard([ask(...P.temp[lang]), write(2)], s, lang)))).toBe(false)
      const warm = SEEDS.filter((s) => p2Passes(runBoard([ask(...P.temp[lang]), temp(1), write(2)], s, lang))).length
      expect(warm / SEEDS.length).toBeGreaterThanOrEqual(0.4)
    })

    it(`${lang} P3: a one-word memory loops; three words write the board back`, () => {
      expect(p3Passes(runBoard([ctx(1), ask(...P.loop[lang]), write(10)], 1, lang), lang)).toBe(false)
      expect(runBoard([ctx(1), ask(...P.loop[lang]), write(10)], 1, lang).answers[0].looped).toBe(true)
      expect(p3Passes(runBoard([ctx(3), ask(...P.loop[lang]), write(10)], 1, lang), lang)).toBe(true)
    })

    it(`${lang} P4: Kata answers the unannounced test confidently, and the check catches it`, () => {
      const r = runBoard([ask(...P.ipa[lang]), write(1), check()], 1, lang)
      const pick = r.answers[0].picks[0]
      expect(pick.candidates[0].p).toBeGreaterThanOrEqual(0.5)
      expect(p4Passes(r)).toBe(true)
      expect(p4Passes(runBoard([ask(...P.ipa[lang]), write(1)], 1, lang))).toBe(false)
    })

    it(`${lang} P5: every vague question misses; every clear one hits`, () => {
      const vague = runBoard(P.vague[lang].flatMap((w) => [ask(...w), write(1)]), 1, lang)
      expect(p5Right(vague, lang)).toBe(0)
      const clear = runBoard(P.clear[lang].flatMap((w) => [ask(...w), write(1)]), 1, lang)
      expect(p5Right(clear, lang)).toBe(3)
      for (const [i, q] of QUESTIONS[lang].entries()) expect(P.clear[lang][i]).toEqual(expect.arrayContaining(q.about))
    })

    it(`${lang} sandbox: Kata keeps the old guess until it reads the new notice`, () => {
      expect(sandboxPasses(runBoard([ask(...P.ipa[lang]), write(1)], 1, lang, true), lang)).toBe(false)
      expect(sandboxPasses(runBoard([reread, ask(...P.ipa[lang]), write(1)], 1, lang, true), lang)).toBe(true)
      // Reading after asking is too late.
      expect(sandboxPasses(runBoard([ask(...P.ipa[lang]), reread, write(1)], 1, lang, true), lang)).toBe(false)
      expect(NEW_NOTICE[lang].split(' ')).toContain(firstWord(runBoard([reread, ask(...P.ipa[lang]), write(1)], 1, lang, true).answers[0]))
    })
  }
})

describe('Session 5 examples and hints', () => {
  const asRun = (p: Step[], lang: Lang, puzzle: string): BoardRun => ({ raw: runBoard(p, 1, lang, puzzle === 'sandbox'), lang, events: [], accuracy: null, passed: false, context: null })
  for (const lang of LANGS) {
    it(`${lang}: each hint's example passes its puzzle`, () => {
      const examples: Record<string, Step[]> = {
        p1: [ask(...P.p1[lang]), write(1)],
        p3: [ctx(3), ask(...P.loop[lang]), write(10)],
        p4: [ask(...P.ipa[lang]), write(1), check()],
        p5: P.clear[lang].flatMap((w) => [ask(...w), write(1), check()]),
        sandbox: [reread, ask(...P.ipa[lang]), write(1), check()],
      }
      for (const [id, program] of Object.entries(examples)) {
        const stage = BOARD_STAGES.find((s) => s.id === id)!
        expect(stage.check(program, asRun(program, lang, id)), `${lang} ${id}`).toBe(true)
      }
      // P2 depends on chance, so its example only needs to pass most runs.
      const p2 = [ask(...P.temp[lang]), temp(1), write(2)]
      expect(SEEDS.filter((s) => p2Passes(runBoard(p2, s, lang))).length / SEEDS.length).toBeGreaterThanOrEqual(0.4)
    })
  }

  it('point at what each puzzle is missing', () => {
    const hint = (p: Step[] | null, puzzle: string) => chooseBoardHint(p, p ? runBoard(p, 1, 'id', puzzle === 'sandbox') : null, puzzle, 'id')?.key
    expect(hint(null, 'p1')).toBe('w_start')
    expect(hint([write(1)], 'p1')).toBe('w_ask')
    expect(hint([ask('hari')], 'p1')).toBe('w_write')
    expect(hint([ask('hari'), write(2)], 'p2')).toBe('w_temp')
    expect(hint([ask('hari'), temp(0), write(2)], 'p2')).toBe('w_tempUp')
    expect(hint([ctx(1), ask('ulangan'), write(10)], 'p3')).toBe('w_context')
    expect(hint([ask('ulangan', 'ipa', 'hari'), write(1)], 'p4')).toBe('w_check')
    expect(hint([ask('ulangan', 'ipa', 'hari'), write(1)], 'sandbox')).toBe('w_reread')
  })
})
