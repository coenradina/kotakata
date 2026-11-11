import type { BadgeDef, Puzzle, Run } from '../types'
import { PUZZLE_PHOTOS, runVision, type PhotoId, type Step, type VisionResult } from './model'
import { visionProgram } from './program'

export type VisionRun = Run & { raw: VisionResult }
const raw = (r: Run) => (r as VisionRun).raw
const all = (r: Run) => raw(r).right === raw(r).total
const failVars = (_p: Step[], r: Run) => ({ n: raw(r).right, total: raw(r).total })
const failKey = (_p: Step[], r: Run) => (raw(r).missing.includes('action') ? 'vFailNoAction' : raw(r).missing.includes('region') ? 'vFailRegion' : 'vFail')

/** The puzzle-3 program run on another puzzle's photos, for "would it still work?" predictions. */
const photoRight = (r: Run, id: PhotoId) => raw(r).photos.find((p) => p.photo === id)?.right

const TWO = visionProgram(['kk_v_dark', { N: '2' }], ['kk_v_edges', { N: '1' }], ['kk_v_inside'], ['kk_v_glasses'])
const THREE = visionProgram(['kk_v_dark', { N: '2' }], ['kk_v_edges', { N: '1' }], ['kk_v_inside'], ['kk_v_pair'], ['kk_v_glasses'])
const FOUR = visionProgram(['kk_v_exposure'], ['kk_v_dark', { N: '2' }], ['kk_v_edges', { N: '1' }], ['kk_v_inside'], ['kk_v_pair'], ['kk_v_glasses'])

export const VISION_STAGES: Puzzle<Step[]>[] = [
  { id: 'p1', beat: 'introduce', firstRunTarget: 0.6, nudgeKey: 'nV1', exampleKey: 'xV1', titleKey: 's2v1Title', missionKey: 's2v1Mission', clearKey: 's2v1Clear', check: (_p, r) => all(r), failKey, failVars },
  { id: 'p2', beat: 'develop', firstRunTarget: 0.45, nudgeKey: 'nV2', exampleKey: 'xV2', titleKey: 's2v2Title', missionKey: 's2v2Mission', clearKey: 's2v2Clear', check: (_p, r) => all(r), failKey, failVars },
  {
    id: 'p3',
    beat: 'twist',
    firstRunTarget: 0.35,
    nudgeKey: 'nV3',
    exampleKey: 'xV3',
    titleKey: 's2v3Title',
    missionKey: 's2v3Mission',
    clearKey: 's2v3Clear',
    // The stage-2 filter loads and waits for the guess, then breaks on the mole.
    demo: { blocks: TWO, messageKey: 'demoV3' as const, autoRun: false },
    check: (_p, r) => all(r),
    failKey,
    failVars,
    prediction: { questionKey: 'pV3Q', choices: ['pV3Yes', 'pV3No'], outcome: (_p, r) => (all(r) ? 0 : 1) },
  },
  {
    id: 'p4',
    beat: 'twist',
    firstRunTarget: 0.4,
    nudgeKey: 'nV4',
    exampleKey: 'xV4',
    titleKey: 's2v4Title',
    missionKey: 's2v4Mission',
    clearKey: 's2v4Clear',
    demo: { blocks: THREE, messageKey: 'demoV4' as const, autoRun: false },
    check: (_p, r) => all(r),
    failKey,
    failVars,
    prediction: { questionKey: 'pV4Q', choices: ['pV4Works', 'pV4Fails'], outcome: (_p, r) => (photoRight(r, 'dindaDark') && photoRight(r, 'bimoDark') ? 0 : 1) },
  },
  {
    id: 'p5',
    beat: 'twist',
    firstRunTarget: 0.4,
    nudgeKey: 'nV5',
    exampleKey: 'xV5',
    titleKey: 's2v5Title',
    missionKey: 's2v5Mission',
    clearKey: 's2v5Clear',
    demo: { blocks: FOUR, messageKey: 'demoV5' as const, autoRun: false },
    check: (_p, r) => all(r),
    failKey,
    failVars,
    prediction: { questionKey: 'pV5Q', choices: ['pV5Yes', 'pV5No'], outcome: (_p, r) => (photoRight(r, 'poster') ? 1 : 0) },
  },
  { id: 'sandbox', beat: 'sandbox', bonus: true, firstRunTarget: 0.4, nudgeKey: 'nVSandbox', exampleKey: 'xVSandbox', titleKey: 's2vSandboxTitle', missionKey: 's2vSandboxMission', check: (p, r) => all(r) && p.some((s) => s.kind === 'hat'), failKey, failVars },
]

export const VISION_BADGES: BadgeDef<Step[]>[] = [
  { id: 'dark', icon: '🦅', titleKey: 'aVDarkTitle', descKey: 'aVDarkDesc', check: (_p, _r, stage, passed) => stage.id === 'p1' && passed },
  { id: 'edges', icon: '📐', titleKey: 'aVEdgeTitle', descKey: 'aVEdgeDesc', check: (_p, _r, stage, passed) => stage.id === 'p2' && passed },
  { id: 'pair', icon: '👀', titleKey: 'aVPairTitle', descKey: 'aVPairDesc', check: (_p, _r, stage, passed) => stage.id === 'p3' && passed },
  { id: 'night', icon: '🌙', titleKey: 'aVNightTitle', descKey: 'aVNightDesc', check: (_p, _r, stage, passed) => stage.id === 'p4' && passed },
  { id: 'spoof', icon: '🛡️', titleKey: 'aVSpoofTitle', descKey: 'aVSpoofDesc', check: (_p, r) => raw(r).uses.has('depth') && photoRight(r, 'poster') === true },
]

/** Runs a puzzle's photos. Exposed for tests. */
export const runPuzzle = (p: Step[], puzzle: string) => runVision(p, PUZZLE_PHOTOS[puzzle] ?? PUZZLE_PHOTOS.sandbox)
