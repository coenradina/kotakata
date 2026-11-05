// Pop-quiz questions about the Level 1 terms.
//
// Two formats: multiple choice, and fill-in-the-blank with term chips.
// Some questions take their numbers from the player's last run, so they
// change from run to run. Technical terms stay in English in both languages.

import type { CardId, Lang } from '../i18n'

type Text = Record<Lang, string>

export interface ChoiceQuestion {
  kind: 'choice'
  id: string
  terms: CardId[]
  prompt: Text
  options: { text: Text; correct: boolean }[]
}

export interface BlankQuestion {
  kind: 'blank'
  id: string
  terms: CardId[]
  /** Sentence with `{1}`, `{2}`… where the blanks go. */
  sentence: Text
  /** The English term that belongs in each blank, in order. */
  answers: string[]
  /** Answers plus distractors, shuffled. */
  chips: string[]
}

export type Question = ChoiceQuestion | BlankQuestion

/** Numbers from the player's last run, for questions about their own robot. */
export interface RunContext {
  correct: number
  total: number
}

export const TERM_NAME: Record<CardId, string> = {
  dataset: 'Dataset',
  label: 'Label',
  training: 'Training',
  testing: 'Testing',
  accuracy: 'Accuracy',
  classification: 'Classification',
  feature: 'Feature',
  split: 'Split',
  leaf: 'Leaf',
  prediction: 'Prediction',
  decisionTree: 'Decision Tree',
}

const opt = (id: string, en: string, correct = false) => ({ text: { id, en }, correct })

// ---------------------------------------------------------------------------
// Multiple choice. The first option listed is the right one; options are
// shuffled before they're shown.

const CHOICES: Omit<ChoiceQuestion, 'kind'>[] = [
  {
    id: 'dataset-what',
    terms: ['dataset'],
    prompt: { id: 'Apa itu dataset?', en: 'What is a dataset?' },
    options: [
      opt('Kumpulan contoh yang dipelajari AI', 'The examples an AI learns from', true),
      opt('Skor akhir robot', "The robot's final score"),
      opt('Jumlah ronde training', 'The number of training rounds'),
    ],
  },
  {
    id: 'dataset-more',
    terms: ['dataset'],
    prompt: {
      id: 'Robotmu cuma dapat 3 contoh apel. Apa yang paling membantu dataset-nya?',
      en: 'Your robot only got 3 apple examples. What would help its dataset most?',
    },
    options: [
      opt('Tambah contoh yang beragam, termasuk pisang', 'Add more varied examples, including bananas', true),
      opt('Tambah buah saat testing', 'Test it on more fruit'),
      opt('Ganti warna robotnya', "Change the robot's colour"),
    ],
  },
  {
    id: 'label-where',
    terms: ['label'],
    prompt: { id: 'Di Otak Robot, label tiap titik ditunjukkan oleh…', en: "In the Robot Brain, each dot's label is shown by its…" },
    options: [
      opt('Warnanya: merah = apple, kuning = banana', 'Colour: red = apple, yellow = banana', true),
      opt('Ukurannya', 'Size'),
      opt('Urutan munculnya', 'Order it appeared in'),
    ],
  },
  {
    id: 'label-why',
    terms: ['label'],
    prompt: { id: 'Kenapa contoh di dataset butuh label?', en: 'Why do examples in a dataset need labels?' },
    options: [
      opt('Supaya AI tahu jawaban benar yang harus dipelajari', 'So the AI knows the right answers to learn', true),
      opt('Supaya datanya kelihatan rapi', 'So the data looks tidy'),
      opt('Supaya testing lebih cepat', 'So testing runs faster'),
    ],
  },
  {
    id: 'training-round',
    terms: ['training'],
    prompt: { id: 'Apa yang terjadi di setiap ronde training?', en: 'What happens in each training round?' },
    options: [
      opt('Robot menggeser tebakannya mendekati contoh', 'The robot moves its guesses closer to the examples', true),
      opt('Robot mengumpulkan buah baru', 'The robot collects new fruit'),
      opt('Robot menghitung accuracy', 'The robot works out its accuracy'),
    ],
  },
  {
    id: 'training-fix',
    terms: ['training'],
    prompt: {
      id: 'Robot baru dilatih 1 ronde dan masih sering salah. Apa yang bisa dicoba?',
      en: 'The robot was trained for 1 round and still gets lots wrong. What could you try?',
    },
    options: [
      opt('Tambah ronde training', 'More training rounds', true),
      opt('Hapus blok testing', 'Delete the test block'),
      opt('Kurangi datanya', 'Use less data'),
    ],
  },
  {
    id: 'testing-new',
    terms: ['testing'],
    prompt: {
      id: 'Kenapa testing pakai buah baru, bukan buah dari dataset?',
      en: 'Why does testing use new fruit instead of fruit from the dataset?',
    },
    options: [
      opt('Untuk mengecek robot benar-benar belajar, bukan menghafal', "To check the robot really learned, rather than memorised", true),
      opt('Karena buah lamanya sudah busuk', 'Because the old fruit went bad'),
      opt('Supaya training lebih cepat', 'So training is faster'),
    ],
  },
  {
    id: 'testing-small',
    terms: ['testing'],
    prompt: {
      id: 'Testing dengan 3 buah saja kurang bisa dipercaya karena…',
      en: "Testing on only 3 fruits isn't very trustworthy because…",
    },
    options: [
      opt('Terlalu sedikit, hasilnya bisa kebetulan', "It's too few, so the result could be luck", true),
      opt('Robotnya jadi capek', 'The robot gets tired'),
      opt('Accuracy-nya pasti 0%', 'Accuracy is always 0%'),
    ],
  },
  {
    id: 'accuracy-means',
    terms: ['accuracy'],
    prompt: { id: 'Accuracy 90% artinya…', en: '90% accuracy means…' },
    options: [
      opt('9 dari 10 tebakan benar', '9 out of 10 guesses were right', true),
      opt('Training sudah 90% selesai', 'Training is 90% done'),
      opt('Ada 90 contoh di dataset', 'There are 90 examples in the dataset'),
    ],
  },
  {
    id: 'classification-which',
    terms: ['classification'],
    prompt: { id: 'Mana yang termasuk tugas classification?', en: 'Which of these is a classification task?' },
    options: [
      opt('Menandai email sebagai spam atau bukan', 'Marking emails as spam or not spam', true),
      opt('Menghitung total belanja', 'Adding up a shopping bill'),
      opt('Memutar lagu berikutnya', 'Playing the next song'),
    ],
  },
  {
    id: 'classification-robot',
    terms: ['classification'],
    prompt: { id: 'Robotmu melakukan classification karena ia…', en: 'Your robot does classification because it…' },
    options: [
      opt('Memasukkan tiap buah ke satu kelompok', 'Puts each fruit into one group', true),
      opt('Bergerak di conveyor belt', 'Moves along a conveyor belt'),
      opt('Punya antena', 'Has an antenna'),
    ],
  },
  // Level 2
  {
    id: 'feature-what',
    terms: ['feature'],
    prompt: { id: 'Di Taman Decision Tree, mana yang termasuk feature?', en: 'In the Decision Tree Garden, which of these is a feature?' },
    options: [
      opt('Apakah hewannya bersayap', 'Whether the critter has wings', true),
      opt('Kandang tempat hewan berakhir', 'The pen the critter ends up in'),
      opt('Urutan hewan masuk gerbang', 'The order critters come through the gate'),
    ],
  },
  {
    id: 'feature-good',
    terms: ['feature'],
    prompt: { id: 'Kenapa warna kurang cocok untuk memisahkan burung dan lebah?', en: "Why isn't colour a good way to tell birds from bees?" },
    options: [
      opt('Ada burung yang kuning, sama seperti lebah', 'Some birds are yellow, just like bees', true),
      opt('Warna tidak bisa ditanyakan', "Colour can't be asked about"),
      opt('Lebah tidak punya warna', "Bees don't have a colour"),
    ],
  },
  {
    id: 'split-what',
    terms: ['split'],
    prompt: { id: 'Apa itu split di decision tree?', en: 'What is a split in a decision tree?' },
    options: [
      opt('Satu pertanyaan ya/tidak yang membagi data jadi dua', 'One yes/no question that divides the data in two', true),
      opt('Jawaban akhir pohon', "The tree's final answer"),
      opt('Hewan yang salah kandang', 'A critter in the wrong pen'),
    ],
  },
  {
    id: 'leaf-what',
    terms: ['leaf'],
    prompt: { id: 'Di Taman Decision Tree, yang mana leaf-nya?', en: 'In the Decision Tree Garden, which part is a leaf?' },
    options: [
      opt('Kandang di ujung cabang', 'A pen at the end of a branch', true),
      opt('Papan pertanyaan', 'A question signpost'),
      opt('Gerbang tempat hewan datang', 'The gate where critters arrive'),
    ],
  },
  {
    id: 'prediction-what',
    terms: ['prediction'],
    prompt: { id: 'Seekor katak masuk ke kandang lebah. Kandang lebah itu adalah…', en: 'A frog ends up in the bee pen. The bee pen is the tree\'s…' },
    options: [
      opt('Prediction pohon, yang kali ini salah', 'prediction, and this time a wrong one', true),
      opt('Feature si katak', "frog's feature"),
      opt('Split yang benar', 'correct split'),
    ],
  },
  {
    id: 'tree-why',
    terms: ['decisionTree'],
    prompt: { id: 'Apa kelebihan decision tree dibanding banyak model AI lain?', en: 'What is one strength of decision trees over many other AI models?' },
    options: [
      opt('Kita bisa membaca kenapa ia memberi jawaban tertentu', 'You can read why it gave a particular answer', true),
      opt('Ia tidak butuh data sama sekali', "It doesn't need any data"),
      opt('Ia selalu benar 100%', "It's always 100% right"),
    ],
  },
]

// ---------------------------------------------------------------------------
// Fill in the blank. Each blank takes one English term.

const BLANKS: Omit<BlankQuestion, 'kind' | 'chips'>[] = [
  {
    id: 'blank-learn',
    terms: ['dataset', 'label'],
    sentence: {
      id: 'Robot belajar dari {1}, dan tiap contohnya punya {2}.',
      en: 'The robot learns from a {1}, and every example has a {2}.',
    },
    answers: ['Dataset', 'Label'],
  },
  {
    id: 'blank-flow',
    terms: ['training', 'testing', 'accuracy'],
    sentence: {
      id: 'Setelah {1}, kita cek robot lewat {2}, lalu melihat {3}-nya.',
      en: 'After {1}, we check the robot with {2} and look at its {3}.',
    },
    answers: ['Training', 'Testing', 'Accuracy'],
  },
  {
    id: 'blank-sort',
    terms: ['classification'],
    sentence: { id: 'Memilah apel dan pisang adalah contoh {1}.', en: 'Sorting apples from bananas is an example of {1}.' },
    answers: ['Classification'],
  },
  {
    id: 'blank-round',
    terms: ['training'],
    sentence: { id: 'Di setiap ronde {1}, robot menggeser tebakannya.', en: 'In every {1} round, the robot moves its guesses.' },
    answers: ['Training'],
  },
  {
    id: 'blank-tree',
    terms: ['split', 'leaf'],
    sentence: {
      id: 'Tiap pertanyaan ya/tidak adalah {1}, dan tiap kandang di ujung cabang adalah {2}.',
      en: 'Each yes/no question is a {1}, and each pen at the end of a branch is a {2}.',
    },
    answers: ['Split', 'Leaf'],
  },
  {
    id: 'blank-feature',
    terms: ['feature', 'decisionTree'],
    sentence: {
      id: 'Pertanyaan di {2} selalu tentang sebuah {1}, misalnya punya sayap atau tidak.',
      en: 'The questions in a {2} are always about a {1}, like whether something has wings.',
    },
    answers: ['Feature', 'Decision Tree'],
  },
  {
    id: 'blank-score',
    terms: ['accuracy', 'testing'],
    sentence: { id: '{1} dihitung dari tebakan yang benar saat {2}.', en: '{1} is worked out from the right guesses during {2}.' },
    answers: ['Accuracy', 'Testing'],
  },
]

// ---------------------------------------------------------------------------

function shuffle<T>(items: T[], rand: () => number): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** "Your robot got 9 of 12 right. What's its accuracy?" with nearby wrong answers. */
export function accuracyFromRun(ctx: RunContext): ChoiceQuestion | null {
  if (ctx.total < 2) return null
  const right = Math.round((ctx.correct / ctx.total) * 100)
  const wrong = new Set<number>()
  for (const v of [
    Math.round(((ctx.total - ctx.correct) / ctx.total) * 100),
    ctx.correct, // a common slip: the count, not the percentage
    right >= 50 ? right - 25 : right + 25,
    right === 100 ? 75 : Math.min(100, right + 10),
  ]) {
    if (v !== right && v >= 0 && v <= 100) wrong.add(v)
  }
  const options = [right, ...[...wrong].slice(0, 2)]
  if (options.length < 3) return null
  return {
    kind: 'choice',
    id: 'accuracy-run',
    terms: ['accuracy'],
    prompt: {
      id: `Robotmu menebak ${ctx.correct} dari ${ctx.total} buah dengan benar. Berapa accuracy-nya?`,
      en: `Your robot got ${ctx.correct} out of ${ctx.total} fruits right. What's its accuracy?`,
    },
    options: options.map((v, i) => ({ text: { id: `${v}%`, en: `${v}%` }, correct: i === 0 })),
  }
}

/** Every question the player can answer with the cards they've found so far. */
export function availableQuestions(found: Set<CardId>, ctx: RunContext | null, rand: () => number): Question[] {
  const has = (terms: CardId[]) => terms.every((t) => found.has(t))
  const all: Question[] = []
  for (const q of CHOICES) if (has(q.terms)) all.push({ ...q, kind: 'choice', options: shuffle(q.options, rand) })
  const fromRun = ctx ? accuracyFromRun(ctx) : null
  if (fromRun && has(fromRun.terms)) all.push({ ...fromRun, options: shuffle(fromRun.options, rand) })

  // Distractor chips come from terms the player already knows.
  const known = [...found].map((id) => TERM_NAME[id])
  for (const q of BLANKS) {
    if (!has(q.terms)) continue
    const extra = shuffle(known.filter((k) => !q.answers.includes(k)), rand).slice(0, 2)
    all.push({ ...q, kind: 'blank', chips: shuffle([...q.answers, ...extra], rand) })
  }
  return all
}

/**
 * Picks one question, avoiding recent ones and favouring terms with the
 * fewest stars, so weak terms come back more often.
 */
export function pickQuestion(
  found: Set<CardId>,
  stars: Partial<Record<CardId, number>>,
  recent: string[],
  ctx: RunContext | null,
  rand: () => number,
): Question | null {
  const pool = availableQuestions(found, ctx, rand)
  if (pool.length === 0) return null
  const fresh = pool.filter((q) => !recent.includes(q.id))
  const candidates = fresh.length > 0 ? fresh : pool
  const weight = (q: Question) => {
    const avgStars = q.terms.reduce((s, t) => s + (stars[t] ?? 0), 0) / q.terms.length
    return 4 - Math.min(3, avgStars) // 4 for an unstarred term, 1 for a mastered one
  }
  const total = candidates.reduce((s, q) => s + weight(q), 0)
  let roll = rand() * total
  for (const q of candidates) {
    roll -= weight(q)
    if (roll <= 0) return q
  }
  return candidates.at(-1)!
}

export const MAX_STARS = 3
export const QUIZ_CHANCE = 0.35

/**
 * Decides whether a quiz pops up after a run: never after a run that already
 * showed a new card, never twice in a row, and only once there's something
 * to ask about.
 */
export function shouldQuiz(opts: { foundCount: number; showedNewCard: boolean; quizzedLastRun: boolean; roll: number }) {
  if (opts.foundCount < 2 || opts.showedNewCard || opts.quizzedLastRun) return false
  return opts.roll < QUIZ_CHANCE
}
