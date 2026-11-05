import { TreeScene } from '../../game/TreeScene'
import { LEVEL2_CARDS } from '../../i18n'
import type { Level, LevelRun } from '../types'
import { TREE_STARTER, readTreeProgram, treeToolbox, type TreeProgram } from './blocks'
import { chooseTreeHint } from './hints'
import { runTree, type TreeResult } from './model'

type TreeRun = LevelRun & { raw: TreeResult }

export const treeLevel: Level<TreeProgram> = {
  id: 'tree',
  title: { id: 'Taman Decision Tree', en: 'Decision Tree Garden' },
  topic: 'Decision trees',
  fileKey: 'l2Title',
  missionKey: 'l2Mission',
  cards: LEVEL2_CARDS,
  winKey: 'winBodyTree',
  winCard: 'decisionTree',
  storageKey: 'kotakata.level2.blocks',
  toolbox: treeToolbox,
  starter: TREE_STARTER,
  read: readTreeProgram,
  isEmpty: (p) => p.tree === null,
  run: (p, seed): TreeRun => {
    const raw = runTree(p.tree!, seed)
    const correct = raw.walks.filter((w) => w.correct).length
    return {
      raw,
      // The scene draws the tree first, then plays the walks.
      events: [{ kind: 'tree', tree: p.tree }, ...raw.events],
      accuracy: raw.accuracy,
      passed: raw.passed,
      context: { correct, total: raw.walks.length },
      failKey: raw.passed ? null : 'tryAgainTree',
    }
  },
  hint: (p, r) => chooseTreeHint(p, r ? (r as TreeRun).raw : null),
  createScene: () => new TreeScene(),
  previewData: (p) => p?.tree ?? null,
}
