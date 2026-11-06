import type { BadgeDef, Run, Puzzle } from '../types'
import type { RunResult, Step } from './model'

/** Level 1's Run keeps the model's own result alongside. */
export type TrainRun = Run & { raw: RunResult }
const raw = (r: Run) => (r as TrainRun).raw

export function counts(program: Step[]) {
  const c = { apple: 0, banana: 0 }
  for (const s of program) if (s.kind === 'collect') c[s.label] += s.count
  return c
}

const lastTest = (r: RunResult) => [...r.events].reverse().find((e) => e.kind === 'test')
const trained = (r: RunResult) => r.events.some((e) => e.kind === 'train')
const bothLabels = (p: Step[]) => {
  const c = counts(p)
  return c.apple > 0 && c.banana > 0
}

export const TRAIN_STAGES: Puzzle<Step[]>[] = [
  {
    id: 'collect',
    beat: 'introduce',
    firstRunTarget: 0.8,
    titleKey: 's1CollectTitle',
    missionKey: 's1CollectMission',
    check: (p) => bothLabels(p),
    failKey: () => 'stageNeedBothLabels',
  },
  {
    id: 'train',
    beat: 'develop',
    firstRunTarget: 0.6,
    titleKey: 's1TrainTitle',
    missionKey: 's1TrainMission',
    check: (p, r) => bothLabels(p) && trained(raw(r)),
    failKey: (p) => (bothLabels(p) ? 'stageNeedTrain' : 'stageNeedBothLabels'),
  },
  {
    id: 'test',
    beat: 'develop',
    firstRunTarget: 0.5,
    titleKey: 's1TestTitle',
    missionKey: 's1TestMission',
    check: (_p, r) => raw(r).passed,
    failKey: (_p, r) => {
      const t = lastTest(raw(r))
      if (!t || t.kind !== 'test') return 'stageNeedTest'
      return t.results.length < 10 ? 'tryAgainSmallTest' : 'tryAgainLow'
    },
  },
  {
    id: 'perfect',
    beat: 'sandbox',
    firstRunTarget: 0.3,
    titleKey: 's1PerfectTitle',
    missionKey: 's1PerfectMission',
    bonus: true,
    check: (_p, r) => {
      const t = lastTest(raw(r))
      return t?.kind === 'test' && t.results.length >= 20 && t.accuracy === 1
    },
    failKey: () => 'stagePerfectFail',
  },
]

export const TRAIN_ACHIEVEMENTS: BadgeDef<Step[]>[] = [
  {
    id: 'firstData',
    icon: '🍎',
    titleKey: 'aFirstDataTitle',
    descKey: 'aFirstDataDesc',
    check: (p) => counts(p).apple + counts(p).banana > 0,
  },
  {
    id: 'balanced',
    icon: '⚖️',
    titleKey: 'aBalancedTitle',
    descKey: 'aBalancedDesc',
    check: (p) => {
      const c = counts(p)
      return c.apple >= 3 && c.apple === c.banana
    },
  },
  {
    id: 'trained',
    icon: '🏋️',
    titleKey: 'aTrainedTitle',
    descKey: 'aTrainedDesc',
    check: (p, r) => bothLabels(p) && trained(raw(r)),
  },
  {
    id: 'onTarget',
    icon: '🎯',
    titleKey: 'aOnTargetTitle',
    descKey: 'aOnTargetDesc',
    check: (_p, r) => raw(r).passed,
  },
  {
    id: 'perfect',
    icon: '💯',
    titleKey: 'aPerfectTitle',
    descKey: 'aPerfectDesc',
    check: (_p, _r, stage, passed) => stage.id === 'perfect' && passed,
  },
]
