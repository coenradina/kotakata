import type { Key, Lang } from '../../i18n'
import type { BadgeDef, Puzzle, Run } from '../types'
import { CARES, moodOf, PEOPLE, runOsis, type MeterId, type OsisResult, type PersonId, type PlanResult, type Program } from './model'
import { PROPOSALS, osisProgram } from './program'

export type OsisRun = Run & { raw: OsisResult; lang: Lang }
const raw = (r: Run) => (r as OsisRun).raw
const ok = (r: Run) => raw(r).ok
const plan = (r: Run, id: string) => raw(r).plans.find((p) => p.plan === id)

/** The lowest meter in the first plan that fails, and who watches it. */
export function worst(r: OsisResult): { plan: PlanResult; meter: MeterId; value: number; who: PersonId } | null {
  for (const p of r.plans) {
    const low = [...p.meters].sort((a, b) => a.value - b.value)[0]
    if (low && low.value < 50) return { plan: p, meter: low.id, value: low.value, who: PEOPLE.find((x) => CARES[x].includes(low.id))! }
  }
  return null
}

// The scene names everyone who objects; the fail line just points at the meters.
const failKey = () => 'oFail' as const
export const METER_KEY: Record<MeterId, Key> = { time: 'mTime', privacy: 'mPrivacy', fairness: 'mFairness', caught: 'mCaught', trust: 'mTrust', safety: 'mSafety' }
export const PERSON_KEY: Record<PersonId, Key> = { raka: 'pRakaShort', rina: 'pRinaShort', joko: 'pJokoShort', sari: 'pSariShort', udin: 'pUdinShort' }
const STAGE2 = osisProgram(['kk_o_strict', { V: '8' }])

export const OSIS_STAGES: Puzzle<Program>[] = [
  {
    id: 'p1',
    beat: 'introduce',
    firstRunTarget: 0.5,
    nudgeKey: 'nO1',
    exampleKey: 'xO1',
    titleKey: 's6o1Title',
    missionKey: 's6o1Mission',
    clearKey: 's6o1Clear',
    prediction: { questionKey: 'pO1Q', choices: ['pO1Yes', 'pO1No'], outcome: (p, r) => (p.attend === 'camera' || p.attend === undefined ? (ok(r) ? 0 : 1) : null) },
    check: (_p, r) => ok(r),
    failKey,
  },
  {
    id: 'p2',
    beat: 'develop',
    firstRunTarget: 0.4,
    nudgeKey: 'nO2',
    exampleKey: 'xO2',
    titleKey: 's6o2Title',
    missionKey: 's6o2Mission',
    clearKey: 's6o2Clear',
    demo: { blocks: PROPOSALS.p2, messageKey: 'demoO2', autoRun: false },
    prediction: {
      questionKey: 'pO2Q',
      choices: ['pO2None', 'pO2Few', 'pO2Many'],
      outcome: (_p, r) => {
        const n = plan(r, 'essay1')?.facts.accused ?? 0
        return n === 0 ? 0 : n <= 2 ? 1 : 2
      },
    },
    check: (_p, r) => ok(r),
    failKey,
  },
  {
    id: 'p3',
    beat: 'twist',
    firstRunTarget: 0.3,
    nudgeKey: 'nO3',
    exampleKey: 'xO3',
    titleKey: 's6o3Title',
    missionKey: 's6o3Mission',
    clearKey: 's6o3Clear',
    demo: { blocks: STAGE2, messageKey: 'demoO3', autoRun: false },
    prediction: { questionKey: 'pO3Q', choices: ['pO3Yes', 'pO3No'], outcome: (_p, r) => ((plan(r, 'essay2')?.meters.find((m) => m.id === 'fairness')?.value ?? 0) >= 50 ? 0 : 1) },
    check: (_p, r) => ok(r),
    failKey,
  },
  {
    id: 'p4',
    beat: 'develop',
    firstRunTarget: 0.45,
    nudgeKey: 'nO4',
    exampleKey: 'xO4',
    titleKey: 's6o4Title',
    missionKey: 's6o4Mission',
    clearKey: 's6o4Clear',
    demo: { blocks: PROPOSALS.p4, messageKey: 'demoO4', autoRun: false },
    prediction: { questionKey: 'pO4Q', choices: ['pO4None', 'pO4Some'], outcome: (_p, r) => ((plan(r, 'chat')?.facts.wrong ?? 0) > 0 ? 1 : 0) },
    check: (_p, r) => ok(r),
    failKey,
  },
  {
    id: 'p5',
    beat: 'twist',
    firstRunTarget: 0.35,
    nudgeKey: 'nO5',
    exampleKey: 'xO5',
    titleKey: 's6o5Title',
    missionKey: 's6o5Mission',
    clearKey: 's6o5Clear',
    demo: { blocks: PROPOSALS.p5, messageKey: 'demoO5', autoRun: false },
    // Who is most upset: the character watching the lowest meter.
    prediction: {
      questionKey: 'pO5Q',
      choices: ['pO5Raka', 'pO5Joko', 'pO5Udin'],
      outcome: (_p, r) => {
        const w = worst(raw(r))
        return w ? ({ raka: 0, joko: 1, udin: 2 } as Record<string, number>)[w.who] ?? null : null
      },
    },
    check: (_p, r) => ok(r),
    failKey,
  },
  { id: 'sandbox', beat: 'sandbox', bonus: true, firstRunTarget: 0.3, nudgeKey: 'nOSandbox', exampleKey: 'xOSandbox', titleKey: 's6oSandboxTitle', missionKey: 's6oSandboxMission', check: (_p, r) => ok(r), failKey },
]

export const OSIS_BADGES: BadgeDef<Program>[] = [
  { id: 'noai', icon: '📇', titleKey: 'aONoAITitle', descKey: 'aONoAIDesc', check: (_p, r, stage, passed) => stage.id === 'p1' && passed && raw(r).settings.attend !== 'camera' },
  { id: 'balance', icon: '⚖️', titleKey: 'aOBalanceTitle', descKey: 'aOBalanceDesc', check: (_p, _r, stage, passed) => stage.id === 'p2' && passed },
  { id: 'human', icon: '🧑‍🏫', titleKey: 'aOHumanTitle', descKey: 'aOHumanDesc', check: (_p, r, stage, passed) => stage.id === 'p3' && passed && raw(r).settings.flag === 'talk' },
  { id: 'handoff', icon: '🙋', titleKey: 'aOHandoffTitle', descKey: 'aOHandoffDesc', check: (_p, _r, stage, passed) => stage.id === 'p4' && passed },
  { id: 'gate', icon: '🛡️', titleKey: 'aOGateTitle', descKey: 'aOGateDesc', check: (_p, _r, stage, passed) => stage.id === 'p5' && passed },
]

export const runPuzzle = (p: Program, puzzle: string) => runOsis(p, puzzle)
export { moodOf }
