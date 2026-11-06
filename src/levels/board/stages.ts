import type { Lang } from '../../i18n'
import type { BadgeDef, Puzzle, Run } from '../types'
import { askFields, boardProgram } from './program'
import { BOARD, END, NEW_NOTICE, QUESTIONS, firstWord, type BoardResult, type Step } from './model'

/** Session 5's Run keeps the model's own result alongside, and the language its board is in. */
export type BoardRun = Run & { raw: BoardResult; lang: Lang }
const raw = (r: Run) => (r as BoardRun).raw
const langOf = (r: Run) => (r as BoardRun).lang

const written = (a: BoardResult['answers'][number]) => a.text.slice(a.prompt.length)

/** Puzzle 2: temperature above 0 and a different text than temperature 0 would write. */
export const p2Passes = (res: BoardResult) => res.temperature > 0 && res.answers.some((a, i) => res.coldTexts[i] && a.text.join(' ') !== res.coldTexts[i].join(' '))

/** Puzzle 3: at least 6 words, no loop, and every finished sentence is a sentence on the board. */
export function p3Passes(res: BoardResult, lang: Lang) {
  const a = res.answers.at(-1)
  if (!a || written(a).length < 6 || a.looped) return false
  const sentences: string[] = []
  let cur: string[] = []
  for (const w of a.text) {
    cur.push(w)
    if (w === END) {
      sentences.push(cur.join(' '))
      cur = []
    }
  }
  return sentences.length > 0 && sentences.every((s) => BOARD[lang].includes(s))
}

/** Puzzle 4: some answer was checked and turned out not to be on the board. */
export const p4Passes = (res: BoardResult) => res.answers.some((a) => a.check && !a.check.supported)

/** Puzzle 5: the three answers, in order, give what each friend asked about. */
export function p5Right(res: BoardResult, lang: Lang) {
  return QUESTIONS[lang].filter((q, i) => firstWord(res.answers[i]) === q.answer).length
}

/** The sandbox: Kata answers with the date on the new notice. */
export const sandboxPasses = (res: BoardResult, lang: Lang) => firstWord(res.answers[0]) === NEW_NOTICE[lang].split(' ').at(-2)

const PROMPTS = {
  temp: { id: ['hari'], en: ['on'] },
  loop: { id: ['ulangan'], en: ['english'] },
  ipa: { id: ['ulangan', 'ipa', 'hari'], en: ['science', 'test', 'on'] },
  vague: { id: [['ulangan', 'hari'], ['ekskul', 'hari'], ['piket', 'hari']], en: [['test', 'on'], ['homework', 'due', 'on'], ['class', 'on']] },
}

const TEMP_DEMO = { blocks: (lang: Lang) => boardProgram(['kk_w_ask', askFields(PROMPTS.temp[lang])], ['kk_w_write', { N: 2 }]), messageKey: 'demoWTemp' as const }
const LOOP_DEMO = {
  blocks: (lang: Lang) => boardProgram(['kk_w_context', { C: '1' }], ['kk_w_ask', askFields(PROMPTS.loop[lang])], ['kk_w_write', { N: 10 }]),
  messageKey: 'demoWLoop' as const,
}
const IPA_DEMO = { blocks: (lang: Lang) => boardProgram(['kk_w_ask', askFields(PROMPTS.ipa[lang])], ['kk_w_write', { N: 1 }]), messageKey: 'demoWIpa' as const }
const FRIENDS_DEMO = {
  blocks: (lang: Lang) =>
    boardProgram(...PROMPTS.vague[lang].flatMap((w): [string, Record<string, unknown>?][] => [['kk_w_ask', askFields(w)], ['kk_w_write', { N: 1 }], ['kk_w_check']])),
  messageKey: 'demoWFriends' as const,
}

function failVars(_p: Step[], r: Run) {
  const res = raw(r)
  return { n: p5Right(res, langOf(r)), answer: firstWord(res.answers[0]) ?? '-' }
}
const noAnswer = (r: Run) => (raw(r).answers.length === 0 ? 'wFailNoAsk' : raw(r).answers.every((a) => a.picks.length === 0) ? 'wFailNoWrite' : null)

export const BOARD_STAGES: Puzzle<Step[]>[] = [
  {
    id: 'p1',
    beat: 'introduce',
    firstRunTarget: 0.85,
    nudgeKey: 'nW1',
    exampleKey: 'xW1',
    titleKey: 's5w1Title',
    missionKey: 's5w1Mission',
    check: (_p, r) => raw(r).answers.some((a) => a.picks.length > 0),
    failKey: (_p, r) => noAnswer(r) ?? 'wFailNoWrite',
    failVars,
  },
  {
    id: 'p2',
    beat: 'develop',
    firstRunTarget: 0.6,
    nudgeKey: 'nW2',
    exampleKey: 'xW2',
    titleKey: 's5w2Title',
    missionKey: 's5w2Mission',
    demo: TEMP_DEMO,
    check: (_p, r) => p2Passes(raw(r)),
    failKey: (_p, r) => noAnswer(r) ?? (raw(r).temperature > 0 ? 'wFailP2Again' : 'wFailP2'),
    failVars,
    prediction: {
      questionKey: 'pW2Q',
      choices: ['pW2Same', 'pW2Diff'],
      outcome: (_p, r) => (raw(r).answers.length ? (p2Passes(raw(r)) ? 1 : 0) : null),
    },
  },
  {
    id: 'p3',
    beat: 'twist',
    firstRunTarget: 0.45,
    nudgeKey: 'nW3',
    exampleKey: 'xW3',
    titleKey: 's5w3Title',
    missionKey: 's5w3Mission',
    demo: LOOP_DEMO,
    check: (_p, r) => p3Passes(raw(r), langOf(r)),
    failKey: (_p, r) => {
      const a = raw(r).answers.at(-1)
      if (noAnswer(r)) return noAnswer(r)
      if (!a || written(a).length < 6) return 'wFailP3Short'
      return a.looped ? 'wFailP3Loop' : 'wFailP3Wrong'
    },
    failVars,
    prediction: {
      questionKey: 'pW3Q',
      choices: ['pW3Yes', 'pW3No'],
      outcome: (_p, r) => (raw(r).answers.length ? (raw(r).answers.at(-1)!.looped ? 1 : 0) : null),
    },
  },
  {
    id: 'p4',
    beat: 'twist',
    firstRunTarget: 0.35,
    nudgeKey: 'nW4',
    exampleKey: 'xW4',
    titleKey: 's5w4Title',
    missionKey: 's5w4Mission',
    demo: IPA_DEMO,
    check: (_p, r) => p4Passes(raw(r)),
    failKey: (_p, r) => noAnswer(r) ?? (raw(r).answers.some((a) => a.check) ? 'wFailP4Supported' : 'wFailP4'),
    failVars,
    prediction: {
      questionKey: 'pW4Q',
      choices: ['pW4Right', 'pW4Wrong', 'pW4Unsure'],
      outcome: (_p, r) => {
        const checked = raw(r).answers.find((a) => a.check)
        return checked ? (checked.check!.supported ? 0 : 1) : null
      },
    },
  },
  {
    id: 'p5',
    beat: 'twist',
    firstRunTarget: 0.4,
    nudgeKey: 'nW5',
    exampleKey: 'xW5',
    titleKey: 's5w5Title',
    missionKey: 's5w5Mission',
    demo: FRIENDS_DEMO,
    check: (_p, r) => p5Right(raw(r), langOf(r)) === 3,
    failKey: (_p, r) => noAnswer(r) ?? 'wFailP5',
    failVars,
    prediction: {
      questionKey: 'pW5Q',
      choices: ['pW5Yes', 'pW5No'],
      outcome: (_p, r) => (raw(r).answers.length >= 3 ? (p5Right(raw(r), langOf(r)) === 3 ? 0 : 1) : null),
    },
  },
  {
    id: 'sandbox',
    beat: 'sandbox',
    bonus: true,
    firstRunTarget: 0.4,
    nudgeKey: 'nWSandbox',
    exampleKey: 'xWSandbox',
    titleKey: 's5wSandboxTitle',
    missionKey: 's5wSandboxMission',
    check: (_p, r) => sandboxPasses(raw(r), langOf(r)),
    failKey: (_p, r) => noAnswer(r) ?? 'wFailSandbox',
    failVars,
  },
]

export const BOARD_BADGES: BadgeDef<Step[]>[] = [
  { id: 'first', icon: '✏️', titleKey: 'aWFirstTitle', descKey: 'aWFirstDesc', check: (_p, r) => raw(r).answers.some((a) => a.picks.length > 0) },
  { id: 'warm', icon: '🔥', titleKey: 'aWWarmTitle', descKey: 'aWWarmDesc', check: (_p, r) => p2Passes(raw(r)) },
  { id: 'check', icon: '🔎', titleKey: 'aWCheckTitle', descKey: 'aWCheckDesc', check: (_p, r) => p4Passes(raw(r)) },
  { id: 'asker', icon: '🎯', titleKey: 'aWAskTitle', descKey: 'aWAskDesc', check: (_p, r) => p5Right(raw(r), langOf(r)) === 3 },
  { id: 'newBoard', icon: '📌', titleKey: 'aWBoardTitle', descKey: 'aWBoardDesc', check: (_p, _r, stage, passed) => stage.id === 'sandbox' && passed },
]
