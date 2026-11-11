import { ChatScene } from '../../game/ChatScene'
import { SESSION1_CARDS } from '../../i18n'
import type { Session } from '../types'
import { CHAT_BADGES, CHAT_STAGES, TEST_SIZE, type ChatRun } from './stages'
import { chatStarter, chatToolbox, readChatProgram } from './blocks'
import { chooseChatHint } from './hints'
import { runChat, type ChatResult, type Step } from './model'
import type { ChatPreview } from '../../game/ChatScene'

function toRun(raw: ChatResult): ChatRun {
  const t = raw.lastTest
  const best = t ? Math.max(t.rules ?? 0, t.kata ?? 0) : 0
  return { raw, events: [raw], accuracy: raw.accuracy, passed: false, context: t ? { correct: best, total: t.size } : null }
}

/** Session 1: Rules or examples? (docs/plan/02-sessions.md, section 3) */
export const chatSession: Session<Step[]> = {
  id: 's1',
  title: { id: 'Aturan atau Contoh?', en: 'Rules or Examples?' },
  topic: { id: 'Belajar dari contoh (Machine learning)', en: 'Learning from examples' },
  fileKey: 'c1File',
  cards: SESSION1_CARDS,
  winKey: 'cWin',
  winCard: 'machineLearning',
  toolbox: chatToolbox,
  starter: chatStarter,
  read: readChatProgram,
  isEmpty: (p) => p.length === 0,
  puzzles: CHAT_STAGES,
  // Each puzzle is its own run: puzzle 1 sorts 4 messages, the rest 20.
  runGroup: (id) => (id === 'p1' ? 'p1' : 'rest'),
  badgeDefs: CHAT_BADGES,
  run: (p, seed, stageId, lang) => toRun(runChat(p, seed, lang, TEST_SIZE[stageId] ?? 20)),
  // Before a run, the phone shows the messages the test will sort, and the rules as they're built.
  previewData: (p, stageId): ChatPreview => ({
    size: TEST_SIZE[stageId] ?? 20,
    rules: (p ?? []).filter((s): s is Extract<Step, { kind: 'rule' }> => s.kind === 'rule'),
    fallback: [...(p ?? [])].reverse().find((s) => s.kind === 'else')?.label ?? null,
  }),
  hint: (p, r, stageId) => chooseChatHint(p, r ? (r as ChatRun).raw : null, stageId),
  createScene: () => new ChatScene(),
}
