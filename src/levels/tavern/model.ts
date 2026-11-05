// Level 4: "Token Tavern". How a language model writes, one token at a time.
//
// The bard's "brain" is a tiny language model learned from five tavern
// sentences. To pick the next token it looks at the last 1 or 2 tokens (its
// context), counts what followed them in the stories, turns the counts into
// probabilities, and picks one. Temperature reshapes those probabilities:
// 0 always takes the most likely token, higher values give rarer tokens a
// better chance.
//
// Tokens are ids; their words come from the translations, and the five
// sentences have the same shape in both languages, so the model behaves
// identically in Indonesian and English.

export type Token = 'the' | 'cat' | 'dog' | 'bard' | 'sleeps' | 'drinks' | 'sings' | 'milk' | 'by' | 'end'

/**
 * The bard's training stories. `end` is the full stop. Every noun is a
 * creature, so Indonesian can say "si kucing", "si penyair" naturally.
 */
export const CORPUS: Token[][] = [
  ['the', 'cat', 'sleeps', 'by', 'the', 'bard', 'end'],
  ['the', 'cat', 'drinks', 'milk', 'end'],
  ['the', 'dog', 'sleeps', 'by', 'the', 'bard', 'end'],
  ['the', 'bard', 'sings', 'by', 'the', 'dog', 'end'],
  ['the', 'cat', 'sings', 'end'],
]

const VERBS: Token[] = ['sleeps', 'drinks', 'sings']

export const START_TOKENS: Token[] = ['the', 'cat', 'dog', 'bard']
export const TEMPERATURES = [0, 0.5, 1, 2]
export const CONTEXTS = [1, 2]

type Counts = Map<Token, number>

/** Counts of what came next after each 1- and 2-token context, in order first seen. */
function learn() {
  const table = new Map<string, Counts>()
  const add = (key: string, next: Token) => {
    const c = table.get(key) ?? new Map<Token, number>()
    c.set(next, (c.get(next) ?? 0) + 1)
    table.set(key, c)
  }
  for (const s of CORPUS) {
    for (let i = 1; i < s.length; i++) {
      add(s[i - 1], s[i])
      if (i >= 2) add(`${s[i - 2]} ${s[i - 1]}`, s[i])
    }
  }
  return table
}
const TABLE = learn()

export interface Candidate {
  token: Token
  /** Probability after temperature. */
  p: number
  /** Probability straight from the counts (temperature 1). */
  raw: number
}

/**
 * Next-token probabilities after `history`, looking back `context` tokens.
 * An unseen 2-token context falls back to the last token alone.
 */
export function nextProbabilities(history: Token[], context: number, temperature: number): { candidates: Candidate[]; usedContext: Token[] } {
  let used = history.slice(-context)
  let counts = TABLE.get(used.join(' '))
  if (!counts && used.length > 1) {
    used = history.slice(-1)
    counts = TABLE.get(used.join(' '))
  }
  if (!counts) return { candidates: [{ token: 'end', p: 1, raw: 1 }], usedContext: used }
  const entries = [...counts.entries()]
  const countTotal = entries.reduce((a, [, c]) => a + c, 0)
  let weights: number[]
  if (temperature === 0) {
    // Greedy: all the probability on the most common next token (first seen wins ties)
    const best = entries.reduce((b, e, i) => (e[1] > entries[b][1] ? i : b), 0)
    weights = entries.map((_, i) => (i === best ? 1 : 0))
  } else {
    weights = entries.map(([, c]) => Math.pow(c, 1 / temperature))
  }
  const total = weights.reduce((a, b) => a + b, 0)
  const candidates = entries
    .map(([token, c], i) => ({ token, p: weights[i] / total, raw: c / countTotal }))
    .sort((a, b) => b.p - a.p || b.raw - a.raw)
  return { candidates, usedContext: used }
}

/** Small seeded PRNG so a run is reproducible from its seed. */
function rng(seed: number) {
  let a = seed >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Step =
  | { kind: 'start'; token: Token; id: string }
  | { kind: 'temp'; value: number; id: string }
  | { kind: 'context'; value: number; id: string }
  | { kind: 'write'; n: number; id: string }

export interface Pick {
  history: Token[]
  usedContext: Token[]
  candidates: Candidate[]
  chosen: Token
  temperature: number
}

export interface TavernResult {
  start: Token
  picks: Pick[]
  /** The whole story: the start token, then every pick. */
  story: Token[]
  /** Reached the full stop with a proper sentence (it has a verb). */
  finished: boolean
  /** Some three-token stretch appears twice: the bard went in a loop. */
  looped: boolean
  /** Temperature or memory blocks with no write after them, so they never applied. */
  unused: { kind: 'temp' | 'context'; id: string }[]
  temperatures: number[]
  contexts: number[]
}

const DEFAULTS = { token: 'the' as Token, temperature: 0, context: 1 }

/** Runs the program. Settings apply to the writes after them; the story stops at a full stop. */
export function runTavern(program: Step[], seed: number): TavernResult {
  const rand = rng(seed)
  const startStep = program.find((s) => s.kind === 'start')
  const start = startStep?.kind === 'start' ? startStep.token : DEFAULTS.token
  const story: Token[] = [start]
  const picks: Pick[] = []
  let temperature = DEFAULTS.temperature
  let context = DEFAULTS.context
  const temperatures: number[] = []
  const contexts: number[] = []

  outer: for (const step of program) {
    if (step.kind === 'temp') temperature = step.value
    else if (step.kind === 'context') context = step.value
    else if (step.kind === 'write') {
      for (let i = 0; i < step.n; i++) {
        if (story.at(-1) === 'end') break outer
        const { candidates, usedContext } = nextProbabilities(story, context, temperature)
        let roll = rand()
        let chosen = candidates[candidates.length - 1].token
        for (const c of candidates) {
          roll -= c.p
          if (roll <= 0) {
            chosen = c.token
            break
          }
        }
        picks.push({ history: [...story], usedContext, candidates, chosen, temperature })
        temperatures.push(temperature)
        contexts.push(context)
        story.push(chosen)
      }
    }
  }

  const grams = story.slice(0, -2).map((_, i) => story.slice(i, i + 3).join(' '))
  const looped = grams.some((g, i) => grams.indexOf(g) !== i)
  const lastWrite = program.map((s) => s.kind).lastIndexOf('write')
  const unused = program
    .filter((s, i): s is Extract<Step, { kind: 'temp' | 'context' }> => (s.kind === 'temp' || s.kind === 'context') && i > lastWrite)
    .map((s) => ({ kind: s.kind, id: s.id }))
  const finished = story.at(-1) === 'end' && story.some((tk) => VERBS.includes(tk))
  return { start, picks, story, finished, looped, unused, temperatures, contexts }
}

/** The story temperature 0 would tell with the same start, context and length. */
export function boringStory(program: Step[]): Token[] {
  const cold = program.map((s) => (s.kind === 'temp' ? { ...s, value: 0 } : s))
  return runTavern(cold, 1).story
}
