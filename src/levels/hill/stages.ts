import type { AchievementDef, LevelRun, StageDef } from '../types'
import { inValleyAfter, type HillId, type HillResult, type Step } from './model'

export type HillRun = LevelRun & { raw: HillResult }
const raw = (r: LevelRun) => (r as HillRun).raw

/** Which hill each stage is on, and how many steps of energy it allows. */
export const STAGE_SETUP: Record<string, { hill: HillId; budget: number }> = {
  gentle: { hill: 'gentle', budget: 30 },
  short: { hill: 'gentle', budget: 6 },
  steep: { hill: 'steep', budget: 10 },
  one: { hill: 'gentle', budget: 1 },
}

/** Passes when the run is on this stage's hill and ends in the valley within its energy. */
const reaches = (stageId: string) => (_p: Step[], r: LevelRun) => {
  const setup = STAGE_SETUP[stageId]
  const res = raw(r)
  return res.hill === setup.hill && inValleyAfter(res, setup.budget)
}

// The scene already announces a fly-off, so the log follows up with what to try.
/** The slow learning rate with lots of steps: on 6 steps of energy it runs out. */
const CRAWL_DEMO = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'kk_when_run',
        x: 24,
        y: 24,
        next: { block: { type: 'kk_lr', fields: { LR: '0.1' }, next: { block: { type: 'kk_steps', fields: { N: 20 } } } } },
      },
    ],
  },
  messageKey: 'demoCrawl' as const,
}

const fail = (r: LevelRun) => (raw(r).flewOff ? 'hillFlewOffNext' : 'hillNotThere')

export const HILL_STAGES: StageDef<Step[]>[] = [
  { id: 'gentle', titleKey: 's3GentleTitle', missionKey: 's3GentleMission', check: reaches('gentle'), failKey: (_p, r) => fail(r) },
  { id: 'short', titleKey: 's3ShortTitle', missionKey: 's3ShortMission', check: reaches('short'), failKey: (_p, r) => fail(r), demo: CRAWL_DEMO },
  { id: 'steep', titleKey: 's3SteepTitle', missionKey: 's3SteepMission', check: reaches('steep'), failKey: (_p, r) => fail(r) },
  { id: 'one', titleKey: 's3OneTitle', missionKey: 's3OneMission', bonus: true, check: reaches('one'), failKey: () => 'hillOneFail' },
]

export const HILL_ACHIEVEMENTS: AchievementDef<Step[]>[] = [
  { id: 'firstStep', icon: '🥾', titleKey: 'aFirstStepTitle', descKey: 'aFirstStepDesc', check: (_p, r) => raw(r).moves.length > 0 },
  { id: 'valley', icon: '🏁', titleKey: 'aValleyTitle', descKey: 'aValleyDesc', check: (_p, r) => raw(r).arrivedAt !== null },
  { id: 'bounced', icon: '🎢', titleKey: 'aBouncedTitle', descKey: 'aBouncedDesc', check: (_p, r) => raw(r).flewOff },
  { id: 'steep', icon: '🧗', titleKey: 'aSteepTitle', descKey: 'aSteepDesc', check: (_p, _r, stage, passed) => stage.id === 'steep' && passed },
  { id: 'oneJump', icon: '🎯', titleKey: 'aOneJumpTitle', descKey: 'aOneJumpDesc', check: (_p, _r, stage, passed) => stage.id === 'one' && passed },
]
