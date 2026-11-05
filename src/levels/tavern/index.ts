import { TavernScene } from '../../game/TavernScene'
import { LEVEL4_CARDS } from '../../i18n'
import type { Level } from '../types'
import { TAVERN_STARTER, readTavernProgram, tavernToolbox } from './blocks'
import { chooseTavernHint } from './hints'
import { runTavern, type Step } from './model'
import { TAVERN_ACHIEVEMENTS, TAVERN_STAGES, type TavernRun } from './stages'

export const tavernLevel: Level<Step[]> = {
  id: 'tavern',
  title: { id: 'Kedai Token', en: 'Token Tavern' },
  topic: 'LLMs',
  fileKey: 'l4Title',
  cards: LEVEL4_CARDS,
  winCard: 'llm',
  winKey: 'winBodyTavern',
  storageKey: 'kotakata.level4.blocks',
  toolbox: tavernToolbox,
  starter: TAVERN_STARTER,
  read: readTavernProgram,
  isEmpty: (p) => p.length === 0,
  stages: TAVERN_STAGES,
  achievements: TAVERN_ACHIEVEMENTS,
  // Every stage judges the same story, so one run can clear several.
  runGroup: () => 'all',
  run: (p, seed): TavernRun => {
    const raw = runTavern(p, seed)
    return { raw, events: [raw], accuracy: null, passed: false, context: null }
  },
  hint: (p, r, stage) => chooseTavernHint(p, r ? (r as TavernRun).raw : null, stage),
  createScene: () => new TavernScene(),
}
