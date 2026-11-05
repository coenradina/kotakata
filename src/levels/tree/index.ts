import { TreeScene } from '../../game/TreeScene'
import { LEVEL2_CARDS } from '../../i18n'
import type { Level } from '../types'
import { STAGE_CRITTERS, TREE_ACHIEVEMENTS, TREE_STAGES, type TreeRun } from './stages'
import { TREE_STARTER, readTreeProgram, treeToolbox, type TreeProgram } from './blocks'
import { chooseTreeHint } from './hints'
import { runTree } from './model'

export const treeLevel: Level<TreeProgram> = {
  id: 'tree',
  title: { id: 'Taman Decision Tree', en: 'Decision Tree Garden' },
  topic: { id: 'Pohon pertanyaan (Decision tree)', en: 'Decision trees' },
  fileKey: 'l2Title',
  cards: LEVEL2_CARDS,
  winKey: 'winBodyTree',
  winCard: 'decisionTree',
  storageKey: 'kotakata.level2.blocks',
  toolbox: treeToolbox,
  starter: TREE_STARTER,
  read: readTreeProgram,
  isEmpty: (p) => p.tree === null,
  stages: TREE_STAGES,
  // Stage 1 has only bees and frogs; stage 2 and the bonus have everyone.
  runGroup: (stage) => (stage === 'pair' ? 'pair' : 'all'),
  achievements: TREE_ACHIEVEMENTS,
  run: (p, seed, stage): TreeRun => {
    const raw = runTree(p.tree!, seed, STAGE_CRITTERS[stage] ?? STAGE_CRITTERS.all)
    const correct = raw.walks.filter((w) => w.correct).length
    return {
      raw,
      // The scene draws the tree first, then plays the walks.
      events: [{ kind: 'tree', tree: p.tree }, ...raw.events],
      accuracy: raw.accuracy,
      passed: raw.passed,
      context: { correct, total: raw.walks.length },
    }
  },
  hint: (p, r, stage) => chooseTreeHint(p, r ? (r as TreeRun).raw : null, stage, STAGE_CRITTERS[stage]),
  createScene: () => new TreeScene(),
  previewData: (p) => p?.tree ?? null,
}
