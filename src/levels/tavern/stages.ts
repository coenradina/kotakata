import type { AchievementDef, LevelRun, StageDef } from '../types'
import { boringStory, type Step, type TavernResult } from './model'

export type TavernRun = LevelRun & { raw: TavernResult }
const raw = (r: LevelRun) => (r as TavernRun).raw

const different = (p: Step[], r: TavernResult) => r.story.join(' ') !== boringStory(p).join(' ')
const warm = (r: TavernResult) => r.temperatures.some((t) => t > 0)
const unused = (r: TavernResult, kind: 'temp' | 'context') => r.unused.some((u) => u.kind === kind)

/** A one-word memory at temperature 0, so the bard visibly loops. */
const LOOP_DEMO = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'kk_when_run',
        x: 24,
        y: 24,
        next: {
          block: {
            type: 'kk_tok_start',
            fields: { TOKEN: 'the' },
            next: { block: { type: 'kk_tok_temp', fields: { T: '0' }, next: { block: { type: 'kk_tok_write', fields: { N: 10 } } } } },
          },
        },
      },
    ],
  },
  messageKey: 'demoLoop' as const,
}

export const TAVERN_STAGES: StageDef<Step[]>[] = [
  {
    id: 'first',
    titleKey: 's4FirstTitle',
    missionKey: 's4FirstMission',
    check: (_p, r) => raw(r).picks.length >= 4,
    failKey: () => 'tokNeedMore',
  },
  {
    id: 'surprise',
    titleKey: 's4SurpriseTitle',
    missionKey: 's4SurpriseMission',
    check: (p, r) => warm(raw(r)) && different(p, raw(r)),
    failKey: (_p, r) => (unused(raw(r), 'temp') ? 'tokTempBelow' : warm(raw(r)) ? 'tokSameChance' : 'tokSameBoring'),
  },
  {
    id: 'context',
    titleKey: 's4ContextTitle',
    missionKey: 's4ContextMission',
    check: (_p, r) => raw(r).finished && raw(r).temperatures.every((t) => t === 0),
    failKey: (_p, r) =>
      unused(raw(r), 'context') ? 'tokContextBelow' : warm(raw(r)) ? 'tokNeedCold' : raw(r).looped ? 'tokLoop' : 'tokNotFinished',
    demo: LOOP_DEMO,
  },
  {
    id: 'creative',
    titleKey: 's4CreativeTitle',
    missionKey: 's4CreativeMission',
    bonus: true,
    check: (p, r) => raw(r).finished && !raw(r).looped && raw(r).temperatures.some((t) => t >= 1) && different(p, raw(r)),
    failKey: (p, r) =>
      !raw(r).temperatures.some((t) => t >= 1) ? 'tokNeedWarm' : !raw(r).finished ? 'tokNotFinished' : different(p, raw(r)) ? 'tokLoop' : 'tokSameChance',
  },
]

export const TAVERN_ACHIEVEMENTS: AchievementDef<Step[]>[] = [
  { id: 'firstWord', icon: '🪶', titleKey: 'aFirstWordTitle', descKey: 'aFirstWordDesc', check: (_p, r) => raw(r).picks.length > 0 },
  { id: 'surprise', icon: '🎲', titleKey: 'aSurpriseTitle', descKey: 'aSurpriseDesc', check: (p, r) => warm(raw(r)) && different(p, raw(r)) },
  { id: 'hot', icon: '🔥', titleKey: 'aHotTitle', descKey: 'aHotDesc', check: (_p, r) => raw(r).temperatures.includes(2) },
  { id: 'memory', icon: '🧠', titleKey: 'aMemoryTitle', descKey: 'aMemoryDesc', check: (_p, r) => raw(r).finished && raw(r).contexts.includes(2) },
  { id: 'bard', icon: '🎻', titleKey: 'aBardTitle', descKey: 'aBardDesc', check: (_p, _r, stage, passed) => stage.id === 'creative' && passed },
]
