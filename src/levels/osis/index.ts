import { MeetingScene } from '../../game/MeetingScene'
import { SESSION6_CARDS } from '../../i18n'
import type { Session } from '../types'
import { OSIS_BADGES, OSIS_STAGES, runPuzzle, type OsisRun } from './stages'
import { OSIS_STARTER, osisToolbox, readOsisProgram } from './blocks'
import { chooseOsisHint } from './hints'
import type { Program } from './model'

/** Session 6: Student council meeting (docs/plan/02-sessions.md, section 8) */
export const osisSession: Session<Program> = {
  id: 's6',
  title: { id: 'Rapat OSIS', en: 'Student Council' },
  topic: { id: 'Etika AI dan keputusan', en: 'AI ethics and decisions' },
  fileKey: 'c6File',
  cards: SESSION6_CARDS,
  winKey: 'oWin',
  winCard: 'aiEthics',
  toolbox: osisToolbox,
  starter: OSIS_STARTER,
  read: readOsisProgram,
  isEmpty: (p) => Object.keys(p.ids).length === 0,
  puzzles: OSIS_STAGES,
  runGroup: (id) => id,
  badgeDefs: OSIS_BADGES,
  run: (p, _seed, stageId, lang): OsisRun => {
    const raw = runPuzzle(p, stageId)
    return { raw, lang, events: [raw], accuracy: raw.plans.filter((x) => x.ok).length / raw.plans.length, passed: false, context: null }
  },
  hint: (p, r) => chooseOsisHint(p, r ? (r as OsisRun).raw : null),
  createScene: () => new MeetingScene(),
}
