import type { BadgeDef, Run, Puzzle } from '../types'
import type { TreeProgram } from './blocks'
import { depth, pensUsed, splitStats, type Critter, type TreeResult } from './model'

export type TreeRun = Run & { raw: TreeResult }
const raw = (r: Run) => (r as TreeRun).raw

/** Who visits the garden in each stage. */
export const STAGE_CRITTERS: Record<string, Critter[]> = {
  pair: ['bee', 'frog'],
  all: ['bird', 'bee', 'frog'],
  lean: ['bird', 'bee', 'frog'],
}

const lean = (p: TreeProgram) => {
  const s = splitStats(p.tree)
  return s.splits <= 2 && !s.colour
}

export const TREE_STAGES: Puzzle<TreeProgram>[] = [
  { id: 'pair', nudgeKey: 'nTreePair', exampleKey: 'xTreePair', beat: 'introduce', firstRunTarget: 0.7, titleKey: 's2PairTitle', missionKey: 's2PairMission', check: (_p, r) => raw(r).passed, failKey: () => 'tryAgainTree' },
  {
    id: 'all',
    nudgeKey: 'nTreeAll',
    exampleKey: 'xTreeAll',
    beat: 'twist',
    firstRunTarget: 0.4,
    titleKey: 's2AllTitle',
    missionKey: 's2AllMission',
    check: (_p, r) => raw(r).passed,
    failKey: () => 'tryAgainTree',
    prediction: {
      questionKey: 'pTreeQ',
      choices: ['pTreeAll', 'pTreeMost', 'pTreeFew'],
      outcome: (_p, r) => (r.accuracy === null ? null : r.accuracy >= 1 ? 0 : r.accuracy >= 2 / 3 ? 1 : 2),
    },
  },
  {
    id: 'lean',
    nudgeKey: 'nTreeLean',
    exampleKey: 'xTreeLean',
    beat: 'sandbox',
    firstRunTarget: 0.3,
    titleKey: 's2LeanTitle',
    missionKey: 's2LeanMission',
    bonus: true,
    check: (p, r) => raw(r).passed && lean(p),
    failKey: (_p, r) => (raw(r).passed ? 'stageLeanFail' : 'tryAgainTree'),
  },
]

export const TREE_ACHIEVEMENTS: BadgeDef<TreeProgram>[] = [
  {
    id: 'firstSplit',
    icon: '🌱',
    titleKey: 'aFirstSplitTitle',
    descKey: 'aFirstSplitDesc',
    check: (_p, _r, stage, passed) => stage.id === 'pair' && passed,
  },
  {
    id: 'allPens',
    icon: '🏡',
    titleKey: 'aAllPensTitle',
    descKey: 'aAllPensDesc',
    check: (p) => pensUsed(p.tree).size === 3,
  },
  {
    id: 'nested',
    icon: '🌳',
    titleKey: 'aNestedTitle',
    descKey: 'aNestedDesc',
    check: (p) => depth(p.tree) >= 2,
  },
  {
    id: 'noTrap',
    icon: '🔍',
    titleKey: 'aNoTrapTitle',
    descKey: 'aNoTrapDesc',
    check: (p, r, stage) => stage.id !== 'pair' && raw(r).passed && !splitStats(p.tree).colour,
  },
  {
    id: 'lean',
    icon: '✨',
    titleKey: 'aLeanTitle',
    descKey: 'aLeanDesc',
    check: (_p, _r, stage, passed) => stage.id === 'lean' && passed,
  },
]
