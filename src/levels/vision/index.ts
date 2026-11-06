import { VisionScene } from '../../game/VisionScene'
import { SESSION2_CARDS } from '../../i18n'
import type { Session } from '../types'
import { VISION_BADGES, VISION_STAGES, runPuzzle, type VisionRun } from './stages'
import { VISION_STARTER, readVisionProgram, visionToolbox } from './blocks'
import { chooseVisionHint } from './hints'
import type { Step } from './model'

/** Session 2: Camera filter (docs/plan/02-sessions.md, section 4) */
export const visionSession: Session<Step[]> = {
  id: 's2',
  title: { id: 'Filter Kamera', en: 'Camera Filter' },
  topic: { id: 'Computer vision', en: 'Computer vision' },
  fileKey: 'c2File',
  cards: SESSION2_CARDS,
  winKey: 'vWin',
  winCard: 'computerVision',
  toolbox: visionToolbox,
  starter: VISION_STARTER,
  read: readVisionProgram,
  isEmpty: (p) => p.length === 0,
  puzzles: VISION_STAGES,
  runGroup: (id) => id,
  badgeDefs: VISION_BADGES,
  run: (p, _seed, stageId): VisionRun => {
    const raw = runPuzzle(p, stageId)
    const edges = p.find((s) => s.kind === 'edges')
    return { raw, events: [{ ...raw, over: edges && edges.kind === 'edges' ? edges.over : 1 }], accuracy: raw.right / raw.total, passed: false, context: null }
  },
  hint: (p, r, stageId) => chooseVisionHint(p, r ? (r as VisionRun).raw : null, stageId),
  createScene: () => new VisionScene(),
}
