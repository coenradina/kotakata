import { describe, expect, it } from 'vitest'
import { chooseHillHint } from './hints'
import { runHill, type Step } from './model'
import { STAGE_SETUP } from './stages'

const lr = (value: number): Step => ({ kind: 'lr', value, id: `lr${value}` })
const steps = (n: number): Step => ({ kind: 'steps', n, id: `s${n}` })
const hintFor = (program: Step[], stage: string) => {
  const { hill, budget } = STAGE_SETUP[stage]
  return chooseHillHint(program, runHill(program, hill, budget), stage)?.key
}

describe('hill hints', () => {
  it('asks for steps, then a learning rate above them', () => {
    expect(chooseHillHint(null, null)?.key).toBe('start')
    expect(hintFor([lr(0.1)], 'gentle')).toBe('hillAddSteps')
    expect(hintFor([steps(3)], 'gentle')).toBe('hillAddLr')
    expect(hintFor([steps(3), lr(0.1)], 'gentle')).toBe('hillAddLr')
  })

  it('asks for more steps when there is energy left', () => {
    const h = chooseHillHint([lr(0.1), steps(3)], runHill([lr(0.1), steps(3)], 'gentle', 30), 'gentle')
    expect(h?.key).toBe('hillMoreSteps')
    expect(h?.target).toMatchObject({ where: 'field', field: 'N', blockId: 's3' })
  })

  it('asks for a bigger learning rate when energy runs out', () => {
    expect(hintFor([lr(0.1), steps(10)], 'short')).toBe('hillTooSmall')
  })

  it('asks for a smaller learning rate when the robot flies off or bounces', () => {
    expect(hintFor([lr(1.1), steps(10)], 'gentle')).toBe('hillTooBig')
    expect(hintFor([lr(0.4), steps(10)], 'steep')).toBe('hillBounce')
  })
})
