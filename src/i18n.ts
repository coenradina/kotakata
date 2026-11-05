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
  unlockHint: {
    id: 'Kartu terbuka saat kamu menemukan istilahnya di dalam game.',
    en: 'Cards unlock as you meet each term in the game.',
  },
  newTerm: { id: 'ISTILAH BARU', en: 'NEW TERM' },
  gotIt: { id: 'Lanjut ▶', en: 'Got it ▶' },
  whatItMeans: { id: 'Artinya', en: 'What it means' },
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
    id: 'Robotmu mencapai accuracy {acc}%.',
    en: 'Your robot reached {acc}% accuracy.',
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

// Term cards. `term` is always English. `moment` is shown in the game the
// first time the player meets the term, filled in with numbers from their run.
export type CardId = 'dataset' | 'label' | 'training' | 'testing' | 'accuracy' | 'classification'

export interface TermCard {
  id: CardId
  term: string
  icon: string
  body: Record<Lang, string>
  moment: Record<Lang, string>
}

export const LEVEL1_CARDS: TermCard[] = [
  {
    id: 'dataset',
    term: 'Dataset',
    icon: '🗃️',
    body: {
      id: 'Kumpulan contoh yang dipakai AI untuk belajar. Makin beragam, makin baik.',
      en: 'The collection of examples an AI learns from. More variety is better.',
    },
    moment: {
      id: 'Ini dataset-mu: {n} contoh yang akan dipelajari robot. Tiap titik di Otak Robot adalah satu buah, diletakkan menurut warna dan bentuknya.',
      en: 'This is your dataset: {n} examples the robot will learn from. Each dot in the Robot Brain is one fruit, placed by its colour and shape.',
    },
  },
  {
    id: 'label',
    term: 'Label',
    icon: '🏷️',
    body: {
      id: 'Jawaban yang benar untuk tiap contoh, misalnya "apple" atau "banana".',
      en: 'The correct answer attached to each example, like "apple" or "banana".',
    },
    moment: {
      id: 'Warna tiap titik adalah label-nya: jawaban benar yang kamu berikan. Merah = apple, kuning = banana. Tanpa label, robot tidak tahu apa yang harus dipelajari.',
      en: "Each dot's colour is its label: the right answer you gave it. Red = apple, yellow = banana. Without labels, the robot wouldn't know what to learn.",
    },
  },
  {
    id: 'training',
    term: 'Training',
    icon: '🏋️',
    body: {
      id: 'Proses AI menyesuaikan dirinya berulang kali sampai tebakannya cocok dengan label.',
      en: 'The AI adjusting itself, round after round, until its guesses match the labels.',
    },
    moment: {
      id: 'Dua penanda ini adalah tebakan robot tentang "apel itu seperti apa" dan "pisang itu seperti apa". Awalnya tertukar! Tiap ronde training, penanda bergeser ke tengah contohnya. Warna latar menunjukkan apa yang akan ditebak robot di tiap area.',
      en: 'These two markers are the robot\'s idea of "what an apple looks like" and "what a banana looks like". They start swapped! Each training round moves them towards the middle of their examples. The shading shows what the robot would guess in each area.',
    },
  },
  {
    id: 'testing',
    term: 'Testing',
    icon: '🧪',
    body: {
      id: 'Memeriksa AI dengan contoh baru yang belum pernah ia lihat.',
      en: "Checking the AI on new examples it hasn't seen before.",
    },
    moment: {
      id: 'Buah-buah ini baru, belum pernah dilihat robot. Kalau robot cuma menghafal contoh, ia akan gagal di sini. Testing adalah cara jujur untuk tahu apakah ia benar-benar belajar.',
      en: "These fruits are new: the robot has never seen them. A robot that only memorised its examples would fail here. Testing is the honest way to find out whether it really learned.",
    },
  },
  {
    id: 'accuracy',
    term: 'Accuracy',
    icon: '🎯',
    body: {
      id: 'Persentase tebakan yang benar saat testing. 18 dari 20 benar = 90%.',
      en: 'The share of correct guesses during testing. 18 out of 20 right = 90%.',
    },
    moment: {
      id: 'Robot menebak {correct} dari {total} buah dengan benar. Itu artinya accuracy-nya {acc}%. Misi ini butuh minimal 90%.',
      en: 'The robot got {correct} out of {total} fruits right. That makes its accuracy {acc}%. This mission needs at least 90%.',
    },
  },
  {
    id: 'classification',
    term: 'Classification',
    icon: '🗂️',
    body: {
      id: 'Tugas AI memasukkan sesuatu ke salah satu kelompok, seperti apel atau pisang.',
      en: 'An AI task that puts each item into one group, like apple or banana.',
    },
    moment: {
      id: 'Yang barusan kamu ajarkan namanya classification: memasukkan tiap benda ke satu kelompok. Filter spam email dan aplikasi pengenal tanaman juga bekerja dengan cara ini.',
      en: 'What you just taught is called classification: putting each item into one group. Email spam filters and plant-ID apps work the same way.',
    },
  },
]
