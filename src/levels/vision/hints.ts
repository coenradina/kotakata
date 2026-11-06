import { palette, type Hint } from '../../hints'
import type { Step, VisionResult } from './model'

const field = (type: string, f: string, blockId: string): Hint['target'] => ({ where: 'field', type, field: f, blockId })

/** The pointer for a failed Session 2 run (hint rungs 2 and 3). */
export function chooseVisionHint(program: Step[] | null, result: VisionResult | null, puzzle: string): Hint | null {
  if (program === null) return { key: 'v_start', target: palette('kk_when_run') }
  const find = <K extends Step['kind']>(k: K) => program.find((s): s is Extract<Step, { kind: K }> => s.kind === k)
  const dark = find('dark')
  const edges = find('edges')
  if (puzzle === 'sandbox') {
    if (!find('hat')) return { key: 'v_hat', target: palette('kk_v_hat') }
    return { key: 'v_depth', target: palette('kk_v_depth') }
  }
  if (!find('glasses')) return { key: 'v_action', target: palette('kk_v_glasses') }
  if (!dark) return { key: 'v_dark', target: palette('kk_v_dark') }
  const fails = (id: string) => result?.photos.some((p) => p.photo === id && !p.right)
  if (puzzle === 'p1' || dark.below > 2) return { key: 'v_darker', target: field('kk_v_dark', 'N', dark.id) }
  if (!edges && !find('depth')) return { key: 'v_edges', target: palette('kk_v_edges') }
  if (edges && edges.over > 1 && puzzle !== 'p5') return { key: 'v_edgeLevel', target: field('kk_v_edges', 'N', edges.id) }
  if (!find('inside')) return { key: 'v_inside', target: palette('kk_v_inside') }
  if (puzzle === 'p2') return { key: 'v_inside', target: palette('kk_v_inside') }
  if (!find('pair')) return { key: 'v_pair', target: palette('kk_v_pair') }
  if ((fails('dindaDark') || fails('bimoDark')) && !find('exposure')) return { key: 'v_exposure', target: palette('kk_v_exposure') }
  if (!find('depth')) return { key: 'v_depth', target: palette('kk_v_depth') }
  return { key: 'v_exposure', target: palette('kk_v_exposure') }
}
