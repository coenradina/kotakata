// Session 5: "Word by word". Kata becomes the class info chatbot. It has
// read the homeroom teacher's announcement board, and it writes by
// counting: after the last few words (its context), which word came next
// most often on the board?
//
// It's a real n-gram language model with up to 3 words of context. When it
// has never seen a context, it backs off to a shorter one. That fallback
// is what makes it answer a question the board never answered, sounding
// just as sure: a hallucination that comes from the mechanism, not a script.
//
// It sorts chat by counting words in Session 1; here it writes by counting
// words. That is the link between the two sessions.

import { rng } from '../train/model'

export type Lang = 'id' | 'en'
export const END = '.'

/** The board, one sentence per line, in board order. Ties go to whichever came first. */
export const BOARD: Record<Lang, string[]> = {
  id: [
    'ulangan bahasa hari senin .',
    'ulangan matematika hari rabu .',
    'pr ipa dikumpulkan hari senin .',
    'rapat osis hari senin .',
    'kelas libur hari jumat .',
    'upacara hari senin jam tujuh .',
    'jadwal ulangan ipa menyusul .',
    'piket kelas hari selasa .',
    'ekskul basket hari kamis .',
    'pr matematika dikumpulkan kamis .',
  ],
  en: [
    'english test on monday .',
    'maths test on wednesday .',
    'science homework due on monday .',
    'student council meeting on monday .',
    'no class on friday .',
    'assembly on monday at seven .',
    'science test date to follow .',
    'class cleaning on tuesday .',
    'basketball club on thursday .',
    'maths homework due thursday .',
  ],
}

/** A new notice for the sandbox: the science test date arrives, but Kata won't know until it reads the board again. */
export const NEW_NOTICE: Record<Lang, string> = {
  id: 'ulangan ipa hari kamis .',
  en: 'science test on thursday .',
}

/** The fact each friend wants in puzzle 5, and the day the board gives for it. */
export const QUESTIONS: Record<Lang, { who: 'dinda' | 'raka' | 'sari'; about: string[]; answer: string }[]> = {
  id: [
    { who: 'dinda', about: ['ulangan', 'matematika'], answer: 'rabu' },
    { who: 'raka', about: ['ekskul', 'basket'], answer: 'kamis' },
    { who: 'sari', about: ['piket', 'kelas'], answer: 'selasa' },
  ],
  en: [
    { who: 'dinda', about: ['maths', 'test'], answer: 'wednesday' },
    { who: 'raka', about: ['maths', 'homework'], answer: 'thursday' },
    { who: 'sari', about: ['class', 'cleaning'], answer: 'tuesday' },
  ],
}

export const TEMPERATURES = [0, 0.5, 1, 2]
export const CONTEXTS = [1, 2, 3]
export const MAX_WRITE = 12
export const PROMPT_SLOTS = 4

const toks = (sentence: string) => sentence.split(' ').filter(Boolean)

/** Every word on the board, for the prompt dropdowns, in first-seen order. */
export function vocabulary(lang: Lang): string[] {
  return [...new Set(BOARD[lang].flatMap(toks).filter((w) => w !== END))]
}

type Table = Map<string, Map<string, number>>

/** Counts what followed every 1-, 2- and 3-word context. The board is read as one stream. */
export function learnBoard(sentences: string[]): Table {
  const stream = sentences.flatMap(toks)
  const table: Table = new Map()
  const add = (key: string, next: string) => {
    const c = table.get(key) ?? new Map<string, number>()
    c.set(next, (c.get(next) ?? 0) + 1)
    table.set(key, c)
  }
  for (let i = 1; i < stream.length; i++) {
    for (let k = 1; k <= 3 && i - k >= 0; k++) add(stream.slice(i - k, i).join(' '), stream[i])
  }
  return table
}

export interface Candidate {
  word: string
  /** Probability after temperature. */
  p: number
  /** Probability straight from the counts. */
  raw: number
}

/** Next-word probabilities. An unseen context backs off one word at a time. */
export function nextWords(table: Table, history: string[], context: number, temperature: number) {
  let used = history.slice(-context)
  let counts = table.get(used.join(' '))
  while (!counts && used.length > 1) {
    used = used.slice(1)
    counts = table.get(used.join(' '))
  }
  const backedOff = used.length < Math.min(context, history.length)
  if (!counts) return { candidates: [{ word: END, p: 1, raw: 1 }] as Candidate[], used, backedOff: true }
  const entries = [...counts.entries()]
  const total = entries.reduce((a, [, c]) => a + c, 0)
  let weights: number[]
  if (temperature === 0) {
    // Greedy: everything on the most common next word; the first seen wins a tie.
    const best = entries.reduce((b, e, i) => (e[1] > entries[b][1] ? i : b), 0)
    weights = entries.map((_, i) => (i === best ? 1 : 0))
  } else {
    weights = entries.map(([, c]) => Math.pow(c, 1 / temperature))
  }
  const wsum = weights.reduce((a, b) => a + b, 0)
  const candidates = entries.map(([word, c], i) => ({ word, p: weights[i] / wsum, raw: c / total })).sort((a, b) => b.p - a.p || b.raw - a.raw)
  return { candidates, used, backedOff }
}

export type Step =
  | { kind: 'ask'; words: string[]; id: string }
  | { kind: 'temp'; value: number; id: string }
  | { kind: 'context'; value: number; id: string }
  | { kind: 'write'; n: number; id: string }
  | { kind: 'check'; id: string }
  | { kind: 'reread'; id: string }

export interface Pick {
  history: string[]
  used: string[]
  backedOff: boolean
  candidates: Candidate[]
  chosen: string
}

export interface Answer {
  prompt: string[]
  picks: Pick[]
  /** The prompt followed by every word Kata wrote. */
  text: string[]
  /** The first sentence Kata wrote ended with a full stop. */
  finished: boolean
  /** Some three-word stretch came round twice. */
  looped: boolean
  /** Filled in by a check block: is the answer on the board, and where? */
  check?: { supported: boolean; sentence: string | null }
}

export type BoardEvent = { kind: 'answer'; answer: Answer; temperature: number; context: number } | { kind: 'reread'; notice: string } | { kind: 'noAsk' }

export interface BoardResult {
  events: BoardEvent[]
  answers: Answer[]
  temperature: number
  context: number
  /** Kata read the board again after the new notice went up. */
  reread: boolean
  /** What Kata would write from the same prompts at temperature 0, for comparing. */
  coldTexts: string[][]
  /** The new notice pinned up for this run, if any. */
  notice: string | null
  /** The board Kata learned from, in order. */
  board: string[]
}

/** A board sentence that contains every word of the prompt and of the answer, or null. */
export function supportOf(sentences: string[], prompt: string[], written: string[]): string | null {
  const need = [...prompt, ...written].filter((w) => w !== END)
  return sentences.find((s) => need.every((w) => toks(s).includes(w))) ?? null
}

function firstSentence(written: string[]) {
  const i = written.indexOf(END)
  return i < 0 ? written : written.slice(0, i + 1)
}

/**
 * Runs the program. Temperature and memory apply wherever they are placed
 * (usability finding B1: settings below a write used to be ignored). Each
 * "ask" starts a new question; each "write" continues the last one.
 */
export function runBoard(program: Step[], seed: number, lang: Lang, withNotice = false): BoardResult {
  const rand = rng(seed)
  const temperature = [...program].reverse().find((s) => s.kind === 'temp')?.value ?? 0
  // Three words of memory unless the program says otherwise; puzzle 3 starts at one on purpose.
  const context = [...program].reverse().find((s) => s.kind === 'context')?.value ?? 3
  const reread = withNotice && program.some((s) => s.kind === 'reread')
  const firstAsk = program.findIndex((s) => s.kind === 'ask')
  const rereadBefore = withNotice && program.findIndex((s) => s.kind === 'reread') > -1 && program.findIndex((s) => s.kind === 'reread') < (firstAsk < 0 ? Infinity : firstAsk)
  // The board Kata learned from. The new notice only counts if Kata read the board again before answering.
  const learned = rereadBefore ? [...BOARD[lang], NEW_NOTICE[lang]] : BOARD[lang]
  const truth = withNotice ? [...BOARD[lang], NEW_NOTICE[lang]] : BOARD[lang]
  const table = learnBoard(learned)

  const events: BoardEvent[] = []
  const answers: Answer[] = []
  const coldTexts: string[][] = []
  let current: Answer | null = null

  const write = (a: Answer, n: number, temp: number, r: () => number) => {
    for (let i = 0; i < n; i++) {
      const history = a.text
      const { candidates, used, backedOff } = nextWords(table, history, context, temp)
      let chosen = candidates[0].word
      if (temp > 0) {
        let roll = r()
        for (const c of candidates) {
          roll -= c.p
          if (roll <= 0) {
            chosen = c.word
            break
          }
        }
      }
      a.picks.push({ history: [...history], used, backedOff, candidates, chosen })
      a.text = [...history, chosen]
    }
    const written = a.text.slice(a.prompt.length)
    a.finished = firstSentence(written).at(-1) === END
    const grams = a.text.slice(0, -2).map((_, k) => a.text.slice(k, k + 3).join(' '))
    a.looped = grams.some((g, k) => grams.indexOf(g) !== k)
  }

  for (const step of program) {
    if (step.kind === 'reread' && withNotice) events.push({ kind: 'reread', notice: NEW_NOTICE[lang] })
    if (step.kind === 'ask') {
      const prompt = step.words.filter(Boolean)
      current = { prompt, picks: [], text: [...prompt], finished: false, looped: false }
      answers.push(current)
    } else if (step.kind === 'write') {
      if (!current) {
        events.push({ kind: 'noAsk' })
        continue
      }
      write(current, step.n, temperature, rand)
      // The same question at temperature 0, for "did temperature change anything?"
      const cold: Answer = { prompt: current.prompt, picks: [], text: [...current.prompt], finished: false, looped: false }
      write(cold, current.text.length - current.prompt.length, 0, rand)
      coldTexts[answers.length - 1] = cold.text
      events.push({ kind: 'answer', answer: current, temperature, context })
    } else if (step.kind === 'check' && current) {
      const written = firstSentence(current.text.slice(current.prompt.length))
      const sentence = supportOf(truth, current.prompt, written)
      current.check = { supported: sentence !== null, sentence }
    }
  }
  return { events, answers, temperature, context, reread, coldTexts, notice: withNotice ? NEW_NOTICE[lang] : null, board: truth }
}

/** The first word Kata wrote for a question, if any. */
export const firstWord = (a: Answer | undefined) => a?.text[a.prompt.length]
