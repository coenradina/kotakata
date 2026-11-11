import type { BadgeDef, Puzzle, Run } from '../types'
import { asks, runEkskul, splitsOf, type EkskulResult, type Program } from './model'
import { ekskulProgram, type Node } from './program'

export type EkskulRun = Run & { raw: EkskulResult }
const raw = (r: Run) => (r as EkskulRun).raw
const allTest = (r: Run) => raw(r).testRight === raw(r).test.length
const allTrain = (r: Run) => raw(r).trainRight === raw(r).train.length
const dindaRight = (r: Run) => raw(r).test.find((w) => w.student.id === 'dinda')?.right === true
const testVars = (_p: Program, r: Run) => ({ n: raw(r).testRight, total: raw(r).test.length })

/** The first thing wrong with a program that can't be judged yet. */
const broken = (r: Run) => (!raw(r).tree ? 'eFailNoTree' : raw(r).emptyBranch ? 'eFailEmpty' : null)

/** Kata's first tree: music first, which sends Dinda to choir. */
const MUSIC_FIRST: Node = { ask: 'music', yes: { rec: 'choir' }, no: { ask: 'team', yes: { rec: 'basket' }, no: { rec: 'robot' } } }
/** The usual stage 2 fix: team sports first. Robotics fans who like team games break it. */
const TEAM_FIRST: Node = { ask: 'team', yes: { rec: 'basket' }, no: { ask: 'music', yes: { rec: 'choir' }, no: { rec: 'robot' } } }
const LEARN = ekskulProgram([['kk_e_learn']])

export const EKSKUL_STAGES: Puzzle<Program>[] = [
  {
    id: 'p1',
    beat: 'introduce',
    firstRunTarget: 0.6,
    nudgeKey: 'nE1',
    exampleKey: 'xE1',
    titleKey: 's4e1Title',
    missionKey: 's4e1Mission',
    clearKey: 's4e1Clear',
    check: (_p, r) => !broken(r) && allTrain(r),
    failKey: (_p, r) => broken(r) ?? 'eFailTrain',
    failVars: (_p, r) => ({ n: raw(r).trainRight, total: raw(r).train.length }),
  },
  {
    id: 'p2',
    beat: 'develop',
    firstRunTarget: 0.4,
    nudgeKey: 'nE2',
    exampleKey: 'xE2',
    titleKey: 's4e2Title',
    missionKey: 's4e2Mission',
    clearKey: 's4e2Clear',
    demo: { blocks: ekskulProgram([['kk_e_explain', { WHO: 'dinda' }]], MUSIC_FIRST), messageKey: 'demoE2' },
    check: (p, r) => !broken(r) && allTrain(r) && dindaRight(r) && p.explain.includes('dinda'),
    failKey: (p, r) => broken(r) ?? (!allTrain(r) ? 'eFailTrain' : !dindaRight(r) ? 'eFailTest' : p.explain.includes('dinda') ? null : 'eFailExplain'),
    failVars: (_p, r) => (allTrain(r) ? testVars(_p, r) : { n: raw(r).trainRight, total: raw(r).train.length }),
  },
  {
    id: 'p3',
    beat: 'twist',
    firstRunTarget: 0.35,
    nudgeKey: 'nE3',
    exampleKey: 'xE3',
    titleKey: 's4e3Title',
    missionKey: 's4e3Mission',
    clearKey: 's4e3Clear',
    demo: { blocks: ekskulProgram([], TEAM_FIRST), messageKey: 'demoE3', autoRun: false },
    prediction: { questionKey: 'pE3Q', choices: ['pE3Yes', 'pE3No'], outcome: (_p, r) => (allTest(r) ? 0 : 1) },
    check: (_p, r) => !broken(r) && allTest(r),
    failKey: (_p, r) => broken(r) ?? 'eFailTest',
    failVars: testVars,
  },
  {
    id: 'p4',
    beat: 'twist',
    firstRunTarget: 0.3,
    nudgeKey: 'nE4',
    exampleKey: 'xE4',
    titleKey: 's4e4Title',
    missionKey: 's4e4Mission',
    clearKey: 's4e4Clear',
    demo: { blocks: LEARN, messageKey: 'demoE4', autoRun: false },
    // Fair to class B means every class B student got what they wanted.
    prediction: { questionKey: 'pE4Q', choices: ['pE4Yes', 'pE4No'], outcome: (_p, r) => (raw(r).test.filter((w) => !w.student.answers.classA).every((w) => w.right) ? 0 : 1) },
    check: (_p, r) => !broken(r) && allTest(r) && !asks(raw(r).tree, 'classA'),
    failKey: (_p, r) => broken(r) ?? (allTest(r) ? 'eFailClass' : 'eFailTest'),
    failVars: testVars,
  },
  {
    id: 'p5',
    beat: 'develop',
    firstRunTarget: 0.35,
    nudgeKey: 'nE5',
    exampleKey: 'xE5',
    titleKey: 's4e5Title',
    missionKey: 's4e5Mission',
    clearKey: 's4e5Clear',
    demo: { blocks: LEARN, messageKey: 'demoE5', autoRun: false },
    prediction: { questionKey: 'pE5Q', choices: ['pE5Yes', 'pE5No'], outcome: (_p, r) => (allTest(r) ? 0 : 1) },
    check: (_p, r) => !broken(r) && allTest(r),
    failKey: (_p, r) => broken(r) ?? 'eFailTest',
    failVars: testVars,
  },
  {
    id: 'sandbox',
    beat: 'sandbox',
    bonus: true,
    firstRunTarget: 0.4,
    nudgeKey: 'nESandbox',
    exampleKey: 'xESandbox',
    titleKey: 's4eSandboxTitle',
    missionKey: 's4eSandboxMission',
    check: (p, r) => !p.learn && !broken(r) && splitsOf(raw(r).tree) <= 2 && !asks(raw(r).tree, 'classA') && allTest(r),
    failKey: (p, r) =>
      p.learn ? 'eFailLearnSandbox' : (broken(r) ?? (splitsOf(raw(r).tree) > 2 ? 'eFailLong' : asks(raw(r).tree, 'classA') ? 'eFailClass' : 'eFailTest')),
    failVars: (p, r) => ({ ...testVars(p, r), n: splitsOf(raw(r).tree) > 2 ? splitsOf(raw(r).tree) : raw(r).testRight }),
  },
]

export const EKSKUL_BADGES: BadgeDef<Program>[] = [
  { id: 'first', icon: '🌳', titleKey: 'aEFirstTitle', descKey: 'aEFirstDesc', check: (_p, _r, stage, passed) => stage.id === 'p1' && passed },
  { id: 'why', icon: '💬', titleKey: 'aEWhyTitle', descKey: 'aEWhyDesc', check: (p, r) => p.explain.includes('dinda') && dindaRight(r) },
  { id: 'learn', icon: '🌱', titleKey: 'aELearnTitle', descKey: 'aELearnDesc', check: (p, _r, stage, passed) => stage.id === 'p3' && passed && p.learn },
  { id: 'fair', icon: '⚖️', titleKey: 'aEFairTitle', descKey: 'aEFairDesc', check: (_p, _r, stage, passed) => stage.id === 'p4' && passed },
  { id: 'prune', icon: '✂️', titleKey: 'aEPruneTitle', descKey: 'aEPruneDesc', check: (p, _r, stage, passed) => stage.id === 'p5' && passed && p.maxDepth !== null },
]

/** Runs a puzzle. Exposed for tests. */
export const runPuzzle = (p: Program, puzzle: string) => runEkskul(p, puzzle)
