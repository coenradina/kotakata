import type { BadgeDef, Puzzle, Run } from '../types'
import { fairProgram } from './program'
import { SENDERS, fairToAll, type FairResult, type Step } from './model'

/** Session 3's Run keeps the model's own result alongside. */
export type FairRun = Run & { raw: FairResult }
const raw = (r: Run) => (r as FairRun).raw

export const EXAMPLE_LIMIT = 40

const last = (r: Run) => raw(r).lastTest
const testedOn = (r: Run, on: string) => last(r)?.on === on
const NAMES = { dinda: 'Dinda', raka: 'Raka', ayu: 'Ayu', bimo: 'Bimo' } as const

function failVars(_p: Step[], r: Run) {
  const res = raw(r)
  const scores = res.bySender
  const who = scores ? SENDERS.filter((s) => scores[s].total && scores[s].right / scores[s].total < 5 / 6 - 1e-9).map((s) => NAMES[s]) : []
  return { n: res.lastTest?.right ?? 0, wrong: res.trainedOnWrong, e: res.examples, who: who.join(', ') || '-' }
}

/** Puzzle 1: test on 8C, then look at the data to see why. */
export const p1Passes = (p: Step[]) => {
  const test = p.findIndex((s) => s.kind === 'test' && s.on === '8c')
  return test >= 0 && p.slice(test + 1).some((s) => s.kind === 'inspect')
}

const MORE_DEMO = {
  blocks: fairProgram(['kk_f_collect', { COUNT: 20, LABEL: 'penting', SOURCE: '8a' }], ['kk_f_collect', { COUNT: 20, LABEL: 'santai', SOURCE: '8a' }], ['kk_c_train'], ['kk_f_test', { ON: '8c' }]),
  messageKey: 'demoFMore' as const,
}
const DONATED_DEMO = {
  blocks: fairProgram(['kk_f_collect', { COUNT: 16, LABEL: 'penting', SOURCE: 'donated' }], ['kk_f_collect', { COUNT: 16, LABEL: 'santai', SOURCE: 'donated' }], ['kk_c_train'], ['kk_f_test', { ON: '8a' }]),
  messageKey: 'demoFDonated' as const,
}
const CHEAT_DEMO = {
  blocks: fairProgram(
    ['kk_f_collect', { COUNT: 10, LABEL: 'penting', SOURCE: '8a' }],
    ['kk_f_collect', { COUNT: 10, LABEL: 'santai', SOURCE: '8a' }],
    ['kk_f_collect', { COUNT: 8, LABEL: 'penting', SOURCE: '8c' }],
    ['kk_f_collect', { COUNT: 8, LABEL: 'santai', SOURCE: '8c' }],
    ['kk_c_train'],
    ['kk_f_test', { ON: 'train' }],
  ),
  messageKey: 'demoFCheat' as const,
}

export const FAIR_STAGES: Puzzle<Step[]>[] = [
  {
    id: 'p1',
    beat: 'introduce',
    firstRunTarget: 0.7,
    nudgeKey: 'nF1',
    exampleKey: 'xF1',
    titleKey: 's3x1Title',
    missionKey: 's3x1Mission',
    check: (p) => p1Passes(p),
    failKey: (_p, r) => (!raw(r).nextWeek ? 'fFailNoTrain' : !testedOn(r, '8c') ? 'fFailP1Where' : 'fFailP1'),
    failVars,
    prediction: {
      questionKey: 'pF1Q',
      choices: ['pF1High', 'pF1Mid', 'pF1Low'],
      outcome: (_p, r) => {
        const t = last(r)
        if (!t || t.on !== '8c') return null
        return t.right >= 18 ? 0 : t.right >= 12 ? 1 : 2
      },
    },
  },
  {
    id: 'p2',
    beat: 'twist',
    firstRunTarget: 0.4,
    nudgeKey: 'nF2',
    exampleKey: 'xF2',
    titleKey: 's3x2Title',
    missionKey: 's3x2Mission',
    demo: MORE_DEMO,
    check: (_p, r) => testedOn(r, '8c') && (last(r)?.right ?? 0) >= 17,
    failKey: (_p, r) => (!raw(r).nextWeek ? 'fFailNoTrain' : !last(r) ? 'fFailNoTest' : !testedOn(r, '8c') ? 'fFailP2Where' : 'fFailP2'),
    failVars,
  },
  {
    id: 'p3',
    beat: 'twist',
    firstRunTarget: 0.35,
    nudgeKey: 'nF3',
    exampleKey: 'xF3',
    titleKey: 's3x3Title',
    missionKey: 's3x3Mission',
    demo: DONATED_DEMO,
    check: (_p, r) => testedOn(r, '8a') && (last(r)?.right ?? 0) >= 17,
    failKey: (_p, r) => (!raw(r).nextWeek ? 'fFailNoTrain' : !last(r) ? 'fFailNoTest' : !testedOn(r, '8a') ? 'fFailP3Where' : 'fFailP3'),
    failVars,
  },
  {
    id: 'p4',
    beat: 'twist',
    firstRunTarget: 0.3,
    nudgeKey: 'nF4',
    exampleKey: 'xF4',
    titleKey: 's3x4Title',
    missionKey: 's3x4Mission',
    demo: CHEAT_DEMO,
    check: (_p, r) => testedOn(r, 'holdout') && (last(r)?.size ?? 0) >= 5,
    failKey: (_p, r) => (!raw(r).nextWeek ? 'fFailNoTrain' : testedOn(r, 'holdout') ? 'fFailP4Small' : 'fFailP4'),
    failVars,
    prediction: {
      questionKey: 'pF4Q',
      choices: ['pF4Same', 'pF4Lower'],
      outcome: (_p, r) => {
        const nw = raw(r).nextWeek
        return nw ? (nw.right === nw.size ? 0 : 1) : null
      },
    },
  },
  {
    id: 'p5',
    beat: 'twist',
    firstRunTarget: 0.4,
    nudgeKey: 'nF5',
    exampleKey: 'xF5',
    titleKey: 's3x5Title',
    missionKey: 's3x5Mission',
    check: (_p, r) => fairToAll(raw(r).bySender),
    failKey: (_p, r) => (!raw(r).nextWeek ? 'fFailNoTrain' : raw(r).bySender ? 'fFailP5' : 'fFailP5NoSender'),
    failVars,
    prediction: {
      questionKey: 'pF5Q',
      choices: ['pF5Yes', 'pF5NotSure'],
      outcome: (_p, r) => (raw(r).bySender ? (fairToAll(raw(r).bySender) ? 0 : 1) : null),
    },
  },
  {
    id: 'sandbox',
    beat: 'sandbox',
    bonus: true,
    firstRunTarget: 0.3,
    nudgeKey: 'nFSandbox',
    exampleKey: 'xFSandbox',
    titleKey: 's3xSandboxTitle',
    missionKey: 's3xSandboxMission',
    check: (_p, r) => fairToAll(raw(r).bySender) && raw(r).examples <= EXAMPLE_LIMIT,
    failKey: (_p, r) => (!raw(r).bySender ? 'fFailP5NoSender' : !fairToAll(raw(r).bySender) ? 'fFailP5' : 'fFailSandbox'),
    failVars,
  },
]

export const FAIR_BADGES: BadgeDef<Step[]>[] = [
  { id: 'diverse', icon: '🌈', titleKey: 'aFDiverseTitle', descKey: 'aFDiverseDesc', check: (_p, r, stage, passed) => stage.id === 'p2' && passed && raw(r).examples < 40 },
  { id: 'labels', icon: '🔍', titleKey: 'aFLabelTitle', descKey: 'aFLabelDesc', check: (p, _r, stage, passed) => stage.id === 'p3' && passed && p.some((s) => s.kind === 'checkLabels') },
  { id: 'honest', icon: '🧪', titleKey: 'aFHonestTitle', descKey: 'aFHonestDesc', check: (_p, _r, stage, passed) => stage.id === 'p4' && passed },
  { id: 'biasHunter', icon: '🎯', titleKey: 'aFFairTitle', descKey: 'aFFairDesc', check: (_p, _r, stage, passed) => stage.id === 'p5' && passed },
  { id: 'budget', icon: '💡', titleKey: 'aFBudgetTitle', descKey: 'aFBudgetDesc', check: (_p, _r, stage, passed) => stage.id === 'sandbox' && passed },
]
