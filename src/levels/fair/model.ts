// Session 3: "Fair data". The same word-counting learner as Session 1,
// now asked to work for people whose chat it wasn't trained on.
//
// What the player can change is the data: where examples come from, whether
// someone checks their labels, which messages are kept back for testing.
// The learner itself never changes, which is the point.

import { CORPUS, type Label, type Message } from '../chat/messages'
import { classify, learn, topWords, words, type Model, type Weighing } from '../chat/model'
import { rng } from '../train/model'
import { FAIR_CORPUS, type Sender } from './messages'

export type { Label, Sender }
export type Lang = 'id' | 'en'
export type Source = '8a' | '8c' | 'donated' | 'bimo'
export const SOURCES: Source[] = ['8a', '8c', 'donated', 'bimo']
export type TestSet = '8a' | '8c' | 'train' | 'holdout'
export const TEST_SETS: TestSet[] = ['8c', '8a', 'train', 'holdout']
export const SENDERS: Sender[] = ['dinda', 'raka', 'ayu', 'bimo']

export type Step =
  | { kind: 'collect'; label: Label; count: number; source: Source; id: string }
  | { kind: 'checkLabels'; id: string }
  | { kind: 'holdout'; count: number; id: string }
  | { kind: 'train'; id: string }
  | { kind: 'test'; on: TestSet; id: string }
  | { kind: 'inspect'; id: string }
  | { kind: 'bySender'; id: string }

export const MAX_COLLECT = 20
export const MAX_HOLDOUT = 10

interface Example extends Message {
  source: Source
  /** The label was filled in wrong (donated data only). */
  wrong?: boolean
}

export interface Judged {
  text: string
  truth: Label
  from?: Sender
  kata: Weighing
}

export type FairEvent =
  | { kind: 'collect'; label: Label; source: Source; asked: number; got: Example[] }
  | { kind: 'checkLabels'; fixed: number; of: number }
  | { kind: 'holdout'; count: number }
  | { kind: 'train'; examples: Record<Label, number>; top: ReturnType<typeof topWords>; bySource: Partial<Record<Source, number>> }
  | { kind: 'test'; on: TestSet; judged: Judged[]; right: number }
  | { kind: 'inspect'; bySource: Partial<Record<Source, number>>; byLabel: Record<Label, number>; on: TestSet; unknown: string[]; knownShare: number; suspicious: string[] }
  | { kind: 'bySender'; judged: Judged[]; scores: Record<Sender, { right: number; total: number }>; overall: number }
  | { kind: 'noModel' }
  | { kind: 'emptyHoldout' }

export interface FairResult {
  events: FairEvent[]
  /** The last test: which set, its size and Kata's score. */
  lastTest: { on: TestSet; size: number; right: number } | null
  /** What Kata scores on next week's 8C chat, whether or not the program tests it. */
  nextWeek: { size: number; right: number } | null
  /** The last per-sender scores, if the program asked for them. */
  bySender: Record<Sender, { right: number; total: number }> | null
  examples: number
  bySource: Partial<Record<Source, number>>
  /** Wrongly labelled examples Kata trained on. */
  trainedOnWrong: number
  inspected: boolean
  /** The program tested on its own training data at some point. */
  testedOnTrain: boolean
  accuracy: number | null
}

function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Every message a source has to offer, in the order Kata would get them. */
function pool(source: Source, lang: Lang, rand: () => number): Example[] {
  const c = FAIR_CORPUS[lang]
  if (source === '8a') return shuffle(CORPUS[lang].train, rand).map((m) => ({ ...m, source }))
  if (source === '8c') return shuffle(c.cousin.history, rand).map((m) => ({ text: m.text, label: m.label, source }))
  if (source === 'bimo') return shuffle(c.bimo.history, rand).map((m) => ({ text: m.text, label: m.label, source }))
  return shuffle(c.donated, rand).map((m) => ({ ...m, source }))
}

const judge = (model: Model, msgs: (Message & { from?: Sender })[]): Judged[] =>
  msgs.map((m) => ({ text: m.text, truth: m.label, from: m.from, kata: classify(model, m.text) }))
const rightOf = (js: Judged[]) => js.filter((j) => j.kata.label === j.truth).length

export function runFair(program: Step[], seed: number, lang: Lang): FairResult {
  const rand = rng(seed)
  const c = FAIR_CORPUS[lang]
  const pools = Object.fromEntries(SOURCES.map((s) => [s, pool(s, lang, rand)])) as Record<Source, Example[]>
  const taken = Object.fromEntries(SOURCES.map((s) => [s, new Set<Example>()])) as Record<Source, Set<Example>>
  let examples: Example[] = []
  let holdout: Example[] = []
  let model: Model | null = null
  let trainedOn: Example[] = []
  const events: FairEvent[] = []
  let lastTest: FairResult['lastTest'] = null
  let bySender: FairResult['bySender'] = null
  let inspected = false
  let testedOnTrain = false
  let lastTested: TestSet = '8c'

  const setFor = (on: TestSet): Message[] =>
    on === '8a' ? CORPUS[lang].test : on === '8c' ? c.cousin.test : on === 'train' ? trainedOn : holdout

  for (const step of program) {
    if (step.kind === 'collect') {
      const got = pools[step.source].filter((m) => m.label === step.label && !taken[step.source].has(m)).slice(0, step.count)
      for (const m of got) taken[step.source].add(m)
      examples.push(...got)
      events.push({ kind: 'collect', label: step.label, source: step.source, asked: step.count, got })
    } else if (step.kind === 'checkLabels') {
      // A person reads every example and fixes the labels that are wrong.
      const fixed = examples.filter((e) => e.wrong).length
      examples = examples.map((e) => (e.wrong ? { ...e, label: e.label === 'penting' ? 'santai' : 'penting', wrong: false } : e))
      events.push({ kind: 'checkLabels', fixed, of: examples.length })
    } else if (step.kind === 'holdout') {
      const n = Math.min(step.count, Math.max(0, examples.length - 2))
      const order = shuffle(examples, rand)
      holdout = order.slice(0, n)
      examples = order.slice(n)
      events.push({ kind: 'holdout', count: n })
    } else if (step.kind === 'train') {
      if (!examples.length) {
        events.push({ kind: 'noModel' })
        continue
      }
      model = learn(examples)
      trainedOn = [...examples]
      events.push({ kind: 'train', examples: model.examples, top: topWords(model), bySource: countBy(examples) })
    } else if (step.kind === 'test') {
      if (!model) {
        events.push({ kind: 'noModel' })
        continue
      }
      const set = setFor(step.on)
      if (!set.length) {
        events.push({ kind: 'emptyHoldout' })
        continue
      }
      const judged = judge(model, set)
      const right = rightOf(judged)
      events.push({ kind: 'test', on: step.on, judged, right })
      lastTest = { on: step.on, size: judged.length, right }
      lastTested = step.on
      if (step.on === 'train') testedOnTrain = true
    } else if (step.kind === 'inspect') {
      inspected = true
      const target = setFor(lastTested === 'train' || lastTested === 'holdout' ? '8c' : lastTested)
      const vocab = model?.vocab ?? new Set(examples.flatMap((e) => words(e.text)))
      const targetWords = target.flatMap((m) => words(m.text))
      // Numbers and single letters are words to the model, but say nothing to a player.
      const unknown = [...new Set(targetWords.filter((w) => !vocab.has(w) && w.length > 1 && !/^\d+$/.test(w)))]
      const knownShare = targetWords.length ? targetWords.filter((w) => vocab.has(w)).length / targetWords.length : 0
      // Examples whose label disagrees with what most of their words say.
      const suspicious = model ? examples.filter((e) => classify(model!, e.text).label !== e.label).map((e) => e.text).slice(0, 4) : []
      events.push({ kind: 'inspect', bySource: countBy(examples), byLabel: labelCount(examples), on: lastTested === 'train' || lastTested === 'holdout' ? '8c' : lastTested, unknown: unknown.slice(0, 8), knownShare, suspicious })
    } else if (step.kind === 'bySender') {
      if (!model) {
        events.push({ kind: 'noModel' })
        continue
      }
      const judged = judge(model, c.everyone)
      const scores = Object.fromEntries(SENDERS.map((s) => [s, { right: 0, total: 0 }])) as Record<Sender, { right: number; total: number }>
      for (const j of judged) {
        const s = scores[j.from!]
        s.total++
        if (j.kata.label === j.truth) s.right++
      }
      bySender = scores
      events.push({ kind: 'bySender', judged, scores, overall: rightOf(judged) / judged.length })
    }
  }

  const nextWeek = model ? { size: c.cousin.test.length, right: rightOf(judge(model, c.cousin.test)) } : null
  return {
    events,
    lastTest,
    nextWeek,
    bySender,
    examples: trainedOn.length,
    bySource: countBy(trainedOn),
    trainedOnWrong: trainedOn.filter((e) => e.wrong).length,
    inspected,
    testedOnTrain,
    accuracy: lastTest ? lastTest.right / lastTest.size : null,
  }
}

function countBy(xs: Example[]): Partial<Record<Source, number>> {
  const out: Partial<Record<Source, number>> = {}
  for (const x of xs) out[x.source] = (out[x.source] ?? 0) + 1
  return out
}

function labelCount(xs: Example[]): Record<Label, number> {
  return { penting: xs.filter((x) => x.label === 'penting').length, santai: xs.filter((x) => x.label === 'santai').length }
}

/** Every sender scored at least `min` of their messages right. */
export function fairToAll(scores: Record<Sender, { right: number; total: number }> | null, min = 5 / 6): boolean {
  if (!scores) return false
  return SENDERS.every((s) => scores[s].total === 0 || scores[s].right / scores[s].total >= min - 1e-9)
}
