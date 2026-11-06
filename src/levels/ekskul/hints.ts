import { palette, type Hint } from '../../hints'
import { asks, splitsOf, type EkskulResult, type Program, type Tree } from './model'

const askField = (blockId: string): Hint['target'] => ({ where: 'field', type: 'kk_e_ask', field: 'Q', blockId })

function emptySplit(tree: Tree | null): Extract<Tree, { kind: 'split' }> | null {
  if (!tree || tree.kind === 'leaf') return null
  if (!tree.yes || !tree.no) return tree
  return emptySplit(tree.yes) ?? emptySplit(tree.no)
}

/** The pointer for a failed Session 4 run (hint rungs 2 and 3). */
export function chooseEkskulHint(program: Program | null, result: EkskulResult | null, puzzle: string): Hint | null {
  if (program === null) return { key: 'e_start', target: palette('kk_when_run') }
  const tree = result?.tree ?? program.tree
  if (puzzle === 'sandbox' && program.learn) return { key: 'e_hand', target: palette('kk_e_ask', { Q: 'build' }) }
  if (!tree) return puzzle === 'p1' || puzzle === 'p2' || puzzle === 'sandbox' ? { key: 'e_start', target: palette('kk_e_ask', { Q: 'team' }) } : { key: 'e_learn', target: palette('kk_e_learn') }
  if (!program.learn) {
    const empty = emptySplit(tree)
    if (empty) return { key: 'e_empty', target: palette('kk_e_rec') }
  }
  if (puzzle === 'p2') {
    const dinda = result?.test.find((w) => w.student.id === 'dinda')
    if (dinda && !dinda.right && tree.kind === 'split') return { key: 'e_reorder', target: askField(tree.id) }
    if (!program.explain.includes('dinda')) return { key: 'e_explain', target: palette('kk_e_explain', { WHO: 'dinda' }) }
    return null
  }
  if (puzzle === 'p3' && !program.learn) return { key: 'e_learn', target: palette('kk_e_learn') }
  if ((puzzle === 'p4' || puzzle === 'sandbox') && asks(tree, 'classA')) return program.learn ? { key: 'e_ignore', target: palette('kk_e_ignore', { Q: 'classA' }) } : { key: 'e_root', target: askField(tree.kind === 'split' ? tree.id : '') }
  if (puzzle === 'p5' && program.learn) {
    if (program.maxDepth === null) return { key: 'e_depth', target: palette('kk_e_depth') }
    return { key: 'e_depthLower', target: { where: 'field', type: 'kk_e_depth', field: 'N', blockId: program.ids.depth } }
  }
  if (puzzle === 'sandbox' && splitsOf(tree) > 2 && tree.kind === 'split') return { key: 'e_root', target: askField(tree.id) }
  if (tree.kind === 'split' && !program.learn) return { key: 'e_root', target: askField(tree.id) }
  return null
}
