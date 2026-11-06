import { describe, expect, it } from 'vitest'
import { EMPTY, NEW, PAST, PAST_BIASED, PAST_NOISY, learnTree, wants, type Ekskul, type Feature, type Program, type Tree } from './model'
import { EKSKUL_STAGES, runPuzzle } from './stages'
import { chooseEkskulHint } from './hints'
import type { Run } from '../types'

let n = 0
type N = { ask: Feature; yes: N; no: N } | { rec: Ekskul }
const tree = (x: N): Tree => ('rec' in x ? { kind: 'leaf', id: `l${n++}`, ekskul: x.rec } : { kind: 'split', id: `s${n++}`, q: x.ask, yes: tree(x.yes), no: tree(x.no) })
const hand = (x: N, more: Partial<Program> = {}): Program => ({ ...EMPTY, tree: tree(x), ...more })
const learn = (more: Partial<Program> = {}): Program => ({ ...EMPTY, learn: true, ...more })

const MUSIC_FIRST: N = { ask: 'music', yes: { rec: 'choir' }, no: { ask: 'team', yes: { rec: 'basket' }, no: { rec: 'robot' } } }
const TEAM_FIRST: N = { ask: 'team', yes: { rec: 'basket' }, no: { ask: 'music', yes: { rec: 'choir' }, no: { rec: 'robot' } } }
const BEST: N = { ask: 'build', yes: { rec: 'robot' }, no: { ask: 'team', yes: { rec: 'basket' }, no: { rec: 'choir' } } }
const CLASS: N = { ask: 'classA', yes: { rec: 'basket' }, no: { ask: 'build', yes: { rec: 'robot' }, no: { rec: 'choir' } } }

const asRun = (p: Program, puzzle: string) => {
  const raw = runPuzzle(p, puzzle)
  return { raw, events: [raw], accuracy: null, passed: false, context: null } as Run
}
const stage = (id: string) => EKSKUL_STAGES.find((s) => s.id === id)!
const passes = (p: Program, puzzle: string) => stage(puzzle).check(p, asRun(p, puzzle))
const test = (p: Program, puzzle: string) => runPuzzle(p, puzzle).testRight

describe('the data', () => {
  it('has 24 past members, 10 basketball, 7 choir, 7 robotics', () => {
    expect(PAST).toHaveLength(24)
    expect(PAST.filter((s) => s.ekskul === 'basket')).toHaveLength(10)
    expect(PAST.filter((s) => s.ekskul === 'choir')).toHaveLength(7)
  })
  it('new students want what their answers say', () => {
    for (const s of NEW) expect(s.ekskul).toBe(wants(s.answers))
  })
  it('the biased year put every basketball member, and only them, in class A', () => {
    for (const s of PAST_BIASED) expect(s.answers.classA).toBe(s.ekskul === 'basket')
  })
  it('the noisy year adds six members who followed friends', () => {
    expect(PAST_NOISY.filter((s) => s.ekskul !== wants(s.answers))).toHaveLength(6)
  })
})

describe('the learner', () => {
  it('asks about building first on clean data', () => {
    const { tree: t } = learnTree(PAST, ['music', 'team', 'build', 'after'])
    expect(t.kind === 'split' && t.q).toBe('build')
  })
  it('asks about class first on the biased year', () => {
    const { tree: t, choices } = learnTree(PAST_BIASED, ['music', 'team', 'build', 'after', 'classA'])
    expect(t.kind === 'split' && t.q).toBe('classA')
    expect(choices[0].scores.length).toBe(5)
  })
})

describe('Session 4 balance', () => {
  it('P1: the music-first tree and the best tree both fit the six students', () => {
    expect(passes(hand(MUSIC_FIRST), 'p1')).toBe(true)
    expect(passes(hand(BEST), 'p1')).toBe(true)
    expect(passes(hand({ ask: 'music', yes: { rec: 'choir' }, no: { rec: 'basket' } }), 'p1')).toBe(false)
  })
  it('P2: music first sends Dinda to choir; team first fixes her, with the explanation', () => {
    expect(test(hand(MUSIC_FIRST), 'p2')).toBe(0)
    expect(passes(hand(TEAM_FIRST, { explain: ['dinda'] }), 'p2')).toBe(true)
    expect(passes(hand(TEAM_FIRST), 'p2')).toBe(false)
    expect(stage('p2').failKey(hand(TEAM_FIRST), asRun(hand(TEAM_FIRST), 'p2'))).toBe('eFailExplain')
  })
  it('P3: the stage 2 tree breaks on robotics fans who like team games; learning fixes it', () => {
    expect(test(hand(TEAM_FIRST), 'p3')).toBeLessThan(8)
    expect(passes(learn(), 'p3')).toBe(true)
    expect(passes(hand(BEST), 'p3')).toBe(true)
  })
  it('P4: the biased year teaches Kata to ask about class; banning the question fixes it', () => {
    expect(test(learn(), 'p4')).toBeLessThanOrEqual(2)
    expect(passes(learn({ ignore: ['classA'] }), 'p4')).toBe(true)
    expect(passes(hand(CLASS), 'p4')).toBe(false)
  })
  it('P5: the full tree memorises the friend-followers; only a depth of 2 fits everyone', () => {
    const full = runPuzzle(learn(), 'p5')
    expect(full.trainRight / full.train.length).toBeGreaterThanOrEqual(0.9)
    expect(full.testRight).toBeLessThan(8)
    expect(passes(learn({ maxDepth: 2 }), 'p5')).toBe(true)
    expect(passes(learn({ maxDepth: 3 }), 'p5')).toBe(false)
    expect(passes(learn({ maxDepth: 4 }), 'p5')).toBe(false)
    expect(passes(learn({ maxDepth: 1 }), 'p5')).toBe(false)
    // Banning class alone isn't the fix this time.
    expect(passes(learn({ ignore: ['classA'] }), 'p5')).toBe(false)
  })
  it('Sandbox: a two-question hand tree beats Kata; learning or a long tree does not count', () => {
    expect(passes(hand(BEST), 'sandbox')).toBe(true)
    expect(passes(learn({ maxDepth: 2 }), 'sandbox')).toBe(false)
    expect(passes(hand(TEAM_FIRST), 'sandbox')).toBe(false)
  })
})

describe('Session 4 predictions', () => {
  it('each is answered by the demo program the stage loads', () => {
    expect(stage('p3').prediction!.outcome(hand(TEAM_FIRST), asRun(hand(TEAM_FIRST), 'p3'))).toBe(1)
    expect(stage('p4').prediction!.outcome(learn(), asRun(learn(), 'p4'))).toBe(1)
    expect(stage('p5').prediction!.outcome(learn(), asRun(learn(), 'p5'))).toBe(1)
  })
})

describe('Session 4 hints point at the next fix', () => {
  const hint = (p: Program | null, puzzle: string) => chooseEkskulHint(p, p ? runPuzzle(p, puzzle) : null, puzzle)?.key
  it('follows the arc', () => {
    expect(hint(null, 'p1')).toBe('e_start')
    expect(hint({ ...EMPTY, tree: { kind: 'split', id: 'r', q: 'music', yes: { kind: 'leaf', id: 'l', ekskul: 'choir' }, no: null } }, 'p1')).toBe('e_empty')
    expect(hint(hand(MUSIC_FIRST, { explain: ['dinda'] }), 'p2')).toBe('e_reorder')
    expect(hint(hand(TEAM_FIRST), 'p2')).toBe('e_explain')
    expect(hint(hand(TEAM_FIRST), 'p3')).toBe('e_learn')
    expect(hint(learn(), 'p4')).toBe('e_ignore')
    expect(hint(learn(), 'p5')).toBe('e_depth')
    expect(hint(learn({ maxDepth: 4 }), 'p5')).toBe('e_depthLower')
    expect(hint(learn(), 'sandbox')).toBe('e_hand')
  })
})

describe('rung-3 examples pass their puzzles, Session 4', () => {
  // The programs the xE* texts describe.
  const P1: N = MUSIC_FIRST
  const examples: Record<string, Program> = {
    p1: hand(P1),
    p2: hand(TEAM_FIRST, { explain: ['dinda'] }),
    p3: learn(),
    p4: learn({ ignore: ['classA'] }),
    p5: learn({ maxDepth: 2 }),
    sandbox: hand(BEST),
  }
  for (const st of EKSKUL_STAGES) it(st.id, () => expect(passes(examples[st.id], st.id)).toBe(true))
})
