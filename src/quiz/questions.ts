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
  loss: 'Loss',
  gradient: 'Gradient',
  learningRate: 'Learning Rate',
  convergence: 'Convergence',
  gradientDescent: 'Gradient Descent',
  token: 'Token',
  probability: 'Probability',
  temperature: 'Temperature',
  context: 'Context',
  llm: 'LLM',
  ai: 'AI',
  trainingData: 'Training Data',
  model: 'Model',
  machineLearning: 'Machine Learning',
  bias: 'Bias',
  dataQuality: 'Data Quality',
  testData: 'Test Data',
  overfitting: 'Overfitting',
  fairness: 'Fairness',
  generativeAI: 'Generative AI',
  hallucination: 'Hallucination',
  prompt: 'Prompt',
  aiAsTool: 'AI as a Tool',
  pixel: 'Pixel',
  edgeDetection: 'Edge Detection',
  objectDetection: 'Object Detection',
  sensorFusion: 'Sensor Fusion',
  computerVision: 'Computer Vision',
  recommender: 'Recommender System',
  explainability: 'Explainability',
  treeLearning: 'Decision Tree Learning',
  historicalBias: 'Historical Bias',
  pruning: 'Pruning',
  dataPrivacy: 'Data Privacy',
  falsePositive: 'False Positive',
  falseNegative: 'False Negative',
  humanInTheLoop: 'Human in the Loop',
  aiEthics: 'AI Ethics',
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
      id: 'Misalnya robot cuma dapat 3 contoh apel. Apa yang paling membantu dataset-nya?',
      en: 'Say a robot only got 3 apple examples. What would help its dataset most?',
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
      opt('Warnanya: merah = apel, kuning = pisang', 'Colour: red = apple, yellow = banana', true),
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
      opt('Bergerak di ban berjalan', 'Moves along a conveyor belt'),
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
  // Level 3
  {
    id: 'loss-what',
    terms: ['loss'],
    prompt: { id: 'Loss yang makin kecil artinya…', en: 'A smaller loss means…' },
    options: [
      opt('Model makin jarang salah', 'The model is less wrong', true),
      opt('Model makin lambat', 'The model is slower'),
      opt('Datanya makin sedikit', 'There is less data'),
    ],
  },
  {
    id: 'gradient-what',
    terms: ['gradient'],
    prompt: { id: 'Gradient memberi tahu robot…', en: 'The gradient tells the robot…' },
    options: [
      opt('Ke arah mana bukit menanjak, dan seberapa curam', 'Which way the hill goes up, and how steeply', true),
      opt('Berapa banyak energinya', 'How much energy it has'),
      opt('Di mana benderanya', 'Where the flag is'),
    ],
  },
  {
    id: 'lr-small',
    terms: ['learningRate'],
    prompt: { id: 'Kalau learning rate terlalu kecil, robot akan…', en: 'If the learning rate is too small, the robot will…' },
    options: [
      opt('Turun sangat pelan dan bisa kehabisan energi', 'Go down very slowly and may run out of energy', true),
      opt('Terpental keluar bukit', 'Fly off the hill'),
      opt('Langsung sampai dalam satu langkah', 'Arrive in one step'),
    ],
  },
  {
    id: 'lr-big',
    terms: ['learningRate'],
    prompt: { id: 'Kalau learning rate terlalu besar, robot akan…', en: 'If the learning rate is too big, the robot will…' },
    options: [
      opt('Melompati lembah dan bisa terpental', 'Jump past the valley and may bounce off', true),
      opt('Turun dengan sangat hati-hati', 'Go down very carefully'),
      opt('Diam di tempat', 'Stay where it is'),
    ],
  },
  {
    id: 'lr-hill',
    terms: ['learningRate'],
    prompt: {
      id: 'Kenapa learning rate 0.4 berhasil di bukit landai tapi gagal di bukit curam?',
      en: 'Why does a learning rate of 0.4 work on the gentle hill but fail on the steep one?',
    },
    options: [
      opt('Learning rate yang pas bergantung pada bentuk bukitnya', 'The right learning rate depends on the shape of the hill', true),
      opt('Bukit curam tidak punya lembah', 'The steep hill has no valley'),
      opt('Robotnya capek', 'The robot is tired'),
    ],
  },
  {
    id: 'convergence-what',
    terms: ['convergence'],
    prompt: { id: 'Model dikatakan sudah converge kalau…', en: 'A model has converged when…' },
    options: [
      opt('Langkah berikutnya tidak lagi menurunkan loss', 'More steps no longer lower the loss', true),
      opt('Energinya habis', 'It runs out of energy'),
      opt('Learning rate-nya diganti', 'Its learning rate changes'),
    ],
  },
  // Level 4
  {
    id: 'token-what',
    terms: ['token'],
    prompt: { id: 'Bagaimana model bahasa menulis sebuah kalimat?', en: 'How does a language model write a sentence?' },
    options: [
      opt('Satu token demi satu token', 'One token at a time', true),
      opt('Seluruh kalimat sekaligus', 'The whole sentence at once'),
      opt('Dari kata terakhir ke kata pertama', 'From the last word back to the first'),
    ],
  },
  {
    id: 'probability-what',
    terms: ['probability'],
    prompt: { id: 'Dari mana penyair tahu probability tiap token berikutnya?', en: 'Where does the bard get the probability of each next token?' },
    options: [
      opt('Dari seberapa sering token itu muncul di cerita yang pernah ia dengar', 'From how often that token came next in the stories it heard', true),
      opt('Dari urutan abjad', 'From alphabetical order'),
      opt('Dari panjang katanya', 'From how long the word is'),
    ],
  },
  {
    id: 'temp-zero',
    terms: ['temperature'],
    prompt: { id: 'Dengan temperature 0, model akan…', en: 'At temperature 0, the model will…' },
    options: [
      opt('Selalu memilih token yang paling mungkin', 'Always pick the most likely token', true),
      opt('Memilih token secara acak sepenuhnya', 'Pick tokens completely at random'),
      opt('Berhenti menulis', 'Stop writing'),
    ],
  },
  {
    id: 'temp-high',
    terms: ['temperature'],
    prompt: { id: 'Kalau temperature-nya tinggi sekali, ceritanya cenderung…', en: 'With a very high temperature, the story tends to be…' },
    options: [
      opt('Lebih liar dan bisa ngawur', 'Wilder, and it may stop making sense', true),
      opt('Selalu sama', 'Always the same'),
      opt('Lebih pendek', 'Shorter'),
    ],
  },
  {
    id: 'context-loop',
    terms: ['context'],
    prompt: { id: 'Kenapa penyair yang cuma ingat 1 kata bisa mengulang terus?', en: 'Why can a bard that only remembers 1 word keep repeating itself?' },
    options: [
      opt('Context-nya terlalu pendek, jadi ia lupa sudah sampai mana', 'Its context is too short, so it loses track of where it is', true),
      opt('Temperature-nya terlalu tinggi', 'Its temperature is too high'),
      opt('Ia kehabisan token', 'It ran out of tokens'),
    ],
  },
  {
    id: 'llm-what',
    terms: ['llm'],
    prompt: { id: 'Apa yang sama antara penyair kedai dan chatbot AI?', en: 'What do the tavern bard and an AI chatbot have in common?' },
    options: [
      opt('Keduanya menebak token berikutnya berdasarkan context', 'Both predict the next token from the context', true),
      opt('Keduanya belajar dari 5 kalimat saja', 'Both learned from just 5 sentences'),
      opt('Keduanya selalu benar', 'Both are always right'),
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
    id: 'blank-descent',
    terms: ['gradient', 'learningRate', 'gradientDescent'],
    sentence: {
      id: 'Di {3}, robot melihat {1} lalu melangkah turun sejauh yang diatur {2}.',
      en: 'In {3}, the robot checks the {1} and steps downhill as far as the {2} allows.',
    },
    answers: ['Gradient', 'Learning Rate', 'Gradient Descent'],
  },
  {
    id: 'blank-loss',
    terms: ['loss', 'convergence'],
    sentence: {
      id: 'Tujuan training adalah membuat {1} sekecil mungkin, sampai model mencapai {2}.',
      en: 'Training aims to make the {1} as small as possible, until the model reaches {2}.',
    },
    answers: ['Loss', 'Convergence'],
  },
  {
    id: 'blank-next',
    terms: ['token', 'probability', 'context'],
    sentence: {
      id: 'Untuk memilih {1} berikutnya, model melihat {3}, lalu menghitung {2} tiap pilihan.',
      en: 'To choose the next {1}, the model looks at the {3}, then works out the {2} of each option.',
    },
    answers: ['Token', 'Probability', 'Context'],
  },
  {
    id: 'blank-temp',
    terms: ['temperature', 'llm'],
    sentence: {
      id: '{1} mengatur seberapa acak sebuah {2} memilih kata.',
      en: '{1} sets how randomly an {2} picks its words.',
    },
    answers: ['Temperature', 'LLM'],
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
