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
  clearTitle: { id: 'Bersihkan layar dan log. Blokmu tetap aman.', en: 'Clear the stage and log. Your blocks stay.' },
  startOver: { id: '⟲ Main dari awal', en: '⟲ Start over' },
  startOverConfirm: {
    id: 'Mulai lagi dari nol? Blok, progres level, kartu istilah, bintang, dan lencanamu akan dihapus, dan semua penjelasan akan muncul lagi.',
    en: 'Start again from zero? Your blocks, level progress, term cards, stars and badges will be cleared, and every explanation will show again.',
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
    id: 'Robot belum di-training. Seret blok ini ke atas testing.',
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
    id: 'Robot belum di-training. Seret blok ini ke bawah kumpulkan.',
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

  levelLocked: { id: 'Selesaikan level sebelumnya dulu', en: 'Finish the previous level first' },
  levelUnlocked: { id: 'Level {n} terbuka! Pilih di daftar level.', en: 'Level {n} unlocked! Pick it from the level list.' },
  catAsk: { id: 'Pertanyaan', en: 'Questions' },
  catPens: { id: 'Kandang', en: 'Pens' },

  // Stages and badges
  demoLoop: {
    id: 'Tahap baru! Lihat dulu: penyair yang cuma ingat 1 kata. Program contoh sedang diputar, perhatikan ceritanya.',
    en: 'New stage! First, watch a bard that only remembers 1 word. A sample program is playing; watch the story.',
  },
  demoCrawl: {
    id: 'Tahap baru! Lihat dulu: learning rate 0,1 dengan energi 6 langkah. Program contoh sedang diputar.',
    en: 'New stage! First, watch a learning rate of 0.1 with 6 steps of energy. A sample program is playing.',
  },
  bonusToo: { id: 'Wah, sekalian dapat bonus ⭐!', en: 'Nice, you got the bonus ⭐ too!' },
  logStopped: { id: 'Program dihentikan.', en: 'Program stopped.' },
  logNoStart: {
    id: 'Blok "saat ▶ ditekan" tidak ada. Seret dari kategori Mulai, lalu pasang blok lain di bawahnya.',
    en: 'The "when ▶ clicked" block is missing. Drag it in from Start, then attach blocks under it.',
  },
  logLoose: {
    id: 'Ada blok yang belum menempel ke program, jadi tidak ikut dijalankan.',
    en: "Some blocks aren't attached to the program, so they didn't run.",
  },
  hint_loose: {
    id: 'Blok ini belum menempel. Seret sampai menempel di bawah blok lain.',
    en: "This block isn't attached. Drag it until it snaps under another block.",
  },
  termLook: { id: '▲ Lihat bagian yang berkedip di atas', en: '▲ Look at the blinking box above' },
  cardsButton: { id: '📚 Kartu istilah ({n})', en: '📚 Term cards ({n})' },
  starsHelp: {
    id: 'Isi bintang di tiap kartu dengan menjawab kuis 🎲 dengan benar.',
    en: 'Fill the stars on each card by answering quizzes 🎲 correctly.',
  },
  newBadges: { id: '{n} lencana baru', en: '{n} new badges' },
  lcTitle: { id: 'Level {n} selesai!', en: 'Level {n} complete!' },
  lcCards: { id: 'Istilah yang kamu kumpulkan', en: 'Terms you collected' },
  lcNext: { id: 'Level berikutnya ▶', en: 'Next level ▶' },
  lcBonus: { id: 'Coba tantangan bonus ⭐', en: 'Try the bonus ⭐' },
  finTitle: { id: 'Semua level selesai! 🎉', en: 'Every level complete! 🎉' },
  finBody: {
    id: 'Ini semua istilah AI yang sudah kamu temui. Coba jelaskan satu ke temanmu!',
    en: "Here's every AI term you met. Try explaining one to a friend!",
  },
  close: { id: 'Tutup', en: 'Close' },
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
    id: 'Robot butuh contoh untuk belajar. Kumpulkan contoh apel DAN pisang di bawah "saat ▶ ditekan", lalu tekan ▶ JALANKAN.',
    en: 'The robot needs examples to learn from. Collect apple AND banana examples under "when ▶ clicked", then press ▶ RUN.',
  },
  s1TrainTitle: { id: 'Latih robotnya', en: 'Train the robot' },
  s1TrainMission: {
    id: 'Datanya sudah ada. Tambahkan blok training di bawah blok kumpulkan, lalu lihat dua penanda muncul dan bergerak di Otak Robot.',
    en: 'You have data. Add a train block below the collect blocks, then watch two markers appear and move in Robot Brain.',
  },
  s1TestTitle: { id: 'Uji dan capai 90%', en: 'Test it, reach 90%' },
  s1TestMission: {
    id: 'Sekarang uji robotnya dengan minimal 10 buah baru. Targetnya 90% tebakan benar (accuracy).',
    en: 'Now test the robot on at least 10 new fruits. Aim for 90% accuracy.',
  },
  s1PerfectTitle: { id: 'Sempurna', en: 'Perfect score' },
  s1PerfectMission: {
    id: 'Tantangan bonus: 100% tebakan benar saat testing dengan 20 buah atau lebih.',
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

  // Level 4
  l4Title: { id: 'Kedai Token', en: 'Token Tavern' },
  catTokSettings: { id: 'Pengaturan', en: 'Settings' },
  catTokWrite: { id: 'Tulis', en: 'Write' },
  blkTokStart: { id: 'mulai dengan %1', en: 'start with %1' },
  blkTokTemp: { id: 'tingkat kejutan (temperature) = %1', en: 'temperature = %1' },
  blkTokContext: { id: 'ingat %1 kata terakhir (context)', en: 'remember the last %1 words (context)' },
  blkTokWrite: { id: 'tulis %1 token (kata)', en: 'write %1 token(s)' },
  tok_the: { id: 'si', en: 'the' },
  tok_cat: { id: 'kucing', en: 'cat' },
  tok_dog: { id: 'anjing', en: 'dog' },
  tok_bard: { id: 'penyair', en: 'bard' },
  tok_sleeps: { id: 'tidur', en: 'sleeps' },
  tok_drinks: { id: 'minum', en: 'drinks' },
  tok_sings: { id: 'bernyanyi', en: 'sings' },
  tok_milk: { id: 'susu', en: 'milk' },
  tok_by: { id: 'dekat', en: 'by' },
  tok_end: { id: '.', en: '.' },
  s4FirstTitle: { id: 'Token pertama', en: 'First tokens' },
  s4FirstMission: {
    id: 'Penyair kedai bercerita satu token (kata) demi satu token. Minta ia menulis minimal 4 token, lalu lihat bar probability di setiap langkah.',
    en: 'The tavern bard tells stories one token at a time. Ask for at least 4 tokens, and watch the probability bars at each step.',
  },
  s4SurpriseTitle: { id: 'Bumbu kejutan', en: 'A little surprise' },
  s4SurpriseMission: {
    id: 'Pengunjung bosan, ceritanya selalu sama! Atur temperature supaya penyair kadang memilih token lain, dan bikin cerita yang berbeda dari biasanya.',
    en: 'The guests are bored: the story is always the same! Set a temperature so the bard sometimes picks other tokens, and tell a story that differs from the usual one.',
  },
  s4ContextTitle: { id: 'Ingatan lebih panjang', en: 'A longer memory' },
  s4ContextMission: {
    id: 'Pemilik kedai meminta cerita yang pasti berakhir dengan titik. Pakai temperature 0, lalu bantu penyair menyelesaikan kalimatnya. Kalau ia cuma ingat 1 kata, ia bisa terjebak mengulang.',
    en: 'Set temperature to 0 and get the bard to finish the sentence with a full stop. If it only remembers 1 word, it can get stuck in a loop.',
  },
  s4CreativeTitle: { id: 'Penyair sejati', en: 'True bard' },
  s4CreativeMission: {
    id: 'Tantangan bonus: dengan temperature 1 atau lebih, ceritakan kalimat yang selesai sampai titik, tidak mengulang, dan berbeda dari cerita biasa.',
    en: 'Bonus challenge: at temperature 1 or more, tell a sentence that reaches the full stop, never loops, and differs from the usual story.',
  },
  logTokStory: { id: 'Cerita: {story}', en: 'Story: {story}' },
  logTokLoop: { id: 'Penyair mengulang-ulang kata yang sama.', en: 'The bard keeps repeating itself.' },
  logTokFinished: { id: 'Kalimatnya selesai sampai titik.', en: 'The sentence reached the full stop.' },
  tokNeedMore: { id: 'Tulis minimal 4 token.', en: 'Write at least 4 tokens.' },
  tokSameBoring: {
    id: 'Ceritanya sama seperti biasa. Dengan temperature 0, penyair selalu memilih token paling mungkin.',
    en: 'Same story as always. At temperature 0, the bard always picks the most likely token.',
  },
  tokSameChance: {
    id: 'Kebetulan ceritanya sama dengan yang biasa. Itu bagian dari keacakan! Jalankan lagi.',
    en: 'By chance it came out the usual story. That is randomness for you! Run it again.',
  },
  tokNeedCold: { id: 'Untuk tahap ini, pakai temperature 0 supaya ceritanya pasti.', en: 'For this stage, use temperature 0 so the story is certain.' },
  tokLoop: {
    id: 'Penyair terjebak mengulang. Ia cuma ingat kata terakhir, jadi tidak tahu sudah sampai mana.',
    en: 'The bard is stuck in a loop. It only remembers the last word, so it loses track of where it is.',
  },
  tokNotFinished: { id: 'Ceritanya belum sampai titik.', en: "The story hasn't reached the full stop yet." },
  tokNeedWarm: { id: 'Bonus ini butuh temperature 1 atau lebih.', en: 'This bonus needs a temperature of 1 or more.' },
  tokTempBelow: {
    id: 'Blok temperature ada di bawah blok tulis, jadi belum dipakai. Pindahkan ke atas blok tulis.',
    en: "The temperature block is below the write block, so it wasn't used yet. Move it above the write block.",
  },
  tokContextBelow: {
    id: 'Blok ingatan (context) ada di bawah blok tulis, jadi belum dipakai. Pindahkan ke atas blok tulis.',
    en: "The memory (context) block is below the write block, so it wasn't used yet. Move it above the write block.",
  },
  hint_tokOrder: {
    id: 'Blok ini ada di bawah blok tulis, jadi belum dipakai. Seret ke atas blok tulis.',
    en: "This block is below the write block, so it isn't used yet. Drag it above the write block.",
  },
  warnUnusedSetting: {
    id: 'Ada blok pengaturan di bawah blok tulis. Pengaturan itu belum dipakai.',
    en: "A settings block sits below the write block, so it wasn't used.",
  },
  hint_tokAddWrite: { id: 'Penyair butuh perintah menulis. Seret blok ini ke bawah blok mulai.', en: 'The bard needs a write block. Drag this below the start block.' },
  hint_tokMoreTokens: { id: 'Tambah jumlah token di sini.', en: 'Ask for more tokens here.' },
  hint_tokAddTemp: { id: 'Tambahkan temperature di atas blok tulis supaya ada kejutan.', en: 'Add a temperature above the write block for some surprise.' },
  hint_tokWarmUp: { id: 'Naikkan temperature-nya supaya penyair berani memilih token lain.', en: 'Raise the temperature so the bard dares to pick other tokens.' },
  hint_tokRunAgain: { id: 'Kebetulan sama. Jalankan lagi, keacakan bisa berbeda tiap kali.', en: 'Same by chance. Run again; randomness differs each time.' },
  hint_tokCool: { id: 'Tahap ini butuh temperature 0.', en: 'This stage needs temperature 0.' },
  hint_tokAddContext: { id: 'Beri penyair ingatan yang lebih panjang. Seret blok ini ke atas blok tulis.', en: 'Give the bard a longer memory. Drag this above the write block.' },
  hint_tokContextTwo: { id: 'Ubah jadi 2 supaya penyair ingat dua kata terakhir.', en: 'Change this to 2 so the bard remembers the last two words.' },
  aFirstWordTitle: { id: 'Kata pertama', en: 'First word' },
  aFirstWordDesc: { id: 'Penyair menulis token pertamanya.', en: 'The bard wrote its first token.' },
  aSurpriseTitle: { id: 'Kejutan', en: 'Surprise' },
  aSurpriseDesc: { id: 'Cerita yang berbeda dari biasanya.', en: 'A story different from the usual one.' },
  aHotTitle: { id: 'Kepanasan', en: 'Too hot' },
  aHotDesc: { id: 'Mencoba temperature 2. Ceritanya jadi liar!', en: 'Tried temperature 2. Things got wild!' },
  aMemoryTitle: { id: 'Ingatan panjang', en: 'Long memory' },
  aMemoryDesc: { id: 'Menyelesaikan kalimat dengan context 2 kata.', en: 'Finished a sentence with 2-word context.' },
  aBardTitle: { id: 'Penyair sejati', en: 'True bard' },
  aBardDesc: { id: 'Cerita kreatif yang tetap utuh.', en: 'A creative story that still holds together.' },
  winBodyTavern: { id: 'Penyair bisa bercerita dengan rapi dan juga penuh kejutan.', en: 'The bard can tell a tidy story, and a surprising one too.' },

  // Level 3
  l3Title: { id: 'Bukit Loss', en: 'Hill of Loss' },
  catHill: { id: 'Langkah', en: 'Moves' },
  blkLr: { id: 'panjang lompatan (learning rate) = %1', en: 'learning rate = %1' },
  blkSteps: { id: 'turun %1 langkah', en: 'step downhill %1 times' },
  s3GentleTitle: { id: 'Turun bukit', en: 'Down the hill' },
  s3GentleMission: {
    id: 'Bawa robot ke bendera di lembah, tempat loss paling kecil. Robot punya energi untuk 30 langkah. Tambahkan langkah sampai robot tiba di bendera.',
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
  warnTired: { id: 'Energi habis sebelum robot sampai di lembah.', en: 'The robot ran out of energy before reaching the valley.' },
  logTiredArrived: { id: 'Robot sudah sampai, jadi sisa langkahnya tidak dipakai.', en: 'The robot is already there, so the extra steps were not used.' },
  logHillGoal: { id: 'Target: loss di bawah {goal} (di dalam zona bendera).', en: 'Goal: loss below {goal} (inside the flag zone).' },
  logHillBounce: {
    id: 'Robot memantul bolak-balik melewati lembah: lompatannya terlalu jauh.',
    en: 'The robot keeps bouncing over the valley: its jumps are too long.',
  },
  hudGoal: { id: 'TARGET < {goal}', en: 'GOAL < {goal}' },
  hudFlewOff: { id: 'terpental di sini!', en: 'flew off here!' },
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
    id: 'Ajari robot memilah apel dan pisang. Kumpulkan data berlabel, latih (training), lalu uji (testing) dengan minimal 10 buah. Targetnya 90% tebakan benar (accuracy).',
    en: 'Teach the robot to sort apples from bananas. Collect labelled data, train it, then test it on at least 10 fruits. Aim for 90% accuracy.',
  },
  blkWhenRun: { id: 'saat ▶ ditekan', en: 'when ▶ clicked' },
  blkCollect: { id: 'kumpulkan %1 contoh %2', en: 'collect %1 examples of %2' },
  blkTrain: { id: 'training selama %1 ronde', en: 'train for %1 rounds' },
  blkTest: { id: 'testing dengan %1 buah baru', en: 'test on %1 new fruits' },
  apple: { id: '🍎 apel', en: '🍎 apple' },
  banana: { id: '🍌 pisang', en: '🍌 banana' },

  logStart: { id: 'Program dimulai.', en: 'Program started.' },
  logEmpty: {
    id: 'Belum ada blok di bawah "saat ▶ ditekan". Seret blok dari kotak alat.',
    en: 'No blocks under "when ▶ clicked" yet. Drag some in from the toolbox.',
  },
  logCollect: { id: 'Mengumpulkan {n} contoh {label}.', en: 'Collected {n} {label} examples.' },
  logMarkersSwapped: {
    id: 'Penanda di Otak Robot belum sampai di tempatnya. Latih beberapa ronde lagi.',
    en: "The markers in the Robot Brain haven't reached their spots yet. Train a few more rounds.",
  },
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

/** Decimal numbers the way each language writes them: 0,1 in Indonesian, 0.1 in English. */
export function num(lang: Lang, n: number | string) {
  const s = String(n)
  return lang === 'id' ? s.replace('.', ',') : s
}

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
  | 'token'
  | 'probability'
  | 'temperature'
  | 'context'
  | 'llm'

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
      id: 'Ini dataset-mu: {n} contoh yang akan dipelajari robot. Tiap titik di Otak Robot adalah satu buah, diletakkan menurut warna kulit dan bentuk buahnya.',
      en: 'This is your dataset: {n} examples the robot will learn from. Each dot in the Robot Brain is one fruit, placed by its colour and shape.',
    },
  },
  {
    id: 'label',
    term: 'Label',
    icon: '🏷️',
    body: {
      id: 'Jawaban yang benar untuk tiap contoh, misalnya "apel" atau "pisang".',
      en: 'The correct answer attached to each example, like "apple" or "banana".',
    },
    moment: {
      id: 'Warna titiknya adalah label: jawaban benar yang kamu berikan. Titik merah = apel, titik kuning = pisang. Tanpa label, robot tidak tahu apa yang harus dipelajari.',
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
      id: 'Dua penanda ini adalah tebakan robot tentang "apel itu seperti apa" dan "pisang itu seperti apa". Awalnya tertukar! Tiap ronde training, penanda bergeser setengah jalan ke tengah contohnya. Warna latar menunjukkan apa yang akan ditebak robot di tiap area.',
      en: 'These two markers are the robot\'s idea of "what an apple looks like" and "what a banana looks like". They start swapped! Each training round moves them halfway towards the middle of their examples. The shading shows what the robot would guess in each area.',
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
      id: 'Buah-buah ini baru, belum pernah dilihat robot. Kalau robot cuma menghafal contoh, ia akan gagal di sini. Testing adalah cara jujur untuk tahu apakah benar-benar belajar.',
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
      id: 'Split dan leaf yang kamu susun bersama-sama membentuk decision tree. Enaknya, bisa membaca persis kenapa tiap hewan masuk ke kandangnya. Tidak semua model AI semudah ini dibaca.',
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
      id: 'Robot sudah converge: ia sampai di lembah, dan langkah berikutnya hampir tidak mengubah loss lagi. Di sinilah training bisa berhenti.',
      en: 'The robot has converged: it reached the valley, and more steps barely change the loss any more. This is where training can stop.',
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

export const LEVEL4_CARDS: TermCard[] = [
  {
    id: 'token',
    term: 'Token',
    icon: '🧩',
    body: {
      id: 'Potongan kecil teks yang dibaca dan ditulis model bahasa, biasanya satu kata atau sebagian kata.',
      en: 'A small piece of text a language model reads and writes, usually a word or part of one.',
    },
    moment: {
      id: 'Tiap kepingan di gulungan ini adalah token. Model bahasa tidak menulis satu kalimat sekaligus. Ia menulis satu token, lalu memutuskan token berikutnya.',
      en: "Each piece on this scroll is a token. A language model doesn't write a whole sentence at once. It writes one token, then decides on the next.",
    },
  },
  {
    id: 'probability',
    term: 'Probability',
    icon: '📊',
    body: {
      id: 'Seberapa mungkin sesuatu terjadi, dari 0% sampai 100%.',
      en: 'How likely something is, from 0% to 100%.',
    },
    moment: {
      id: 'Bar ini menunjukkan probability tiap token berikutnya. Garis tipis abu-abu adalah peluang aslinya, dihitung dari cerita yang pernah didengar penyair: "{word}" muncul {raw}% dari semua kemungkinan. Bar berwarna adalah peluang setelah temperature diterapkan.',
      en: 'These bars show the probability of each next token. The thin grey line is the raw chance, counted from the stories the bard has heard: "{word}" came next {raw}% of the time. The coloured bar is the chance after temperature is applied.',
    },
  },
  {
    id: 'context',
    term: 'Context',
    icon: '🧠',
    body: {
      id: 'Bagian teks sebelumnya yang dilihat model saat memilih token berikutnya.',
      en: 'The earlier text a model looks at when it picks the next token.',
    },
    moment: {
      id: 'Garis tosca di bawah gulungan menunjukkan context: kata-kata yang diingat penyair saat memilih token berikutnya. Makin panjang context-nya, makin kecil kemungkinan ia tersesat atau mengulang.',
      en: 'The teal line under the scroll shows the context: the words the bard keeps in mind when picking the next token. The longer the context, the less likely it is to lose track or repeat itself.',
    },
  },
  {
    id: 'temperature',
    term: 'Temperature',
    icon: '🌡️',
    body: {
      id: 'Pengaturan yang menentukan seberapa acak model memilih token. 0 selalu memilih yang paling mungkin.',
      en: 'A setting for how randomly a model picks tokens. 0 always picks the most likely one.',
    },
    moment: {
      id: 'Temperature {t} membuat bar-bar ini lebih rata, jadi token yang jarang pun kadang terpilih. Bandingkan dengan garis abu-abu aslinya. Hasilnya lebih kreatif, tapi kalau terlalu panas, ceritanya bisa kacau.',
      en: 'A temperature of {t} makes these bars more equal, so less likely words sometimes win. Compare them with the grey raw lines. The result is more creative, but too hot and the story can go off the rails.',
    },
  },
  {
    id: 'llm',
    term: 'LLM',
    icon: '💬',
    body: {
      id: 'Large Language Model: model bahasa yang sangat besar, dilatih dari teks dalam jumlah raksasa untuk menebak token berikutnya.',
      en: 'Large Language Model: a very big language model, trained on huge amounts of text to predict the next token.',
    },
    moment: {
      id: 'Penyair ini adalah model bahasa mini yang belajar dari 5 kalimat. LLM seperti chatbot AI bekerja dengan ide yang sama: menebak token berikutnya berdasarkan context. Bedanya, mereka belajar dari miliaran kalimat dan memakai context yang jauh lebih panjang.',
      en: 'This bard is a tiny language model trained on 5 sentences. LLMs like AI chatbots run on the same idea: predict the next token from the context. The difference is that they learn from billions of sentences and use a far longer context.',
    },
  },
]
