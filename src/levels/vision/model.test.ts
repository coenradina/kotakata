import { describe, expect, it } from 'vitest'
import { PHOTOS, PUZZLE_PHOTOS, autoExposure, runVision, type PhotoId, type Step } from './model'
import { VISION_STAGES, runPuzzle } from './stages'
import { chooseVisionHint } from './hints'
import type { Run } from '../types'

let n = 0
const dark = (below: number): Step => ({ kind: 'dark', below, id: `d${n++}` })
const edges = (over: number): Step => ({ kind: 'edges', over, id: `e${n++}` })
const s = (kind: 'inside' | 'pair' | 'exposure' | 'depth' | 'glasses' | 'hat'): Step => ({ kind, id: `${kind}${n++}` }) as Step

const glasses = s('glasses')
const P2 = [dark(2), edges(1), s('inside'), glasses]
const P3 = [dark(2), edges(1), s('inside'), s('pair'), glasses]
const P4 = [s('exposure'), ...P3]
const P5 = [s('exposure'), dark(2), edges(1), s('depth'), s('inside'), s('pair'), glasses]

const right = (p: Step[], puzzle: string) => runPuzzle(p, puzzle).right
const total = (puzzle: string) => PUZZLE_PHOTOS[puzzle].length
const asRun = (p: Step[], puzzle: string) => {
  const raw = runPuzzle(p, puzzle)
  return { raw, events: [raw], accuracy: null, passed: false, context: null } as Run
}
const stage = (id: string) => VISION_STAGES.find((x) => x.id === id)!

describe('the photos', () => {
  it('are 12 by 12 numbers from 0 to 9', () => {
    for (const p of Object.values(PHOTOS)) {
      expect(p.brightness).toHaveLength(12)
      for (const row of p.brightness) for (const v of row) expect(v).toBeGreaterThanOrEqual(0), expect(v).toBeLessThanOrEqual(9)
    }
  })
  it('auto brightness stretches a dark photo back to 0 to 9', () => {
    const flat = autoExposure(PHOTOS.dindaDark.brightness).flat()
    expect(Math.min(...flat)).toBe(0)
    expect(Math.max(...flat)).toBe(9)
  })
})

describe('Session 2 balance', () => {
  it('P1: only a low threshold marks just the eyes', () => {
    expect(right([dark(1), glasses], 'p1')).toBe(1)
    expect(right([dark(2), glasses], 'p1')).toBe(1)
    expect(right([dark(3), glasses], 'p1')).toBe(0)
    expect(right([dark(4), glasses], 'p1')).toBe(0)
  })
  it('P2: the wall dots fool a plain threshold; the face outline fixes it', () => {
    expect(right([dark(2), glasses], 'p2')).toBeLessThan(2)
    expect(right(P2, 'p2')).toBe(2)
    expect(right([dark(2), edges(3), s('inside'), glasses], 'p2')).toBeLessThan(2)
  })
  it('P3: the mole breaks the stage-2 filter; pairs fix it, but only below 2', () => {
    expect(right(P2, 'p3')).toBeLessThan(total('p3'))
    expect(right(P3, 'p3')).toBe(total('p3'))
    expect(right([dark(4), edges(1), s('inside'), s('pair'), glasses], 'p3')).toBeLessThan(total('p3'))
  })
  it('P4: the dark room breaks the P3 filter; auto brightness first fixes it', () => {
    expect(right(P3, 'p4')).toBeLessThan(total('p4'))
    expect(right(P4, 'p4')).toBe(total('p4'))
    // Placed after the threshold, it comes too late.
    expect(right([dark(2), s('exposure'), edges(1), s('inside'), s('pair'), glasses], 'p4')).toBeLessThan(total('p4'))
  })
  it('P5: the poster fools the camera alone; the depth sensor is not fooled', () => {
    const r = runPuzzle(P4, 'p5')
    expect(r.photos.find((p) => p.photo === 'poster')!.right).toBe(false)
    expect(right(P5, 'p5')).toBe(total('p5'))
  })
  it('Sandbox: a hat from the edges falls for the poster; one from depth fits everyone', () => {
    expect(right([s('exposure'), edges(1), s('hat')], 'sandbox')).toBeLessThan(total('sandbox'))
    expect(right([s('depth'), s('hat')], 'sandbox')).toBe(total('sandbox'))
    expect(right(P5, 'sandbox')).toBe(total('sandbox'))
  })
  it('says what is missing', () => {
    expect(runVision([dark(2)], ['dinda']).missing).toContain('action')
    expect(runVision([dark(2), s('inside'), glasses], ['dinda']).missing).toContain('region')
  })
})

describe('Session 2 puzzles', () => {
  it('pass exactly when every photo is right', () => {
    const programs: Record<string, Step[]> = { p1: [dark(2), glasses], p2: P2, p3: P3, p4: P4, p5: P5, sandbox: [s('depth'), s('hat')] }
    for (const st of VISION_STAGES) {
      expect(st.check(programs[st.id], asRun(programs[st.id], st.id)), st.id).toBe(true)
      expect(st.check([dark(4), glasses], asRun([dark(4), glasses], st.id)), st.id).toBe(false)
    }
  })
  it('sandbox needs the hat', () => {
    expect(stage('sandbox').check(P5, asRun(P5, 'sandbox'))).toBe(false)
  })
  it('each prediction is answered by the demo program the stage loads', () => {
    expect(stage('p3').prediction!.outcome(P2, asRun(P2, 'p3'))).toBe(1)
    expect(stage('p4').prediction!.outcome(P3, asRun(P3, 'p4'))).toBe(1)
    expect(stage('p5').prediction!.outcome(P4, asRun(P4, 'p5'))).toBe(0)
    expect(stage('p5').prediction!.outcome(P5, asRun(P5, 'p5'))).toBe(1)
  })
  it('fail lines name the missing piece', () => {
    expect(stage('p1').failKey([dark(2)], asRun([dark(2)], 'p1'))).toBe('vFailNoAction')
    expect(stage('p2').failKey([dark(2), s('inside'), glasses], asRun([dark(2), s('inside'), glasses], 'p2'))).toBe('vFailRegion')
    expect(stage('p3').failKey(P2, asRun(P2, 'p3'))).toBe('vFail')
  })
})

describe('Session 2 hints point at the next fix', () => {
  const hint = (p: Step[] | null, puzzle: string) => chooseVisionHint(p, p ? runPuzzle(p, puzzle) : null, puzzle)?.key
  it('follows the arc', () => {
    expect(hint(null, 'p1')).toBe('v_start')
    expect(hint([dark(3)], 'p1')).toBe('v_action')
    expect(hint([dark(3), glasses], 'p1')).toBe('v_darker')
    expect(hint([dark(2), glasses], 'p2')).toBe('v_edges')
    expect(hint([dark(2), edges(3), s('inside'), glasses], 'p2')).toBe('v_edgeLevel')
    expect(hint(P2, 'p3')).toBe('v_pair')
    expect(hint(P3, 'p4')).toBe('v_exposure')
    expect(hint(P4, 'p5')).toBe('v_depth')
    expect(hint(P5, 'sandbox')).toBe('v_hat')
  })
})

describe('rung-3 examples pass their puzzles, Session 2', () => {
  // The programs the xV* texts describe.
  const examples: Record<string, Step[]> = { p1: [dark(2), glasses], p2: P2, p3: P3, p4: P4, p5: P5, sandbox: [s('depth'), s('hat')] }
  for (const st of VISION_STAGES)
    it(st.id, () => {
      expect(st.check(examples[st.id], asRun(examples[st.id], st.id))).toBe(true)
    })
  it('covers every puzzle photo set', () => {
    for (const id of Object.keys(PUZZLE_PHOTOS)) expect(Object.keys(examples)).toContain(id)
    expect(Object.keys(PHOTOS) as PhotoId[]).toHaveLength(8)
  })
})
