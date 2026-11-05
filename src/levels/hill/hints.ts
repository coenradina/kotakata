import { palette, type Hint } from '../../hints'
import { overshot, type HillResult, type Step } from './model'
import { STAGE_SETUP } from './stages'

const field = (type: string, name: string, blockId?: string) => ({ where: 'field' as const, type, field: name, blockId })

/** From "nothing to run" to "ran but didn't land in the valley". */
export function chooseHillHint(program: Step[] | null, result: HillResult | null, stage = 'gentle'): Hint | null {
  if (program === null) return { key: 'start', target: palette('kk_when_run') }
  const lrBlocks = program.filter((s) => s.kind === 'lr')
  const stepBlocks = program.filter((s) => s.kind === 'steps')
  const lastLr = lrBlocks.at(-1)
  if (stepBlocks.length === 0) return { key: 'hillAddSteps', target: palette('kk_steps') }
  if (lrBlocks.length === 0 || program.findIndex((s) => s.kind === 'lr') > program.findIndex((s) => s.kind === 'steps')) {
    return { key: 'hillAddLr', target: palette('kk_lr') }
  }
  if (!result) return null

  const { budget } = STAGE_SETUP[stage] ?? STAGE_SETUP.gentle
  const lrField = field('kk_lr', 'LR', lastLr?.id)
  if (result.flewOff) return { key: 'hillTooBig', target: lrField }
  if (stage === 'one') return { key: 'hillOneStep', target: lrField }
  const totalSteps = stepBlocks.reduce((n, s) => n + (s.kind === 'steps' ? s.n : 0), 0)
  // Bouncing back and forth without settling: the learning rate is too big
  if (overshot(result) && Math.abs(result.finalX) > Math.abs(result.moves.at(-1)?.from ?? 0) * 0.5) {
    return { key: 'hillBounce', target: lrField }
  }
  if (result.tired || totalSteps >= budget) return { key: 'hillTooSmall', target: lrField }
  return { key: 'hillMoreSteps', target: field('kk_steps', 'N', stepBlocks.at(-1)?.id) }
}
