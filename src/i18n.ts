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
  stop: { id: '■ STOP', en: '■ STOP' },
  clear: { id: '↺ BERSIHKAN', en: '↺ CLEAR' },
  clearTitle: { id: 'Bersihkan stage dan log. Blokmu tetap aman.', en: 'Clear the stage and log. Your blocks stay.' },
  startOver: { id: '⟲ Main dari awal', en: '⟲ Start over' },
  startOverConfirm: {
    id: 'Mulai lagi dari nol? Blok, kartu istilah, dan bintangmu akan dihapus, dan semua penjelasan akan muncul lagi.',
    en: 'Start again from zero? Your blocks, term cards and stars will be cleared, and every explanation will show again.',
  },
  startOverYes: { id: 'Ya, mulai lagi', en: 'Yes, start over' },
  cancel: { id: 'Batal', en: 'Cancel' },
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
  quizTitle: { id: 'KUIS KILAT', en: 'POP QUIZ' },
  quizMe: { id: '🎲 Kuis', en: '🎲 Quiz me' },
  quizSkip: { id: 'Lewati', en: 'Skip' },
  quizCheck: { id: 'Periksa', en: 'Check' },
  quizNext: { id: 'Lanjut ▶', en: 'Continue ▶' },
  quizCorrect: { id: 'Benar! +1 ⭐ untuk {terms}.', en: 'Correct! +1 ⭐ for {terms}.' },
  quizMaxed: { id: 'Benar! {terms} sudah bintang penuh.', en: 'Correct! {terms} already has full stars.' },
  quizWrong: { id: 'Belum tepat, tapi sekarang kamu tahu. Jawabannya: {answer}', en: 'Not quite, but now you know. The answer: {answer}' },
  quizBlankHint: {
    id: 'Seret istilah ke tempat kosong, atau ketuk istilah lalu ketuk tempatnya.',
    en: 'Drag a term into each gap, or tap a term and then tap a gap.',
  },
  quizBlankLabel: { id: 'Tempat kosong {n}', en: 'Gap {n}' },
  quizEmpty: { id: 'kosong', en: 'empty' },
  starsLabel: { id: '{n} dari 3 bintang', en: '{n} of 3 stars' },
  hintTitle: { id: 'PETUNJUK', en: 'HINT' },
  hintClose: { id: 'Tutup petunjuk', en: 'Close hint' },
  hint_start: { id: 'Mulai dari sini: seret blok ini ke area kerja.', en: 'Start here: drag this block onto the workspace.' },
  hint_addData: {
    id: 'Robot butuh data. Seret blok ini ke bawah "saat ▶ ditekan".',
    en: 'The robot needs data. Drag this block under "when ▶ clicked".',
  },
  hint_dataFirst: {
    id: 'Training butuh data. Taruh blok kumpulkan di atas blok training.',
    en: 'Training needs data. Put a collect block above the train block.',
  },
  hint_addTest: {
    id: 'Tambahkan testing di paling bawah supaya kelihatan seberapa pintar robotnya.',
    en: 'Add a test at the bottom to see how smart the robot is.',
  },
  hint_addTrain: {
    id: 'Robot belum di-training. Seret blok ini ke atas blok testing.',
    en: "The robot hasn't been trained. Drag this block above the test block.",
  },
  hint_addBanana: { id: 'Robot belum pernah lihat pisang. Tambahkan contoh pisang.', en: "The robot has never seen a banana. Add some banana examples." },
  hint_addApple: { id: 'Robot belum pernah lihat apel. Tambahkan contoh apel.', en: "The robot has never seen an apple. Add some apple examples." },
  hint_testMore: {
    id: 'Ubah angka ini jadi minimal 10 supaya hasilnya bisa dipercaya.',
    en: 'Change this to at least 10 so the result can be trusted.',
  },
  hint_moreRounds: { id: 'Robot masih bingung. Coba tambah ronde training di sini.', en: 'The robot is still confused. Try more training rounds here.' },
  hint_treeStart: {
    id: 'Mulai dengan satu pertanyaan. Seret blok ini ke bawah "saat ▶ ditekan".',
    en: 'Start with a question. Drag this block under "when ▶ clicked".',
  },
  hint_treeAsk: {
    id: 'Satu kandang untuk semua? Tanyakan sesuatu dulu supaya hewannya terpisah.',
    en: 'One pen for everyone? Ask a question first so the critters split up.',
  },
  hint_treeEmpty: {
    id: 'Pertanyaan ini punya cabang kosong. Isi "ya" dan "tidak" dengan kandang atau pertanyaan lain.',
    en: 'This question has an empty branch. Fill both "yes" and "no" with a pen or another question.',
  },
  hint_treePenBird: { id: 'Belum ada kandang burung. Tambahkan di salah satu cabang.', en: "There's no bird pen yet. Add one to a branch." },
  hint_treePenBee: { id: 'Belum ada kandang lebah. Tambahkan di salah satu cabang.', en: "There's no bee pen yet. Add one to a branch." },
  hint_treePenFrog: { id: 'Belum ada kandang katak. Tambahkan di salah satu cabang.', en: "There's no frog pen yet. Add one to a branch." },
  hint_treeColour: {
    id: 'Warna itu menjebak: ada burung yang kuning dan katak yang cokelat. Coba pertanyaan lain di sini.',
    en: 'Colour is a trap here: some birds are yellow and one frog is brown. Try another question.',
  },
  hint_treeBig: {
    id: 'Hati-hati, ada satu katak yang besar. Mungkin tanyakan soal sayap dulu?',
    en: 'Careful, one frog is big. Maybe ask about wings first?',
  },
  hint_treeCheck: {
    id: 'Lihat hewan mana yang salah kandang, lalu ubah pertanyaan atau kandangnya.',
    en: 'See which critters end up in the wrong pen, then change a question or a pen.',
  },
  hint_addTrainAfterData: {
    id: 'Robot belum di-training. Seret blok ini ke bawah blok kumpulkan.',
    en: "The robot hasn't been trained. Drag this block below the collect blocks.",
  },
  hint_testTwenty: { id: 'Untuk bonus ini, uji dengan minimal 20 buah.', en: 'For this bonus, test on at least 20 fruits.' },
  hint_treeLean: {
    id: 'Bisa lebih hemat? Coba pisahkan semuanya dengan 2 pertanyaan saja.',
    en: 'Can it be leaner? Try sorting everyone with just 2 questions.',
  },
  hint_treeColourPair: {
    id: 'Warna itu menjebak: ada satu katak yang cokelat. Coba pertanyaan lain di sini.',
    en: 'Colour is a trap here: one frog is brown. Try another question.',
  },
  hint_moreData: {
    id: 'Coba tambah contoh di dataset, untuk apel dan juga pisang.',
    en: 'Try adding more examples to the dataset, for apples and bananas.',
  },
  smallScreen: {
    id: 'Kotakata paling enak dimainkan di laptop atau tablet.',
    en: 'Kotakata plays best on a laptop or tablet.',
  },

  // Blockly categories
  catAll: { id: 'Semua', en: 'All' },
  catEvents: { id: 'Mulai', en: 'Start' },
  catData: { id: 'Data', en: 'Data' },
  catModel: { id: 'Model', en: 'Model' },

  levelLocked: { id: 'Selesaikan level sebelumnya dulu', en: 'Finish the level before this one' },
  levelUnlocked: { id: 'Level {n} terbuka! Pilih di daftar level.', en: 'Level {n} unlocked! Pick it from the level list.' },
  catAsk: { id: 'Pertanyaan', en: 'Questions' },
  catPens: { id: 'Kandang', en: 'Pens' },

  // Stages and badges
  stageLabel: { id: 'Tahap {n}', en: 'Stage {n}' },
  bonusLabel: { id: 'Bonus', en: 'Bonus' },
  stageDone: { id: 'Tahap selesai: {title}!', en: 'Stage complete: {title}!' },
  stageNext: { id: 'Tahap berikutnya: {title}', en: 'Next stage: {title}' },
  bonusOpen: { id: 'Semua tahap selesai! Ada tantangan bonus ⭐ kalau mau.', en: 'Every stage done! There is a bonus ⭐ challenge if you want it.' },
  allDone: { id: 'Level ini tuntas, termasuk bonusnya. Keren!', en: 'Level complete, bonus included. Nice!' },
  newBadge: { id: 'Lencana baru', en: 'New badge' },
  badges: { id: 'Lencana', en: 'Badges' },
  badgeLocked: { id: 'Belum didapat', en: 'Not earned yet' },

  s1CollectTitle: { id: 'Kumpulkan data', en: 'Collect data' },
  s1CollectMission: {
    id: 'Robot butuh contoh untuk belajar. Kumpulkan contoh apel DAN pisang di bawah "saat ▶ ditekan", lalu tekan ▶.',
    en: 'The robot needs examples to learn from. Collect apple AND banana examples under "when ▶ clicked", then press ▶.',
  },
  s1TrainTitle: { id: 'Latih robotnya', en: 'Train the robot' },
  s1TrainMission: {
    id: 'Datanya sudah ada. Tambahkan blok training di bawah blok kumpulkan, lalu lihat penanda di Otak Robot bergerak.',
    en: 'You have data. Add a train block below the collect blocks, then watch the markers move in the Robot Brain.',
  },
  s1TestTitle: { id: 'Uji dan capai 90%', en: 'Test it, reach 90%' },
  s1TestMission: {
    id: 'Sekarang uji robotnya dengan minimal 10 buah baru. Targetnya accuracy 90%.',
    en: 'Now test the robot on at least 10 new fruits. Aim for 90% accuracy.',
  },
  s1PerfectTitle: { id: 'Sempurna', en: 'Perfect score' },
  s1PerfectMission: {
    id: 'Tantangan bonus: capai accuracy 100% saat testing dengan 20 buah atau lebih.',
    en: 'Bonus challenge: reach 100% accuracy while testing on 20 or more fruits.',
  },
  s2PairTitle: { id: 'Satu pertanyaan', en: 'One question' },
  s2PairMission: {
    id: 'Yang datang baru lebah dan katak. Taruh SATU pertanyaan di bawah "saat ▶ ditekan", lalu kandang di cabang ya dan tidak. Targetnya 8 dari 8 benar.',
    en: 'Only bees and frogs are visiting so far. Put ONE question under "when ▶ clicked", then a pen on its yes and no branches. Aim for 8 out of 8.',
  },
  s2AllTitle: { id: 'Burung ikut datang', en: 'Here come the birds' },
  s2AllMission: {
    id: 'Burung juga mau masuk! Taruh pertanyaan kedua di dalam salah satu cabang supaya burung punya kandang sendiri. Targetnya 12 dari 12.',
    en: 'The birds want in too! Put a second question inside one of the branches so birds get their own pen. Aim for 12 out of 12.',
  },
  s2LeanTitle: { id: 'Pohon hemat', en: 'Lean tree' },
  s2LeanMission: {
    id: 'Tantangan bonus: pilah ke-12 hewan dengan paling banyak 2 pertanyaan, dan tanpa bertanya soal warna.',
    en: 'Bonus challenge: sort all 12 critters with at most 2 questions, and no questions about colour.',
  },
  stageNeedBothLabels: {
    id: 'Robot perlu contoh apel dan juga pisang.',
    en: 'The robot needs both apple and banana examples.',
  },
  stageNeedTrain: { id: 'Datanya sudah ada, tapi robot belum di-training.', en: "The data is there, but the robot hasn't been trained." },
  stageNeedTest: { id: 'Tambahkan blok testing supaya kelihatan seberapa pintar robotnya.', en: 'Add a test block to see how smart the robot is.' },
  stagePerfectFail: { id: 'Belum 100% dengan 20 buah atau lebih. Hampir!', en: 'Not 100% on 20 or more fruits yet. Close!' },
  stageLeanFail: {
    id: 'Semua hewan sudah benar, tapi pohonnya belum hemat: maksimal 2 pertanyaan, tanpa warna.',
    en: 'Everyone is sorted, but the tree is not lean yet: at most 2 questions, no colour.',
  },

  aFirstDataTitle: { id: 'Data pertama', en: 'First data' },
  aFirstDataDesc: { id: 'Mengumpulkan contoh pertama untuk robot.', en: 'Collected the first examples for the robot.' },
  aBalancedTitle: { id: 'Seimbang', en: 'Balanced' },
  aBalancedDesc: { id: 'Jumlah contoh apel dan pisang sama.', en: 'Same number of apple and banana examples.' },
  aTrainedTitle: { id: 'Robot terlatih', en: 'Trained robot' },
  aTrainedDesc: { id: 'Melatih robot dengan dua label.', en: 'Trained the robot on both labels.' },
  aOnTargetTitle: { id: 'Tepat sasaran', en: 'On target' },
  aOnTargetDesc: { id: 'Mencapai accuracy 90% saat testing.', en: 'Reached 90% accuracy in testing.' },
  aPerfectTitle: { id: 'Sempurna', en: 'Perfect' },
  aPerfectDesc: { id: '100% benar pada 20 buah atau lebih.', en: '100% right on 20 or more fruits.' },
  aFirstSplitTitle: { id: 'Split pertama', en: 'First split' },
  aFirstSplitDesc: { id: 'Satu pertanyaan memisahkan lebah dan katak.', en: 'One question sorted the bees from the frogs.' },
  aAllPensTitle: { id: 'Rumah untuk semua', en: 'A home for everyone' },
  aAllPensDesc: { id: 'Ketiga kandang ada di pohonmu.', en: 'All three pens are in your tree.' },
  aNestedTitle: { id: 'Pohon bertingkat', en: 'Branching out' },
  aNestedDesc: { id: 'Menaruh pertanyaan di dalam cabang.', en: 'Put a question inside a branch.' },
  aNoTrapTitle: { id: 'Lolos jebakan', en: 'Dodged the trap' },
  aNoTrapDesc: { id: 'Memilah semua hewan tanpa bertanya soal warna.', en: 'Sorted every critter without asking about colour.' },
  aLeanTitle: { id: 'Hemat', en: 'Lean' },
  aLeanDesc: { id: 'Memilah ke-12 hewan dengan 2 pertanyaan saja.', en: 'Sorted all 12 critters with just 2 questions.' },

  // Level 3
  l3Title: { id: 'Bukit Loss', en: 'Hill of Loss' },
  catHill: { id: 'Langkah', en: 'Moves' },
  blkLr: { id: 'learning rate = %1', en: 'learning rate = %1' },
  blkSteps: { id: 'turun %1 langkah', en: 'step downhill %1 times' },
  s3GentleTitle: { id: 'Turun bukit', en: 'Down the hill' },
  s3GentleMission: {
    id: 'Bawa robot ke bendera di lembah, tempat loss paling kecil. Robot punya energi untuk 30 langkah. Tambahkan langkah sampai ia sampai.',
    en: 'Get the robot to the flag in the valley, where loss is lowest. It has energy for 30 steps. Add steps until it gets there.',
  },
  s3ShortTitle: { id: 'Energi terbatas', en: 'Low on energy' },
  s3ShortMission: {
    id: 'Sekarang energinya cuma cukup untuk 6 langkah. Learning rate 0.1 terlalu pelan. Coba learning rate yang lebih besar.',
    en: 'Now there is only energy for 6 steps. A learning rate of 0.1 is too slow. Try a bigger one.',
  },
  s3SteepTitle: { id: 'Bukit curam', en: 'Steep hill' },
  s3SteepMission: {
    id: 'Bukit ini jauh lebih curam, dan energinya 10 langkah. Learning rate yang tadi bagus mungkin bikin robot terpental. Cari yang pas.',
    en: 'This hill is much steeper, with energy for 10 steps. The learning rate that worked before may send the robot bouncing. Find one that fits.',
  },
  s3OneTitle: { id: 'Satu lompatan', en: 'One jump' },
  s3OneMission: {
    id: 'Tantangan bonus: di bukit landai, mendarat di lembah dengan SATU langkah saja.',
    en: 'Bonus challenge: on the gentle hill, land in the valley with just ONE step.',
  },
  logHillStart: { id: 'Loss awal: {loss}. Energi: {budget} langkah.', en: 'Starting loss: {loss}. Energy: {budget} steps.' },
  logHillEnd: { id: 'Setelah {n} langkah, loss = {loss}.', en: 'After {n} steps, loss = {loss}.' },
  logHillArrived: { id: 'Sampai di lembah pada langkah ke-{n}!', en: 'Reached the valley on step {n}!' },
  warnNoLr: { id: 'Belum ada blok learning rate, jadi robot memakai 0.1.', en: 'No learning rate block yet, so the robot used 0.1.' },
  warnTired: { id: 'Energi habis! Langkah sisanya tidak dijalankan.', en: 'Out of energy! The remaining steps did not run.' },
  warnFlewOff: { id: 'Terpental! Lompatannya terlalu jauh sampai robot keluar bukit.', en: 'Bounced off! The jumps were so big the robot flew off the hill.' },
  hillFlewOffNext: { id: 'Coba learning rate yang lebih kecil.', en: 'Try a smaller learning rate.' },
  hillNotThere: { id: 'Robot belum sampai di lembah.', en: "The robot hasn't reached the valley yet." },
  hillOneFail: { id: 'Belum sampai dalam satu langkah. Learning rate mana yang pas?', en: 'Not there in one step. Which learning rate fits exactly?' },
  hint_hillAddSteps: { id: 'Robot butuh langkah. Seret blok ini ke bawah blok learning rate.', en: 'The robot needs steps. Drag this block below the learning rate.' },
  hint_hillAddLr: { id: 'Atur learning rate dulu, sebelum blok langkah.', en: 'Set a learning rate first, above the steps.' },
  hint_hillMoreSteps: { id: 'Hampir! Tambah jumlah langkahnya di sini.', en: 'Almost! Add more steps here.' },
  hint_hillTooSmall: { id: 'Langkahnya terlalu kecil untuk energi segini. Coba learning rate yang lebih besar.', en: 'Those steps are too small for this much energy. Try a bigger learning rate.' },
  hint_hillTooBig: { id: 'Terlalu besar! Robotnya terpental. Coba learning rate yang lebih kecil.', en: 'Too big! The robot flew off. Try a smaller learning rate.' },
  hint_hillBounce: { id: 'Robot memantul bolak-balik melewati lembah. Kecilkan learning rate-nya.', en: 'The robot keeps bouncing over the valley. Make the learning rate smaller.' },
  hint_hillOneStep: { id: 'Satu langkah, tepat sasaran: ada satu learning rate yang pas di bukit ini.', en: 'One step, dead on: one learning rate fits this hill exactly.' },
  aFirstStepTitle: { id: 'Langkah pertama', en: 'First step' },
  aFirstStepDesc: { id: 'Robot mulai menuruni bukit.', en: 'The robot started down the hill.' },
  aValleyTitle: { id: 'Sampai lembah', en: 'Valley reached' },
  aValleyDesc: { id: 'Mencapai titik loss terendah.', en: 'Reached the lowest loss.' },
  aBouncedTitle: { id: 'Terpental', en: 'Bounced off' },
  aBouncedDesc: { id: 'Mencoba learning rate yang terlalu besar. Eksperimen itu bagus!', en: 'Tried a learning rate that was too big. Experimenting is good!' },
  aSteepTitle: { id: 'Pendaki tebing', en: 'Cliff climber' },
  aSteepDesc: { id: 'Menuruni bukit curam tanpa terpental.', en: 'Got down the steep hill without bouncing off.' },
  aOneJumpTitle: { id: 'Satu lompatan', en: 'One jump' },
  aOneJumpDesc: { id: 'Mendarat di lembah dalam satu langkah.', en: 'Landed in the valley in one step.' },
  winBodyHill: { id: 'Robot menuruni kedua bukit sampai ke lembah.', en: 'The robot made it down both hills to the valley.' },

  // Level 2
  l2Title: { id: 'Taman Decision Tree', en: 'Decision Tree Garden' },
  l2Mission: {
    id: 'Bantu burung, lebah, dan katak masuk ke kandangnya. Susun pertanyaan ya/tidak di bawah "saat ▶ ditekan", lalu taruh kandang di ujung tiap cabang. Targetnya 12 dari 12 hewan masuk kandang yang benar.',
    en: 'Help the birds, bees and frogs into their pens. Stack yes/no questions under "when ▶ clicked", and put a pen at the end of every branch. Aim for all 12 critters in the right pen.',
  },
  blkAsk: { id: 'apakah %1 ? %2 ya ▸ %3 tidak ▸ %4', en: 'is it %1 ? %2 yes ▸ %3 no ▸ %4' },
  blkPen: { id: 'masuk kandang %1', en: 'send to the %1 pen' },
  qWings: { id: 'bersayap', en: 'winged' },
  qBig: { id: 'besar', en: 'big' },
  qGreen: { id: 'hijau', en: 'green' },
  qYellow: { id: 'kuning', en: 'yellow' },
  qBrown: { id: 'cokelat', en: 'brown' },
  penBird: { id: '🐦 burung', en: '🐦 bird' },
  penBee: { id: '🐝 lebah', en: '🐝 bee' },
  penFrog: { id: '🐸 katak', en: '🐸 frog' },
  logTreeEmpty: {
    id: 'Belum ada pertanyaan atau kandang di bawah "saat ▶ ditekan".',
    en: 'There are no questions or pens under "when ▶ clicked" yet.',
  },
  warnOnePen: { id: 'Semua hewan masuk ke satu kandang yang sama.', en: 'Every critter goes to the same pen.' },
  warnEmptyBranch: {
    id: 'Ada cabang yang kosong. Hewan yang lewat situ bakal tersesat.',
    en: 'A branch is empty. Critters that go that way will get lost.',
  },
  logSorted: { id: 'Hasil: {correct}/{total} hewan di kandang yang benar.', en: 'Result: {correct}/{total} critters in the right pen.' },
  logLost: { id: '{n} hewan tersesat di cabang kosong.', en: '{n} critters got lost on an empty branch.' },
  tryAgainTree: {
    id: 'Belum semua di kandang yang benar. Perhatikan hewan yang salah masuk, lalu ubah pertanyaannya.',
    en: 'Not everyone is in the right pen yet. Watch which critters go wrong, then change a question.',
  },

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
  winBodyTree: {
    id: 'Semua 12 hewan masuk ke kandang yang benar.',
    en: 'All 12 critters are in the right pen.',
  },
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
export type CardId =
  | 'dataset'
  | 'label'
  | 'training'
  | 'testing'
  | 'accuracy'
  | 'classification'
  | 'feature'
  | 'split'
  | 'leaf'
  | 'prediction'
  | 'decisionTree'
  | 'loss'
  | 'gradient'
  | 'learningRate'
  | 'convergence'
  | 'gradientDescent'

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

export const LEVEL2_CARDS: TermCard[] = [
  {
    id: 'feature',
    term: 'Feature',
    icon: '🔎',
    body: {
      id: 'Ciri yang bisa diamati dari sesuatu, misalnya punya sayap, ukuran, atau warna.',
      en: 'Something you can observe about an item, like having wings, its size, or its colour.',
    },
    moment: {
      id: 'Robot tidak bisa "melihat" hewan seperti kita. Ia hanya tahu feature-nya: bersayap atau tidak, besar atau kecil, dan warnanya. Pertanyaan di pohonmu selalu tentang feature.',
      en: "The garden can't \"see\" critters the way we do. It only knows their features: winged or not, big or small, and colour. Every question in your tree is about a feature.",
    },
  },
  {
    id: 'split',
    term: 'Split',
    icon: '🪧',
    body: {
      id: 'Satu pertanyaan ya/tidak yang membagi data jadi dua kelompok.',
      en: 'One yes/no question that divides the data into two groups.',
    },
    moment: {
      id: 'Papan ini adalah split: satu pertanyaan ya/tidak. Hewan yang jawabannya "ya" belok ke kiri, yang "tidak" ke kanan.',
      en: 'This signpost is a split: one yes/no question. Critters that answer "yes" go left, and "no" go right.',
    },
  },
  {
    id: 'leaf',
    term: 'Leaf',
    icon: '🍃',
    body: {
      id: 'Ujung sebuah cabang di decision tree, tempat pohon memberi jawabannya.',
      en: 'The end of a branch in a decision tree, where the tree gives its answer.',
    },
    moment: {
      id: 'Kandang di ujung cabang ini disebut leaf. Di sini pohon berhenti bertanya dan memberi jawaban.',
      en: 'A pen at the end of a branch is called a leaf. This is where the tree stops asking and gives its answer.',
    },
  },
  {
    id: 'prediction',
    term: 'Prediction',
    icon: '🔮',
    body: {
      id: 'Jawaban yang diberikan model untuk satu contoh, entah benar atau salah.',
      en: 'The answer a model gives for one example, right or wrong.',
    },
    moment: {
      id: 'Kandang tempat tiap hewan berakhir adalah prediction dari pohonmu. Kali ini {correct} dari {total} prediction benar.',
      en: 'The pen each critter ends up in is your tree\'s prediction. This time, {correct} of {total} predictions were right.',
    },
  },
  {
    id: 'decisionTree',
    term: 'Decision Tree',
    icon: '🌳',
    body: {
      id: 'Model yang mengambil keputusan lewat urutan pertanyaan ya/tidak, seperti diagram alur.',
      en: 'A model that decides through a series of yes/no questions, like a flowchart.',
    },
    moment: {
      id: 'Split dan leaf yang kamu susun bersama-sama membentuk decision tree. Enaknya, kamu bisa membaca persis kenapa tiap hewan masuk ke kandangnya. Tidak semua model AI semudah ini dibaca.',
      en: "Together, your splits and leaves make a decision tree. The nice part: you can read exactly why each critter went where it did. Not every AI model is this easy to read.",
    },
  },
]

export const LEVEL3_CARDS: TermCard[] = [
  {
    id: 'loss',
    term: 'Loss',
    icon: '⛰️',
    body: {
      id: 'Angka yang menunjukkan seberapa salah sebuah model. Makin kecil, makin baik.',
      en: 'A number that says how wrong a model is. Smaller is better.',
    },
    moment: {
      id: 'Tinggi bukit ini adalah loss: seberapa salah model saat ini. Sekarang loss-nya {loss}. Tujuan training adalah turun ke lembah, tempat loss paling kecil.',
      en: "The height of this hill is the loss: how wrong the model is right now. It's {loss} at the moment. Training is about getting down to the valley, where loss is smallest.",
    },
  },
  {
    id: 'gradient',
    term: 'Gradient',
    icon: '↗️',
    body: {
      id: 'Arah dan kecuraman kemiringan loss di titik saat ini.',
      en: 'The direction and steepness of the loss slope at the current point.',
    },
    moment: {
      id: 'Panah ini adalah gradient: ia menunjuk ke arah bukit menanjak, dan panjangnya menunjukkan seberapa curam. Robot melangkah ke arah sebaliknya supaya turun.',
      en: 'This arrow is the gradient: it points the way the hill goes up, and its length shows how steep it is. The robot steps the opposite way to go down.',
    },
  },
  {
    id: 'learningRate',
    term: 'Learning Rate',
    icon: '👟',
    body: {
      id: 'Seberapa besar langkah sebuah model setiap kali belajar.',
      en: 'How big a step a model takes each time it learns.',
    },
    moment: {
      id: 'Jauhnya lompatan ini ditentukan learning rate ({lr}). Terlalu kecil: lambat. Terlalu besar: bisa terpental melewati lembah. Ingat robot di Level 1? Ia bergeser setengah jalan tiap ronde, itu learning rate 0.5.',
      en: 'How far this jump goes is set by the learning rate ({lr}). Too small and it crawls. Too big and it can overshoot the valley. Remember the Level 1 robot moving halfway each round? That was a learning rate of 0.5.',
    },
  },
  {
    id: 'convergence',
    term: 'Convergence',
    icon: '🏁',
    body: {
      id: 'Saat langkah-langkah training akhirnya mendarat dan berhenti di titik terbaik.',
      en: 'When training steps finally settle at the best point.',
    },
    moment: {
      id: 'Robot sudah converge: ia sampai di lembah, dan langkah berikutnya tidak membuat loss lebih kecil lagi. Di sinilah training bisa berhenti.',
      en: "The robot has converged: it reached the valley, and more steps won't lower the loss any further. This is where training can stop.",
    },
  },
  {
    id: 'gradientDescent',
    term: 'Gradient Descent',
    icon: '⛷️',
    body: {
      id: 'Cara melatih model: lihat kemiringan, melangkah turun, lalu ulangi sampai loss sekecil mungkin.',
      en: 'A way to train a model: look at the slope, step downhill, and repeat until the loss is as small as it gets.',
    },
    moment: {
      id: 'Yang kamu lakukan dari tadi namanya gradient descent: lihat gradient, melangkah turun, ulangi. Banyak model AI, termasuk model bahasa yang besar, dilatih dengan cara ini, hanya saja bukitnya punya jutaan bahkan miliaran arah.',
      en: "What you've been doing is called gradient descent: check the gradient, step downhill, repeat. Many AI models, large language models included, are trained this way, just on hills with millions or even billions of directions.",
    },
  },
]
