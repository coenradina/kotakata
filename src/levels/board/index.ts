import { WordScene } from '../../game/WordScene'
import { SESSION5_CARDS, type Lang } from '../../i18n'
import type { Session } from '../types'
import { BOARD_BADGES, BOARD_STAGES, type BoardRun } from './stages'
import { boardStarter, boardToolbox, readBoardProgram } from './blocks'
import { chooseBoardHint } from './hints'
import { runBoard, type BoardResult, type Step } from './model'

const toRun = (raw: BoardResult, lang: Lang): BoardRun => ({ raw, lang, events: [raw], accuracy: null, passed: false, context: null })

// Hints are chosen after a run, so the run's language travels with it.
let lastLang: Lang = 'id'

/** Session 5: Word by word (docs/plan/02-sessions.md, section 5) */
export const boardSession: Session<Step[]> = {
  id: 's5',
  title: { id: 'Kata demi Kata', en: 'Word by Word' },
  topic: { id: 'AI generatif (Generative AI)', en: 'Generative AI' },
  fileKey: 'c5File',
  cards: SESSION5_CARDS,
  winKey: 'wWin',
  winCard: 'aiAsTool',
  toolbox: boardToolbox,
  starter: boardStarter,
  read: readBoardProgram,
  isEmpty: (p) => p.length === 0,
  puzzles: BOARD_STAGES,
  runGroup: (id) => id,
  badgeDefs: BOARD_BADGES,
  run: (p, seed, stageId, lang) => {
    lastLang = lang
    // The new notice only goes up in the sandbox.
    return toRun(runBoard(p, seed, lang, stageId === 'sandbox'), lang)
  },
  hint: (p, r, stageId) => chooseBoardHint(p, r ? (r as BoardRun).raw : null, stageId, r ? (r as BoardRun).lang : lastLang),
  createScene: () => new WordScene(),
}
