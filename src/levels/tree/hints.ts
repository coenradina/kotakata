import { palette, type Hint } from '../../hints'
import { CRITTERS, pensUsed, type Tree, type TreeResult } from './model'
import type { TreeProgram } from './blocks'

const PEN_HINT = { bird: 'treePenBird', bee: 'treePenBee', frog: 'treePenFrog' } as const

/** The first split (depth-first) that has an empty branch. */
function emptySplit(tree: Tree | null): Tree | null {
  if (!tree || tree.kind === 'leaf') return null
  if (!tree.yes || !tree.no) return tree
  return emptySplit(tree.yes) ?? emptySplit(tree.no)
}

function findSplit(tree: Tree | null, test: (t: Extract<Tree, { kind: 'split' }>) => boolean): Extract<Tree, { kind: 'split' }> | null {
  if (!tree || tree.kind === 'leaf') return null
  if (test(tree)) return tree
  return findSplit(tree.yes, test) ?? findSplit(tree.no, test)
}

const askField = (id: string) => ({ where: 'field' as const, type: 'kk_ask', field: 'Q', blockId: id })

/** From "nothing there yet" to "ran but sorted some wrong". */
export function chooseTreeHint(program: TreeProgram | null, result: TreeResult | null): Hint | null {
  if (program === null) return { key: 'start', target: palette('kk_when_run') }
  if (result?.passed) return null
  const tree = program.tree
  if (!tree) return { key: 'treeStart', target: palette('kk_ask', { Q: 'wings' }) }
  if (tree.kind === 'leaf') return { key: 'treeAsk', target: palette('kk_ask', { Q: 'wings' }) }

  const empty = emptySplit(tree)
  if (empty) return { key: 'treeEmpty', target: askField(empty.id) }

  const missing = CRITTERS.find((c) => !pensUsed(tree).has(c))
  if (missing) return { key: PEN_HINT[missing], target: palette('kk_pen', { PEN: missing }) }

  if (!result) return null
  // Point at the question that sent a critter the wrong way first.
  const wrong = result.walks.find((w) => !w.correct)
  const colour = findSplit(tree, (s) => s.q === 'green' || s.q === 'yellow' || s.q === 'brown')
  if (colour) return { key: 'treeColour', target: askField(colour.id) }
  if (wrong && tree.q === 'big') return { key: 'treeBig', target: askField(tree.id) }
  return { key: 'treeCheck', target: askField(tree.id) }
}
