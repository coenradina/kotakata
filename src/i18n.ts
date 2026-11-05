// UI text in Indonesian and English. Technical ML terms stay in English in
// both languages, on purpose: they're the words learners will meet later.

export type Lang = 'id' | 'en'

const STORAGE_KEY = 'kotakata.lang'

export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'id' || saved === 'en') return saved
  } catch {
    /* storage can be blocked; fall through */
  }
  return navigator.language?.toLowerCase().startsWith('id') ? 'id' : 'en'
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* not critical */
  }
}

const dict = {
  tagline: {
    id: 'Susun blok, latih AI, kumpulkan kartu istilah.',
    en: 'Stack blocks, train an AI, collect term cards.',
  },
  back: { id: '← aastr.id', en: '← aastr.id' },
  levels: { id: 'Level', en: 'Levels' },
  comingSoon: { id: 'Segera', en: 'Soon' },
  run: { id: '▶ JALANKAN', en: '▶ RUN' },
  running: { id: 'BERJALAN...', en: 'RUNNING...' },
  reset: { id: '↺ ULANG', en: '↺ RESET' },
  goal: { id: 'Misi', en: 'Mission' },
  log: { id: 'Log', en: 'Log' },
  cards: { id: 'Kartu istilah', en: 'Term cards' },
  locked: { id: 'Terkunci', en: 'Locked' },
  unlockHint: { id: 'Selesaikan misi untuk membuka kartu.', en: 'Finish the mission to unlock cards.' },
  smallScreen: {
    id: 'Kotakata paling enak dimainkan di laptop atau tablet.',
    en: 'Kotakata plays best on a laptop or tablet.',
  },

  // Blockly categories
  catEvents: { id: 'Mulai', en: 'Start' },
  catData: { id: 'Data', en: 'Data' },
  catModel: { id: 'Model', en: 'Model' },

  // Level 1
  l1Title: { id: 'Latih Robot', en: 'Train the Robot' },
  l1Short: { id: 'Classification', en: 'Classification' },
  l1Mission: {
    id: 'Ajari robot memilah apel dan pisang. Kumpulkan data berlabel, latih (training), lalu uji (testing) dengan minimal 10 buah. Targetnya accuracy 90%.',
    en: 'Teach the robot to sort apples from bananas. Collect labelled data, train it, then test it on at least 10 fruits. Aim for 90% accuracy.',
  },
  blkWhenRun: { id: 'saat ▶ ditekan', en: 'when ▶ clicked' },
  blkCollect: { id: 'kumpulkan %1 contoh berlabel %2', en: 'collect %1 examples labelled %2' },
  blkTrain: { id: 'training selama %1 ronde', en: 'train for %1 rounds' },
  blkTest: { id: 'testing dengan %1 buah baru', en: 'test on %1 new fruits' },
  apple: { id: '🍎 apple', en: '🍎 apple' },
  banana: { id: '🍌 banana', en: '🍌 banana' },

  logStart: { id: 'Program dimulai.', en: 'Program started.' },
  logEmpty: {
    id: 'Belum ada blok di bawah "saat ▶ ditekan". Seret blok dari kotak alat.',
    en: 'No blocks under "when ▶ clicked" yet. Drag some in from the toolbox.',
  },
  logCollect: { id: 'Mengumpulkan {n} contoh {label}.', en: 'Collected {n} {label} examples.' },
  logTrain: { id: 'Training ronde {r}/{total}…', en: 'Training round {r}/{total}…' },
  logTest: { id: 'Testing: {correct}/{total} benar. Accuracy {acc}%.', en: 'Testing: {correct}/{total} right. Accuracy {acc}%.' },
  warnTestBeforeTrain: {
    id: 'Robot belum dilatih, jadi ia cuma bisa bengong. Tambahkan blok training sebelum testing.',
    en: "The robot hasn't been trained, so it just stares. Add a train block before testing.",
  },
  warnTrainWithoutData: {
    id: 'Tidak ada data untuk dipelajari. Kumpulkan contoh dulu.',
    en: 'There is no data to learn from. Collect examples first.',
  },
  warnOneLabel: {
    id: 'Robot hanya melihat satu label. Ia akan mengira semua buah sama.',
    en: 'The robot only saw one label. It will think every fruit is the same.',
  },
  winTitle: { id: 'Misi selesai!', en: 'Mission complete!' },
  winBody: {
    id: 'Robotmu mencapai accuracy {acc}%. Kartu istilah baru terbuka.',
    en: 'Your robot reached {acc}% accuracy. New term cards unlocked.',
  },
  tryAgainLow: {
    id: 'Accuracy {acc}%. Belum 90%. Coba tambah data atau ronde training.',
    en: 'Accuracy {acc}%. Not 90% yet. Try more data or more training rounds.',
  },
  tryAgainSmallTest: {
    id: 'Uji dengan minimal 10 buah supaya hasilnya bisa dipercaya.',
    en: 'Test on at least 10 fruits so the result can be trusted.',
  },
} satisfies Record<string, Record<Lang, string>>

export type Key = keyof typeof dict

export function t(lang: Lang, key: Key, vars: Record<string, string | number> = {}) {
  return dict[key][lang].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
}

// Term cards. `term` is always English.
export interface TermCard {
  term: string
  icon: string
  body: Record<Lang, string>
}

export const LEVEL1_CARDS: TermCard[] = [
  {
    term: 'Dataset',
    icon: '🗃️',
    body: {
      id: 'Kumpulan contoh yang dipakai AI untuk belajar. Makin beragam, makin baik.',
      en: 'The collection of examples an AI learns from. More variety is better.',
    },
  },
  {
    term: 'Label',
    icon: '🏷️',
    body: {
      id: 'Jawaban yang benar untuk tiap contoh, misalnya "apple" atau "banana".',
      en: 'The correct answer attached to each example, like "apple" or "banana".',
    },
  },
  {
    term: 'Training',
    icon: '🏋️',
    body: {
      id: 'Proses AI menyesuaikan dirinya berulang kali sampai tebakannya cocok dengan label.',
      en: 'The AI adjusting itself, round after round, until its guesses match the labels.',
    },
  },
  {
    term: 'Testing',
    icon: '🧪',
    body: {
      id: 'Memeriksa AI dengan contoh baru yang belum pernah ia lihat.',
      en: "Checking the AI on new examples it hasn't seen before.",
    },
  },
  {
    term: 'Accuracy',
    icon: '🎯',
    body: {
      id: 'Persentase tebakan yang benar saat testing. 18 dari 20 benar = 90%.',
      en: 'The share of correct guesses during testing. 18 out of 20 right = 90%.',
    },
  },
  {
    term: 'Classification',
    icon: '🗂️',
    body: {
      id: 'Tugas AI memasukkan sesuatu ke salah satu kelompok, seperti apel atau pisang.',
      en: 'An AI task that puts each item into one group, like apple or banana.',
    },
  },
]
