import type * as Blockly from 'blockly/core'
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

export function defineEkskulBlocks(lang: Lang) {
  const features = FEATURES.map((f) => [t(lang, FEATURE_KEY[f]), f])
  const step = (type: string, key: Key, style: string, args0?: object[]) => ({ type, message0: t(lang, key), ...(args0 ? { args0 } : {}), previousStatement: null, nextStatement: null, style })
  defineJsonBlocks([
    {
      // A question with a branch for each answer. No "next", so each branch holds one block.
      type: 'kk_e_ask',
      message0: t(lang, 'blkEAsk'),
      args0: [{ type: 'field_dropdown', name: 'Q', options: features }, { type: 'input_dummy' }, { type: 'input_statement', name: 'YES' }, { type: 'input_statement', name: 'NO' }],
      previousStatement: null,
      style: 'data',
    },
    {
      type: 'kk_e_rec',
      message0: t(lang, 'blkERec'),
      args0: [{ type: 'field_dropdown', name: 'EK', options: EKSKULS.map((e) => [`${EKSKUL_ICON[e]} ${t(lang, EKSKUL_KEY[e])}`, e]) }],
      previousStatement: null,
      style: 'model',
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

/** Reads the program as data. Settings count wherever they sit; the tree is the last block in the chain. */
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
    else if (bl.type === 'kk_e_ask' || bl.type === 'kk_e_rec') p.tree = readNode(bl)
  }
  return p
}
