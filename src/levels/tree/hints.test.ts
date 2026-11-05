import { describe, expect, it } from 'vitest'
import { chooseTreeHint } from './hints'
import { runTree, type Question, type Tree } from './model'

let n = 0
const leaf = (pen: 'bird' | 'bee' | 'frog'): Tree => ({ kind: 'leaf', id: `l${n++}`, pen })
const ask = (q: Question, yes: Tree | null, no: Tree | null): Tree => ({ kind: 'split', id: `s${n++}`, q, yes, no })
const hintFor = (tree: Tree | null) => chooseTreeHint({ tree }, tree ? runTree(tree, 1) : null)

describe('tree hints', () => {
  it('starts with a question block', () => {
    expect(chooseTreeHint(null, null)?.key).toBe('start')
    expect(hintFor(null)?.key).toBe('treeStart')
    expect(hintFor(leaf('bee'))?.key).toBe('treeAsk')
  })

  it('points at the question with an empty branch', () => {
    const inner = ask('big', leaf('bird'), null)
    const h = hintFor(ask('wings', inner, leaf('frog')))
    expect(h?.key).toBe('treeEmpty')
    expect(h?.target).toMatchObject({ where: 'field', blockId: inner.id })
  })

  it('asks for a missing pen', () => {
    expect(hintFor(ask('wings', leaf('bee'), leaf('frog')))?.key).toBe('treePenBird')
  })

  it('warns that colour is a trap', () => {
    expect(hintFor(ask('wings', ask('yellow', leaf('bee'), leaf('bird')), leaf('frog')))?.key).toBe('treeColour')
  })

  it('warns about the big frog', () => {
    expect(hintFor(ask('big', leaf('bird'), ask('wings', leaf('bee'), leaf('frog'))))?.key).toBe('treeBig')
  })

  it('says nothing once every critter is in the right pen', () => {
    expect(hintFor(ask('wings', ask('big', leaf('bird'), leaf('bee')), leaf('frog')))).toBeNull()
  })
})
