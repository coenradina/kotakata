import type { Lang } from '../../i18n'
import type { BadgeDef, Puzzle, Run } from '../types'
import { SLANG_DAY, type ChatResult, type Step } from './model'

/** Session 1's Run keeps the model's own result alongside. */
export type ChatRun = Run & { raw: ChatResult }
const raw = (r: Run) => (r as ChatRun).raw

/** Puzzle 1 sorts the first 4 test messages; every other puzzle sorts all 20. */
export const TEST_SIZE: Record<string, number> = { p1: 4 }

const ruleCount = (p: Step[]) => p.filter((s) => s.kind === 'rule').length
const rules = (r: Run) => raw(r).lastTest?.rules ?? null
const kata = (r: Run) => raw(r).lastTest?.kata ?? null
const trainedAndTested = (r: Run) => kata(r) !== null

// Stage demos load these blocks and run them once, so the player sees the problem first.
const block = (type: string, fields?: Record<string, unknown>, next?: object) => ({ type, ...(fields ? { fields } : {}), ...(next ? { next: { block: next } } : {}) })
const chain = (...bs: [string, Record<string, unknown>?][]) => bs.reduceRight<object | undefined>((next, [type, f]) => block(type, f, next), undefined)!
const program = (...bs: [string, Record<string, unknown>?][]) => ({ languageVersion: 0, blocks: [{ x: 24, y: 24, ...block('kk_when_run', undefined, chain(...bs)) }] })

// Three rules a player is likely to have written by now, in each language.
const COMMON_RULES = { id: ['ulangan', 'pr', 'besok'], en: ['test', 'hw', 'tomorrow'] }
const EXAMPLES_DEMO = {
  blocks: (lang: Lang) =>
    program(
      ...COMMON_RULES[lang].map((w): [string, Record<string, unknown>] => ['kk_c_rule', { WORD: w, LABEL: 'penting' }]),
      ['kk_c_else', { LABEL: 'santai' }],
      ['kk_c_collect', { COUNT: 10, LABEL: 'penting' }],
      ['kk_c_collect', { COUNT: 10, LABEL: 'santai' }],
      ['kk_c_train'],
      ['kk_c_test'],
    ),
  messageKey: 'demoCExamples' as const,
  // This program already wins, so it waits for the player's guess instead of running itself.
  autoRun: false,
}
const FEW_DEMO = {
  blocks: program(['kk_c_collect', { COUNT: 2, LABEL: 'penting' }], ['kk_c_collect', { COUNT: 2, LABEL: 'santai' }], ['kk_c_train'], ['kk_c_test']),
  messageKey: 'demoCFew' as const,
}
const WORK_DEMO = {
  blocks: program(['kk_c_collect', { COUNT: 10, LABEL: 'penting' }], ['kk_c_collect', { COUNT: 10, LABEL: 'santai' }], ['kk_c_train'], ['kk_c_work', { DAYS: 3 }]),
  messageKey: 'demoCWork' as const,
}

/** Puzzle 5 passes when Kata was retrained after the slang arrived and then scored 5 of 6 on a later day. */
export function p5Passes(res: ChatResult) {
  return res.retrainedAfterSlang && res.lastDay !== null && res.lastDay.day > SLANG_DAY && (res.lastDay.kata ?? 0) >= 5
}

/** Fills the numbers in every Session 1 fail line. */
function failVars(p: Step[], r: Run) {
  const res = raw(r)
  const t = res.lastTest
  return {
    n: res.lastDay && !t ? (res.lastDay.kata ?? res.lastDay.rules ?? 0) : t ? (t.kata ?? t.rules ?? 0) : 0,
    e: res.examples,
    d: res.lastDay?.day ?? 0,
    rules: p.filter((s) => s.kind === 'rule').length,
  }
}

export const CHAT_STAGES: Puzzle<Step[]>[] = [
  {
    id: 'p1',
    beat: 'introduce',
    firstRunTarget: 0.8,
    nudgeKey: 'nC1',
    exampleKey: 'xC1',
    titleKey: 's5x1Title',
    missionKey: 's5x1Mission',
    check: (_p, r) => rules(r) === 4,
    failKey: (_p, r) => (raw(r).lastTest ? 'cFailP1' : 'cFailNoTest'),
    failVars,
  },
  {
    id: 'p2',
    beat: 'develop',
    firstRunTarget: 0.5,
    nudgeKey: 'nC2',
    exampleKey: 'xC2',
    titleKey: 's5x2Title',
    missionKey: 's5x2Mission',
    // The lesson is the struggle, not the score: six rules is enough to move on.
    check: (p, r) => (rules(r) ?? 0) >= 15 || (raw(r).lastTest !== null && ruleCount(p) >= 6),
    failKey: (_p, r) => (raw(r).lastTest ? 'cFailP2' : 'cFailNoTest'),
    failVars,
    prediction: {
      questionKey: 'pC2Q',
      choices: ['pC2All', 'pC2Most', 'pC2Half', 'pC2Few'],
      outcome: (_p, r) => {
        const n = rules(r)
        return n === null ? null : n === 20 ? 0 : n >= 14 ? 1 : n >= 8 ? 2 : 3
      },
    },
  },
  {
    id: 'p3',
    beat: 'twist',
    firstRunTarget: 0.6,
    nudgeKey: 'nC3',
    exampleKey: 'xC3',
    titleKey: 's5x3Title',
    missionKey: 's5x3Mission',
    demo: EXAMPLES_DEMO,
    check: (_p, r) => {
      const k = kata(r)
      const ru = rules(r)
      return k !== null && (k >= 16 || (ru !== null && k > ru))
    },
    failKey: (_p, r) => (!raw(r).lastTest ? 'cFailNoTest' : trainedAndTested(r) ? 'cFailP3Low' : 'cFailP3'),
    failVars,
    prediction: {
      questionKey: 'pC3Q',
      choices: ['pC3Better', 'pC3Same', 'pC3Worse'],
      outcome: (_p, r) => {
        const k = kata(r)
        const ru = rules(r)
        if (k === null || ru === null) return null
        return k > ru ? 0 : k === ru ? 1 : 2
      },
    },
  },
  {
    id: 'p4',
    beat: 'develop',
    firstRunTarget: 0.4,
    nudgeKey: 'nC4',
    exampleKey: 'xC4',
    titleKey: 's5x4Title',
    missionKey: 's5x4Mission',
    demo: FEW_DEMO,
    check: (_p, r) => (kata(r) ?? 0) >= 17,
    failKey: (_p, r) => (!raw(r).lastTest ? 'cFailNoTest' : trainedAndTested(r) ? 'cFailP4' : 'cFailP3'),
    failVars,
  },
  {
    id: 'p5',
    beat: 'twist',
    firstRunTarget: 0.35,
    nudgeKey: 'nC5',
    exampleKey: 'xC5',
    titleKey: 's5x5Title',
    missionKey: 's5x5Mission',
    demo: WORK_DEMO,
    check: (_p, r) => p5Passes(raw(r)),
    failKey: (_p, r) => {
      const res = raw(r)
      if (res.daysWorked === 0) return 'cFailP5NoWork'
      if (res.daysWorked < SLANG_DAY) return 'cFailP5Short'
      if (!res.retrainedAfterSlang) return 'cFailP5NoRetrain'
      if (!res.lastDay || res.lastDay.day <= SLANG_DAY) return 'cFailP5After'
      return 'cFailP5Low'
    },
    failVars,
    prediction: {
      questionKey: 'pC5Q',
      choices: ['pC5Yes', 'pC5No', 'pC5Depends'],
      // Working never changes Kata. The model checks that rather than assuming it.
      outcome: (_p, r) => (raw(r).daysWorked === 0 ? null : raw(r).unchangedByWork ? 1 : 0),
    },
  },
  {
    id: 'sandbox',
    beat: 'sandbox',
    bonus: true,
    firstRunTarget: 0.3,
    nudgeKey: 'nCSandbox',
    exampleKey: 'xCSandbox',
    titleKey: 's5xSandboxTitle',
    missionKey: 's5xSandboxMission',
    check: (_p, r) => (rules(r) ?? 0) >= 18,
    failKey: (_p, r) => (raw(r).lastTest ? 'cFailSandbox' : 'cFailNoTest'),
    failVars,
  },
]

export const CHAT_BADGES: BadgeDef<Step[]>[] = [
  { id: 'ruleWriter', icon: '✍️', titleKey: 'aCRulesTitle', descKey: 'aCRulesDesc', check: (p) => ruleCount(p) >= 6 },
  {
    id: 'rulesLost',
    icon: '🥊',
    titleKey: 'aCLostTitle',
    descKey: 'aCLostDesc',
    check: (_p, r) => {
      const k = kata(r)
      const ru = rules(r)
      return k !== null && ru !== null && k > ru
    },
  },
  { id: 'notMagic', icon: '🪄', titleKey: 'aCMagicTitle', descKey: 'aCMagicDesc', check: (_p, r) => p5Passes(raw(r)) },
  { id: 'ruleChamp', icon: '🏆', titleKey: 'aCChampTitle', descKey: 'aCChampDesc', check: (_p, _r, stage, passed) => stage.id === 'sandbox' && passed },
]
