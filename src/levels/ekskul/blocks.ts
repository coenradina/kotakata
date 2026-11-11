import * as Blockly from 'blockly/core'
import { buildToolbox, defineJsonBlocks, findHat, WHEN_RUN_GROUP, type ToolboxBlock, type ToolboxGroup } from '../../blocks/common'
import { t, type Key, type Lang } from '../../i18n'
import { EKSKULS, FEATURES, NEW_IDS, type Ekskul, type Feature, type Program, type Tree } from './model'
import { ekskulProgram } from './program'

export const FEATURE_KEY: Record<Feature, Key> = { music: 'eqMusic', team: 'eqTeam', build: 'eqBuild', after: 'eqAfter', classA: 'eqClassA' }
export const FEATURE_SHORT: Record<Feature, Key> = { music: 'eqMusicShort', team: 'eqTeamShort', build: 'eqBuildShort', after: 'eqAfterShort', classA: 'eqClassAShort' }
export const EKSKUL_KEY: Record<Ekskul, Key> = { basket: 'ekBasket', choir: 'ekChoir', robot: 'ekRobot' }
export const NAME_KEY: Record<string, Key> = {
  dinda: 'nameDinda',
  raka: 'nameRaka',
  sari: 'nameSari',
  bimo: 'nameBimo',
  ayu: 'nameAyu',
  tono: 'nameTono',
  wulan: 'nameWulan',
  gilang: 'nameGilang',
}
export const EKSKUL_ICON: Record<Ekskul, string> = { basket: '🏀', choir: '🎤', robot: '🤖' }

// Where blocks may go. The program is one chain under "when ▶ clicked":
// settings in any order, with at most one tree among them. The tree's first
// question or suggestion sits in that chain, so settings can go before or
// after the tree. Every other question or suggestion sits in a yes or no
// branch, one block per branch, with nothing under it.
const STEP = 'kk_e_step'
const NODE = 'kk_e_node'
const NODE_TYPES = new Set(['kk_e_ask', 'kk_e_rec'])

/** True for a question or suggestion inside a yes or no branch. */
function inBranch(block: Blockly.Block) {
  const up = block.previousConnection?.targetConnection
  return !!up && up.getSourceBlock().nextConnection !== up
}

/** True for a setting placed after the tree. */
function afterTree(block: Blockly.Block) {
  for (let up = block.getPreviousBlock(); up; up = up.getPreviousBlock()) if (NODE_TYPES.has(up.type)) return true
  return false
}

/** Shapes change only after a block lands, never mid-drag or in the palette. */
const settled = (block: Blockly.Block, e: Blockly.Events.Abstract) => !e.isUiEvent && !block.isInFlyout && !block.isInsertionMarker() && !block.isDeadOrDying()

/** Takes a block off the program and nudges it away, so it doesn't look attached. It shares an undo step with the move that caused it. */
function setAside(block: Blockly.Block | null, group: string) {
  if (!block) return
  const old = Blockly.Events.getGroup()
  Blockly.Events.setGroup(group || old)
  try {
    if (block.getParent()) block.unplug()
    block.moveBy(48, 24)
  } finally {
    Blockly.Events.setGroup(old)
  }
}

/**
 * A question or suggestion has a notch under it only when it starts the tree.
 * In a branch the notch goes, and anything stacked under it is set aside.
 * The shape is saved, so the drag preview of a block from a branch matches it.
 */
const NODE_SHAPE = {
  saveExtraState(this: Blockly.Block) {
    return this.nextConnection ? null : { branch: true }
  },
  loadExtraState(this: Blockly.Block, state: { branch?: boolean } | null) {
    if (state?.branch && this.nextConnection && !this.nextConnection.isConnected()) this.setNextStatement(false)
  },
}
function fitNode(this: Blockly.Block, e: Blockly.Events.Abstract) {
  if (!settled(this, e)) return
  const branch = inBranch(this)
  if (!branch && !this.nextConnection) this.setNextStatement(true, STEP)
  if (branch && this.nextConnection) {
    setAside(this.getNextBlock(), e.group)
    this.setNextStatement(false)
  }
}

/** A setting takes the tree under it only if the tree isn't above it already: one tree per program. */
function fitStep(this: Blockly.Block, e: Blockly.Events.Abstract) {
  const next = this.nextConnection
  if (!next || !settled(this, e)) return
  const check = afterTree(this) ? [STEP] : [STEP, NODE]
  if (next.getCheck()?.length === check.length) return
  const below = this.getNextBlock()
  next.setCheck(check)
  // Blockly unplugs a block that no longer fits; move it so it looks loose too.
  if (below && below.getPreviousBlock() !== this) setAside(below, e.group)
}

function registerPlacement() {
  if (!Blockly.Extensions.isRegistered('kk_e_node_shape'))
    Blockly.Extensions.registerMutator('kk_e_node_shape', NODE_SHAPE, function (this: Blockly.Block) {
      this.setOnChange(fitNode)
    })
  if (!Blockly.Extensions.isRegistered('kk_e_step_fit'))
    Blockly.Extensions.register('kk_e_step_fit', function (this: Blockly.Block) {
      this.setOnChange(fitStep)
    })
}

export function defineEkskulBlocks(lang: Lang) {
  registerPlacement()
  const features = FEATURES.map((f) => [t(lang, FEATURE_KEY[f]), f])
  const step = (type: string, key: Key, style: string, args0?: object[]) => ({
    type,
    message0: t(lang, key),
    ...(args0 ? { args0 } : {}),
    previousStatement: STEP,
    nextStatement: [STEP, NODE],
    style,
    tooltip: t(lang, 'tipESetting'),
    extensions: ['kk_e_step_fit'],
  })
  const node = { previousStatement: NODE, nextStatement: STEP, mutator: 'kk_e_node_shape' }
  defineJsonBlocks([
    {
      // A question with a branch for each answer. Each branch holds one question or suggestion.
      type: 'kk_e_ask',
      message0: t(lang, 'blkEAsk'),
      args0: [
        { type: 'field_dropdown', name: 'Q', options: features },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'YES', check: NODE },
        { type: 'input_statement', name: 'NO', check: NODE },
      ],
      ...node,
      style: 'data',
      tooltip: t(lang, 'tipEAsk'),
    },
    {
      type: 'kk_e_rec',
      message0: t(lang, 'blkERec'),
      args0: [{ type: 'field_dropdown', name: 'EK', options: EKSKULS.map((e) => [`${EKSKUL_ICON[e]} ${t(lang, EKSKUL_KEY[e])}`, e]) }],
      ...node,
      style: 'model',
      tooltip: t(lang, 'tipERec'),
    },
    step('kk_e_learn', 'blkELearn', 'events'),
    step('kk_e_ignore', 'blkEIgnore', 'events', [{ type: 'field_dropdown', name: 'Q', options: features }]),
    step('kk_e_depth', 'blkEDepth', 'events', [{ type: 'field_dropdown', name: 'N', options: ['1', '2', '3', '4'].map((n) => [n, n]) }]),
    step('kk_e_explain', 'blkEExplain', 'events', [{ type: 'field_dropdown', name: 'WHO', options: NEW_IDS.map((id) => [t(lang, NAME_KEY[id]), id]) }]),
  ])
}

const ORDER = ['p1', 'p2', 'p3', 'p4', 'p5']

export function ekskulToolbox(lang: Lang, puzzleId = 'p1') {
  const at = ORDER.indexOf(puzzleId)
  const from = (p: string) => at < 0 || at >= ORDER.indexOf(p)
  const b = (type: string, fields?: Record<string, unknown>): ToolboxBlock => ({ kind: 'block', type, ...(fields ? { fields } : {}) })
  const ask: ToolboxGroup = {
    label: 'catEAsk',
    style: 'data',
    blocks: [b('kk_e_ask', { Q: 'music' }), b('kk_e_ask', { Q: 'team' }), b('kk_e_ask', { Q: 'build' }), ...(from('p3') ? [b('kk_e_ask', { Q: 'after' })] : []), ...(from('p4') ? [b('kk_e_ask', { Q: 'classA' })] : [])],
  }
  const rec: ToolboxGroup = { label: 'catERec', style: 'model', blocks: EKSKULS.map((e) => b('kk_e_rec', { EK: e })) }
  const learn: ToolboxGroup = {
    label: 'catELearn',
    style: 'events',
    blocks: [b('kk_e_learn'), ...(from('p4') ? [b('kk_e_ignore', { Q: 'classA' })] : []), ...(from('p5') ? [b('kk_e_depth', { N: '4' })] : [])],
  }
  const explain: ToolboxGroup = { label: 'catEExplain', style: 'events', blocks: [b('kk_e_explain', { WHO: 'dinda' })] }
  return buildToolbox(lang, [WHEN_RUN_GROUP, ask, rec, ...(from('p2') ? [explain] : []), ...(from('p3') ? [learn] : [])])
}

/** Puzzle 1 starts with the first question placed and one branch still empty. */
export const EKSKUL_STARTER: object = { blocks: ekskulProgram([], { ask: 'music', yes: { rec: 'choir' } }) }

function readNode(block: Blockly.Block | null): Tree | null {
  if (!block || !block.isEnabled()) return null
  if (block.type === 'kk_e_rec') return { kind: 'leaf', id: block.id, ekskul: block.getFieldValue('EK') as Ekskul }
  if (block.type === 'kk_e_ask')
    return { kind: 'split', id: block.id, q: block.getFieldValue('Q') as Feature, yes: readNode(block.getInputTargetBlock('YES')), no: readNode(block.getInputTargetBlock('NO')) }
  return null
}

/** Reads the program as data. Settings count wherever they sit in the chain, before or after the tree. */
export function readEkskulProgram(ws: Blockly.Workspace): Program | null {
  const hat = findHat(ws)
  if (!hat) return null
  const p: Program = { tree: null, learn: false, ignore: [], maxDepth: null, explain: [], ids: {} }
  for (let bl = hat.getNextBlock(); bl; bl = bl.getNextBlock()) {
    if (!bl.isEnabled()) continue
    if (bl.type === 'kk_e_learn') {
      p.learn = true
      p.ids.learn = bl.id
    } else if (bl.type === 'kk_e_ignore') p.ignore.push(bl.getFieldValue('Q') as Feature)
    else if (bl.type === 'kk_e_depth') {
      p.maxDepth = Number(bl.getFieldValue('N')) || null
      p.ids.depth = bl.id
    } else if (bl.type === 'kk_e_explain') p.explain.push(String(bl.getFieldValue('WHO')))
    // The placement rules allow one tree. If an old save has two, the first counts.
    else if (NODE_TYPES.has(bl.type) && !p.tree) p.tree = readNode(bl)
  }
  return p
}
