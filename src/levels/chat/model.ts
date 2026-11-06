// Session 1: "Rules or examples?". Kata sorts the class chat into
// penting (homework, tests, schedules) and santai (chit-chat).
//
// Two ways to sort, both real:
// - rules the player writes: "if the message contains <word>, it's <label>";
// - a word-counting classifier (naive Bayes with add-one smoothing) that
//   learns from labelled examples. Each word pushes towards the label it
//   appeared with more often. Words it never saw push nowhere.
//
// Session 5 writes text the same way, by counting words, which is the
// link between the two sessions.

import { CORPUS, LABELS, type Label, type Message } from './messages'
import { rng } from '../train/model'

export type { Label, Message }
export { LABELS }
export type Lang = 'id' | 'en'

export type Step =
  | { kind: 'rule'; word: string; label: Label; id: string }
  | { kind: 'else'; label: Label; id: string }
  | { kind: 'collect'; label: Label; count: number; id: string }
  | { kind: 'train'; id: string }
  | { kind: 'test'; count: number; id: string }
  | { kind: 'work'; days: number; id: string }

export const MAX_COLLECT = 20
export const MAX_TEST = 20
export const MAX_DAYS = 5
export const MAX_RULE_WORD = 12
/** Messages Kata sorts per working day. */
export const PER_DAY = 6
/** The day the class starts using slang Kata has never seen. */
export const SLANG_DAY = 3

// --- words ---------------------------------------------------------------

/** Lowercase words. Laughter is one word however long it gets ("wkwkwk" is "wkwk"). */
export function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((w) => (/^(wk)+w?$/.test(w) ? 'wkwk' : /^(ha)+h?$/.test(w) ? 'haha' : /^l(o)+l$/.test(w) ? 'lol' : w))
}

/** What a rule's word field turns into: one lowercase word, letters and digits only. */
export function cleanRuleWord(raw: string): string {
  return words(raw.slice(0, MAX_RULE_WORD))[0] ?? ''
}

// --- rules ---------------------------------------------------------------

export interface RuleVerdict {
  label: Label | null
  /** Which rule decided: its index in the rule list, 'else', or null if none did. */
  by: number | 'else' | null
  word?: string
}

export function applyRules(rules: Extract<Step, { kind: 'rule' }>[], fallback: Label | null, text: string): RuleVerdict {
  const ws = new Set(words(text))
  for (const [i, r] of rules.entries()) if (r.word && ws.has(r.word)) return { label: r.label, by: i, word: r.word }
  return fallback ? { label: fallback, by: 'else' } : { label: null, by: null }
}

// --- the learner -----------------------------------------------------------

export interface Model {
  /** How many examples of each label it learned from. */
  examples: Record<Label, number>
  counts: Record<Label, Map<string, number>>
  totals: Record<Label, number>
  vocab: Set<string>
}

export function learn(examples: Message[]): Model {
  const counts = { penting: new Map<string, number>(), santai: new Map<string, number>() }
  const totals = { penting: 0, santai: 0 }
  const n = { penting: 0, santai: 0 }
  const vocab = new Set<string>()
  for (const ex of examples) {
    n[ex.label]++
    for (const w of words(ex.text)) {
      counts[ex.label].set(w, (counts[ex.label].get(w) ?? 0) + 1)
      totals[ex.label]++
      vocab.add(w)
    }
  }
  return { examples: n, counts, totals, vocab }
}

/**
 * How hard one word pushes: positive towards penting, negative towards
 * santai. Zero for a word the model never saw.
 */
export function weight(model: Model, word: string): number {
  if (!model.vocab.has(word)) return 0
  const v = model.vocab.size
  const p = ((model.counts.penting.get(word) ?? 0) + 1) / (model.totals.penting + v)
  const s = ((model.counts.santai.get(word) ?? 0) + 1) / (model.totals.santai + v)
  return Math.log(p / s)
}

export interface Weighing {
  label: Label
  /** Each word and its push, in message order. */
  pushes: { word: string; w: number }[]
  /** Total push including the prior; the sign decides. */
  score: number
  /** True when no word was known, so Kata fell back to a guess. */
  unsure: boolean
}

export function classify(model: Model, text: string): Weighing {
  const pushes = words(text).map((word) => ({ word, w: weight(model, word) }))
  const total = model.examples.penting + model.examples.santai
  const prior = total ? Math.log((model.examples.penting + 1) / (model.examples.santai + 1)) : 0
  const score = prior + pushes.reduce((a, p) => a + p.w, 0)
  const unsure = pushes.every((p) => p.w === 0)
  // A tie goes to santai: when Kata knows nothing, it doesn't flag a message as important.
  return { label: score > 1e-9 ? 'penting' : 'santai', pushes, score, unsure }
}

/** The words with the strongest push each way, for the "Kata's brain" panel. */
export function topWords(model: Model, k = 4): { penting: { word: string; w: number }[]; santai: { word: string; w: number }[] } {
  // Bare numbers and single letters are real words to the model, but say nothing to a player.
  const all = [...model.vocab].filter((word) => word.length > 1 && !/^\d+$/.test(word)).map((word) => ({ word, w: weight(model, word) }))
  return {
    penting: all.filter((x) => x.w > 0).sort((a, b) => b.w - a.w || a.word.localeCompare(b.word)).slice(0, k),
    santai: all.filter((x) => x.w < 0).sort((a, b) => a.w - b.w || a.word.localeCompare(b.word)).slice(0, k),
  }
}

// --- running a program -----------------------------------------------------

export interface Sorted {
  text: string
  truth: Label
  rule?: RuleVerdict
  kata?: Weighing
}

export type ChatEvent =
  | { kind: 'collect'; label: Label; asked: number; got: Message[] }
  | { kind: 'train'; examples: Record<Label, number>; top: ReturnType<typeof topWords> }
  | { kind: 'test'; sorted: Sorted[]; ruleScore: number | null; kataScore: number | null }
  | { kind: 'day'; day: number; sorted: Sorted[]; ruleScore: number | null; kataScore: number | null; slang: boolean }
  | { kind: 'noModel' }

export interface ChatResult {
  events: ChatEvent[]
  rules: Extract<Step, { kind: 'rule' }>[]
  /** The "otherwise" label, if the program has one. */
  fallback: Label | null
  /** The best score on the last test, rules or Kata, 0 to 1. Null with no test. */
  accuracy: number | null
  /** Last test's scores, out of its size. */
  lastTest: { size: number; rules: number | null; kata: number | null } | null
  examples: number
  /** Days Kata worked, and the last day's scores. */
  daysWorked: number
  lastDay: { day: number; slang: boolean; size: number; kata: number | null; rules: number | null } | null
  /** Kata was retrained after it had worked into the slang days. */
  retrainedAfterSlang: boolean
  /** Kata's word weights were the same before and after its working days (they always are). */
  unchangedByWork: boolean
}

function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const score = (sorted: Sorted[], pick: (s: Sorted) => Label | null | undefined) => sorted.filter((s) => pick(s) === s.truth).length

export function runChat(program: Step[], seed: number, lang: Lang, testSize?: number): ChatResult {
  const corpus = CORPUS[lang]
  const rand = rng(seed)
  // The chat history Kata can learn from, newest first. Working days add to the front.
  let history: Message[] = shuffle(corpus.train, rand)
  const used = new Set<Message>()
  const examples: Message[] = []
  const rules = program.filter((s): s is Extract<Step, { kind: 'rule' }> => s.kind === 'rule')
  const fallback = [...program].reverse().find((s) => s.kind === 'else')?.label ?? null
  const hasRules = rules.length > 0 || fallback !== null
  let model: Model | null = null
  let day = 0
  let retrainedAfterSlang = false
  let unchangedByWork = true
  const events: ChatEvent[] = []
  let lastTest: ChatResult['lastTest'] = null
  let lastDay: ChatResult['lastDay'] = null

  const sortAll = (msgs: Message[]): Sorted[] =>
    msgs.map((m) => ({
      text: m.text,
      truth: m.label,
      rule: hasRules ? applyRules(rules, fallback, m.text) : undefined,
      kata: model ? classify(model, m.text) : undefined,
    }))

  for (const step of program) {
    if (step.kind === 'collect') {
      const got = history.filter((m) => m.label === step.label && !used.has(m)).slice(0, step.count)
      for (const m of got) used.add(m)
      examples.push(...got)
      events.push({ kind: 'collect', label: step.label, asked: step.count, got })
    } else if (step.kind === 'train') {
      if (!examples.length) {
        events.push({ kind: 'noModel' })
        continue
      }
      model = learn(examples)
      if (day >= SLANG_DAY) retrainedAfterSlang = true
      events.push({ kind: 'train', examples: model.examples, top: topWords(model) })
    } else if (step.kind === 'test') {
      if (!model && !hasRules) {
        events.push({ kind: 'noModel' })
        continue
      }
      const n = Math.max(1, Math.min(MAX_TEST, testSize ?? step.count))
      const sorted = sortAll(corpus.test.slice(0, n))
      const ruleScore = hasRules ? score(sorted, (s) => s.rule?.label) : null
      const kataScore = model ? score(sorted, (s) => s.kata?.label) : null
      events.push({ kind: 'test', sorted, ruleScore, kataScore })
      lastTest = { size: n, rules: ruleScore, kata: kataScore }
    } else if (step.kind === 'work') {
      if (!model && !hasRules) {
        events.push({ kind: 'noModel' })
        continue
      }
      const before = model ? JSON.stringify(topWords(model, 8)) : ''
      for (let d = 0; d < Math.min(MAX_DAYS, step.days); d++) {
        day++
        const msgs = corpus.days[Math.min(day, corpus.days.length) - 1]
        const sorted = sortAll(msgs)
        const ruleScore = hasRules ? score(sorted, (s) => s.rule?.label) : null
        const kataScore = model ? score(sorted, (s) => s.kata?.label) : null
        events.push({ kind: 'day', day, sorted, ruleScore, kataScore, slang: day >= SLANG_DAY })
        lastDay = { day, slang: day >= SLANG_DAY, size: msgs.length, kata: kataScore, rules: ruleScore }
        // The day's messages become chat history Kata could learn from later.
        history = [...shuffle(msgs, rand), ...history]
      }
      // Using a model never changes it. This is checked, not assumed.
      if (model && JSON.stringify(topWords(model, 8)) !== before) unchangedByWork = false
    }
  }

  const best = lastTest ? Math.max(lastTest.rules ?? 0, lastTest.kata ?? 0) / lastTest.size : null
  return {
    events,
    rules,
    fallback,
    accuracy: best,
    lastTest,
    examples: examples.length,
    daysWorked: day,
    lastDay,
    retrainedAfterSlang,
    unchangedByWork,
  }
}
