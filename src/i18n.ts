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
    id: 'Susun blok, latih AI, isi Buku Kata.',
    en: "Stack blocks, train an AI, fill Kata's notebook.",
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
  cardsButton: { id: '📓 Buku Kata ({n})', en: "📓 Kata's notebook ({n})" },
  nTrainCollect: { id: 'Robot belajar dari contoh. Apakah robot sudah punya contoh dari kedua jenis buah?', en: 'The robot learns from examples. Does it have examples of both fruits yet?' },
  xTrainCollect: { id: 'Contoh: "kumpulkan 3 contoh apel" lalu "kumpulkan 3 contoh pisang", dua-duanya di bawah "saat ▶ ditekan".', en: 'For example: "collect 3 examples of apple" then "collect 3 examples of banana", both under "when ▶ clicked".' },
  nTrainTrain: { id: 'Robot sudah punya data. Apa yang harus terjadi supaya ia belajar dari data itu?', en: 'The robot has data now. What has to happen for it to learn from that data?' },
  xTrainTrain: { id: 'Contoh: taruh "training selama 1 ronde" di bawah blok-blok kumpulkan.', en: 'For example: put "train for 1 rounds" under the collect blocks.' },
  nTrainTest: { id: 'Lihat Otak Robot. Apakah penanda apel dan pisang sudah dekat dengan titik-titik buahnya?', en: 'Look at the Robot Brain. Are the apple and banana markers close to their fruit dots yet?' },
  xTrainTest: { id: 'Contoh: kumpulkan 6 apel dan 6 pisang, "training selama 3 ronde", lalu "testing dengan 10 buah baru".', en: 'For example: collect 6 apples and 6 bananas, "train for 3 rounds", then "test on 10 new fruits".' },
  nTrainPerfect: { id: 'Untuk 100%, robot harus benar di semua buah. Apa yang membuat penandanya makin tepat?', en: 'For 100%, the robot has to get every fruit right. What makes its markers more exact?' },
  xTrainPerfect: { id: 'Contoh: kumpulkan 10 apel dan 10 pisang, "training selama 4 ronde", lalu "testing dengan 20 buah baru".', en: 'For example: collect 10 apples and 10 bananas, "train for 4 rounds", then "test on 20 new fruits".' },
  nTreePair: { id: 'Lebah dan katak berbeda di mana? Cari satu ciri yang dimiliki lebah tapi tidak dimiliki katak.', en: 'How are bees and frogs different? Find one thing every bee has and no frog has.' },
  xTreePair: { id: 'Contoh: "apakah bersayap?" ya ▸ kandang lebah, tidak ▸ kandang katak.', en: 'For example: "is it winged?" yes ▸ bee pen, no ▸ frog pen.' },
  nTreeAll: { id: 'Burung dan lebah sama-sama bersayap. Ciri apa lagi yang membedakan mereka?', en: 'Birds and bees both have wings. What else tells them apart?' },
  xTreeAll: { id: 'Contoh: "apakah bersayap?" ya ▸ tanya "apakah besar?" (ya ▸ burung, tidak ▸ lebah), tidak ▸ katak.', en: 'For example: "is it winged?" yes ▸ ask "is it big?" (yes ▸ bird, no ▸ bee), no ▸ frog.' },
  nTreeLean: { id: 'Warna itu jebakan: ada burung kuning dan katak cokelat. Bisa pakai dua pertanyaan saja, tanpa warna?', en: 'Colour is a trap: some birds are yellow and one frog is brown. Can you do it with two questions and no colour?' },
  xTreeLean: { id: 'Contoh: "apakah bersayap?" ya ▸ "apakah besar?" (ya ▸ burung, tidak ▸ lebah), tidak ▸ katak. Tanpa pertanyaan warna.', en: 'For example: "is it winged?" yes ▸ "is it big?" (yes ▸ bird, no ▸ bee), no ▸ frog. No colour questions.' },
  nHillGentle: { id: 'Panah menunjukkan kemiringan bukit. Seberapa panjang lompatan robot setiap langkah?', en: 'The arrow shows how steep the hill is. How far does the robot jump each step?' },
  xHillGentle: { id: 'Contoh: "panjang lompatan (learning rate) = 0,4" lalu "turun 10 langkah".', en: 'For example: "learning rate = 0.4" then "step downhill 10 times".' },
  nHillShort: { id: 'Energinya cuma 6 langkah. Kalau lompatannya pendek, apakah cukup untuk sampai?', en: "There's only energy for 6 steps. If each jump is short, is that enough to get there?" },
  xHillShort: { id: 'Contoh: "panjang lompatan (learning rate) = 0,4" lalu "turun 6 langkah".', en: 'For example: "learning rate = 0.4" then "step downhill 6 times".' },
  nHillSteep: { id: 'Di bukit curam, lompatan yang tadi membuat robot memantul. Bagaimana kalau lompatannya lebih pendek?', en: 'On the steep hill, the jump that worked before makes the robot bounce. What about a shorter jump?' },
  xHillSteep: { id: 'Contoh: "panjang lompatan (learning rate) = 0,1" lalu "turun 10 langkah".', en: 'For example: "learning rate = 0.1" then "step downhill 10 times".' },
  nHillOne: { id: 'Cuma satu lompatan. Panjang lompatan berapa yang membawa robot tepat ke dasar lembah?', en: 'Just one jump. Which learning rate lands the robot exactly at the bottom?' },
  xHillOne: { id: 'Contoh: "panjang lompatan (learning rate) = 0,5" lalu "turun 1 langkah".', en: 'For example: "learning rate = 0.5" then "step downhill 1 times".' },
  nTavernFirst: { id: 'Penyair menulis satu token setiap kali. Berapa token yang diminta programmu?', en: 'The bard writes one token at a time. How many tokens does your program ask for?' },
  xTavernFirst: { id: 'Contoh: "mulai dengan si" lalu "tulis 4 token (kata)".', en: 'For example: "start with the" then "write 4 token(s)".' },
  nTavernSurprise: { id: 'Dengan temperature 0, penyair selalu memilih token yang paling mungkin. Apa yang terjadi kalau temperature-nya dinaikkan?', en: 'At temperature 0 the bard always picks the most likely token. What happens if you raise the temperature?' },
  xTavernSurprise: { id: 'Contoh: taruh "temperature = 1" di atas "tulis 4 token (kata)".', en: 'For example: put "temperature = 1" above "write 4 token(s)".' },
  nTavernContext: { id: 'Dengan ingatan 1 kata, penyair lupa apa yang baru ia tulis. Bagaimana kalau ia mengingat 2 kata?', en: 'With a one-word memory, the bard forgets what it just wrote. What if it remembered 2 words?' },
  xTavernContext: { id: 'Contoh: "ingat 2 kata terakhir (context)", temperature 0, lalu "tulis 10 token (kata)".', en: 'For example: "remember the last 2 words (context)", temperature 0, then "write 10 token(s)".' },
  nTavernCreative: { id: 'Temperature tinggi membuat cerita berbeda, tapi bisa tidak selesai. Ingatan berapa kata yang membantu cerita tetap selesai?', en: 'A high temperature makes a different story, but it may not finish. How many words of memory help it still finish?' },
  xTavernCreative: {
    id: 'Contoh: "mulai dengan kucing", "ingat 2 kata terakhir (context)", "temperature = 1", lalu "tulis 10 token (kata)". Kalau ceritanya masih sama, jalankan sekali lagi: di temperature 1 hasilnya berubah tiap kali.',
    en: 'For example: "start with cat", "remember the last 2 words (context)", "temperature = 1", then "write 10 token(s)". If the story comes out the same, run it again: at temperature 1 it changes every time.',
  },
  hintRung: { id: 'Petunjuk {n} dari 3', en: 'Hint {n} of 3' },
  navMap: { id: 'Peta sekolah', en: 'School map' },
  navNotebook: { id: 'Buku Kata', en: 'Notebook' },
  heroEyebrow: { id: 'SATU JAM, SATU IDE AI', en: 'ONE HOUR, ONE AI IDEA' },
  heroTitle: { id: 'Ajari Kata, robot kelasmu.', en: 'Teach Kata, your class robot.' },
  heroLead: { id: 'Susun blok, jalankan, dan lihat sendiri bagaimana AI belajar, salah, lalu diperbaiki. Untuk SMP. Gratis, tanpa daftar.', en: 'Stack blocks, press run, and watch an AI learn, get things wrong, and get fixed. Made for ages 12 to 15. Free, no sign-up.' },
  heroStart: { id: '▶ Mulai main', en: '▶ Start playing' },
  heroMap: { id: 'Lihat peta sekolah', en: 'See the school map' },
  sessionsTitle: { id: 'Sesi baru: kehidupan sekolah, teman, dan internet', en: 'New sessions: school, friends and the internet' },
  sessionsLead: { id: 'Setiap sesi butuh satu jam dan membahas satu ide AI. Sesi 1 sudah bisa dimainkan. Sesi 3 dan 5 menyusul.', en: 'Each session takes an hour and covers one AI idea. Session 1 is ready to play. Sessions 3 and 5 are next.' },
  sessionLabel: { id: 'SESI {n}', en: 'SESSION {n}' },
  minutes: { id: '{n} mnt', en: '{n} min' },
  kelasChip: { id: 'Kelas {k}', en: 'Grade {k}' },
  soon: { id: 'Segera hadir', en: 'Coming soon' },
  firstRelease: { id: 'Rilis pertama', en: 'First release' },
  classicTitle: { id: 'Sudah bisa dimainkan: 4 level klasik', en: 'Play now: 4 classic levels' },
  classicLead: { id: 'Level-level awal Kotakata. Progresmu di sini tetap tersimpan saat sesi baru hadir.', en: "Kotakata's first levels. Your progress here stays when the new sessions arrive." },
  levelN: { id: 'Level {n}', en: 'Level {n}' },
  play: { id: 'Main ▶', en: 'Play ▶' },
  replay: { id: 'Main lagi', en: 'Play again' },
  certificate: { id: 'Sertifikat', en: 'Certificate' },
  forWhoTitle: { id: 'Untuk siapa?', en: 'Who is it for?' },
  forStudents: { id: 'Untuk siswa', en: 'For students' },
  forStudentsBody: { id: 'Main langsung tanpa akun. Progresmu disimpan di perangkat ini.', en: 'Play straight away, no account. Your progress stays on this device.' },
  forTeachers: { id: 'Untuk guru', en: 'For teachers' },
  forTeachersBody: { id: 'Sesi dibuat untuk satu pertemuan KKA (2 JP) atau Hour of Code, lengkap dengan versi unplugged. Panduan guru segera hadir.', en: 'Each session fits one KKA meeting (2 JP) or an Hour of Code, with an unplugged version. Teacher guides are coming soon.' },
  forParents: { id: 'Untuk orang tua', en: 'For parents' },
  forParentsBody: { id: 'Main bareng anak di rumah, lalu ngobrol soal AI di HP kalian. Panduan orang tua segera hadir.', en: 'Play together at home, then talk about the AI in your own phones. Parent guides are coming soon.' },
  footerMade: { id: 'Dibuat oleh', en: 'Made by' },
  footerSource: { id: 'Kode sumber (MIT)', en: 'Source code (MIT)' },
  mapTitle: { id: 'SMP Kotakata', en: 'SMP Kotakata' },
  mapLead: { id: 'Setiap ruangan adalah satu sesi. Ruangan berwarna sudah bisa dimainkan.', en: 'Every room is a session. Rooms in colour are open now.' },
  floorNew: { id: 'Lantai 2 · Sesi baru', en: 'Floor 2 · New sessions' },
  floorClassic: { id: 'Lantai 1 · Level klasik', en: 'Floor 1 · Classic levels' },
  roomDone: { id: 'Selesai', en: 'Done' },
  roomOpen: { id: 'Terbuka', en: 'Open' },
  certTitle: { id: 'SERTIFIKAT KOTAKATA', en: 'KOTAKATA CERTIFICATE' },
  certGiven: { id: 'diberikan kepada', en: 'awarded to' },
  certFor: { id: 'karena telah menyelesaikan', en: 'for completing' },
  certLearned: { id: 'Yang dipelajari', en: 'What they learned' },
  certNameLabel: { id: 'Nama di sertifikat', en: 'Name on the certificate' },
  certNameHelp: { id: 'Namamu hanya dipakai di perangkat ini untuk membuat sertifikat. Tidak dikirim ke mana pun.', en: "Your name is only used on this device to make the certificate. It isn't sent anywhere." },
  certNamePlaceholder: { id: 'Tulis namamu', en: 'Type your name' },
  certPng: { id: '⬇ Unduh gambar (PNG)', en: '⬇ Download image (PNG)' },
  certPrint: { id: '🖨 Cetak atau simpan PDF', en: '🖨 Print or save as PDF' },
  certLocked: { id: 'Selesaikan level ini dulu untuk mendapatkan sertifikatnya.', en: 'Finish this level first to get its certificate.' },
  certBack: { id: '← Kembali ke peta', en: '← Back to the map' },
  lcCertificate: { id: '🎓 Ambil sertifikat', en: '🎓 Get your certificate' },
  blkCRule: { id: 'jika pesan berisi %1 → %2', en: 'if the message has %1 → %2' },
  blkCElse: { id: 'selain itu → %1', en: 'otherwise → %1' },
  blkCCollect: { id: 'kumpulkan %1 contoh %2', en: 'collect %1 examples of %2' },
  blkCTrain: { id: 'latih Kata', en: 'train Kata' },
  blkCTest: { id: 'uji pada pesan baru', en: 'test on new messages' },
  blkCWork: { id: 'Kata bekerja selama %1 hari', en: 'Kata works for %1 days' },
  cPenting: { id: '📌 penting', en: '📌 important' },
  cSantai: { id: '💬 santai', en: '💬 chit-chat' },
  catCRules: { id: 'Aturan', en: 'Rules' },
  catCData: { id: 'Contoh', en: 'Examples' },
  catCKata: { id: 'Kata', en: 'Kata' },
  c1File: { id: 'Chat Kelas', en: 'Class Chat' },
  s5x1Title: { id: 'Empat pesan', en: 'Four messages' },
  s5x1Mission: { id: 'Dinda ketinggalan ulangan karena chat kelas penuh candaan. Tulis aturan supaya 4 pesan ini masuk ke 📌 penting atau 💬 santai, lalu tekan ▶ JALANKAN.', en: 'Dinda missed a test because the class chat was full of jokes. Write rules that sort these 4 messages into 📌 important or 💬 chit-chat, then press ▶ RUN.' },
  s5x2Title: { id: 'Dua puluh pesan', en: 'Twenty messages' },
  s5x2Mission: { id: 'Sekarang ada 20 pesan dari chat yang sama. Tambah dan perbaiki aturanmu. Targetnya 15 dari 20 benar.', en: 'Now there are 20 messages from the same chat. Add and fix your rules. Aim for 15 out of 20 right.' },
  s5x3Title: { id: 'Belajar dari contoh', en: 'Learn from examples' },
  s5x3Mission: { id: 'Kali ini Kata tidak diberi aturan. Kumpulkan contoh pesan yang sudah diberi label, latih Kata, lalu uji pada 20 pesan yang sama. Siapa yang menang: aturanmu atau Kata?', en: 'This time Kata gets no rules. Collect labelled example messages, train Kata, then test on the same 20 messages. Who wins: your rules or Kata?' },
  s5x4Title: { id: 'Berapa contoh?', en: 'How many examples?' },
  s5x4Mission: { id: 'Kata cuma dapat 2 contoh dari tiap jenis, dan hasilnya kacau. Ubah jumlah contohnya sampai Kata benar 17 dari 20.', en: 'Kata only got 2 examples of each kind, and it shows. Change how many examples it gets until it gets 17 out of 20 right.' },
  s5x5Title: { id: 'Kata mulai bekerja', en: 'Kata goes to work' },
  s5x5Mission: { id: 'Kata menyortir chat kelas setiap hari. Di hari ke-3, kelasmu mulai pakai kata-kata baru. Buat Kata kembali benar di hari setelahnya: minimal 5 dari 6 pesan.', en: 'Kata sorts the class chat every day. On day 3 your class starts using new words. Get Kata right again on the day after: at least 5 of 6 messages.' },
  s5xSandboxTitle: { id: 'Bisakah aturan menyamai Kata?', en: 'Can rules match Kata?' },
  s5xSandboxMission: { id: 'Tantangan bebas: tulis aturan yang benar 18 dari 20 pesan, tanpa contoh dan tanpa training. Urutan aturan penting: yang paling atas dicek duluan.', en: 'Free challenge: write rules that get 18 of the 20 messages right, with no examples and no training. Rule order matters: the top one is checked first.' },
  cFailNoTest: { id: 'Belum ada blok "uji pada pesan baru", jadi belum ada pesan yang disortir.', en: "There's no \"test on new messages\" block yet, so nothing got sorted." },
  cFailP1: { id: 'Aturanmu benar {n} dari 4. Pesan yang tidak cocok dengan aturan mana pun belum punya tempat.', en: 'Your rules got {n} of 4. Messages no rule matches still have nowhere to go.' },
  cFailP2: { id: 'Aturanmu benar {n} dari 20. Lihat pesan mana yang salah, lalu tambah atau perbaiki aturan.', en: 'Your rules got {n} of 20. Look at which messages went wrong, then add or fix a rule.' },
  cFailP3: { id: 'Kata belum dilatih dari contoh. Kumpulkan contoh, lalu "latih Kata" sebelum menguji.', en: "Kata hasn't learned from examples yet. Collect examples, then \"train Kata\" before testing." },
  cFailP3Low: { id: 'Kata benar {n} dari 20. Coba beri Kata lebih banyak contoh.', en: 'Kata got {n} of 20. Try giving Kata more examples.' },
  cFailP4: { id: 'Kata benar {n} dari 20. Belum 17. Dari {e} contoh, Kata belum kenal banyak kata.', en: "Kata got {n} of 20. Not 17 yet. From {e} examples, Kata doesn't know many words." },
  cFailP5NoWork: { id: 'Kata belum bekerja. Pakai blok "Kata bekerja selama … hari" sampai hari ke-3.', en: "Kata hasn't worked yet. Use \"Kata works for … days\" until day 3." },
  cFailP5Short: { id: 'Kata baru bekerja sampai hari ke-{d}. Kata-kata baru muncul di hari ke-3.', en: 'Kata only worked until day {d}. The new words show up on day 3.' },
  cFailP5NoRetrain: { id: 'Hari ke-{d}: Kata benar {n} dari 6. Kata tidak belajar sendiri saat bekerja. Ia harus dilatih lagi dengan contoh yang baru.', en: "Day {d}: Kata got {n} of 6. Kata doesn't learn by itself while it works. It has to be trained again on new examples." },
  cFailP5After: { id: 'Setelah dilatih lagi, Kata harus bekerja minimal satu hari lagi supaya hasilnya kelihatan.', en: 'After retraining, Kata has to work at least one more day so you can see the result.' },
  cFailP5Low: { id: 'Hari ke-{d}: Kata benar {n} dari 6. Contoh barunya sudah berisi kata-kata baru itu?', en: 'Day {d}: Kata got {n} of 6. Did the new examples include the new words?' },
  cFailSandbox: { id: 'Aturanmu benar {n} dari 20. Butuh 18.', en: 'Your rules got {n} of 20. You need 18.' },
  cWin: { id: 'Kata menyortir chat kelas dari contoh, dan kamu melatihnya lagi saat kata-kata baru muncul. Itulah machine learning.', en: "Kata sorts the class chat from examples, and you retrained it when new words appeared. That's machine learning." },
  cLogCollect: { id: 'Mengumpulkan {n} contoh {label}.', en: 'Collecting {n} examples of {label}.' },
  cLogCollectShort: { id: 'Cuma ada {n} contoh {label} di riwayat chat.', en: 'There are only {n} examples of {label} in the chat history.' },
  cLogTrain: { id: 'Kata menghitung kata dari {n} contoh.', en: 'Kata counts the words in {n} examples.' },
  cLogNoModel: { id: 'Kata belum punya cara menyortir: tulis aturan, atau kumpulkan contoh lalu latih Kata.', en: 'Kata has no way to sort yet: write rules, or collect examples and train Kata.' },
  cLogTestRules: { id: 'Aturan: benar {n} dari {total}.', en: 'Rules: {n} of {total} right.' },
  cLogTestKata: { id: 'Kata: benar {n} dari {total}.', en: 'Kata: {n} of {total} right.' },
  cLogDay: { id: 'Hari ke-{d}: benar {n} dari {total}.', en: 'Day {d}: {n} of {total} right.' },
  cLogSlang: { id: 'Ada kata yang belum pernah Kata lihat: {words}.', en: 'Some words Kata has never seen: {words}.' },
  cLogUnchanged: { id: 'Bobot kata Kata sama persis seperti sebelum bekerja.', en: "Kata's word weights are exactly the same as before it worked." },
  cLogRulesWin: { id: 'Aturanmu menang kali ini. Tapi aturan itu dibuat untuk 20 pesan yang sudah kamu lihat.', en: 'Your rules win this time. But they were written for 20 messages you had already seen.' },
  pC2Q: { id: 'Aturanmu dari tahap 1 akan benar berapa dari 20 pesan?', en: 'How many of the 20 messages will your stage 1 rules get right?' },
  pC2All: { id: 'Semua 20', en: 'All 20' },
  pC2Most: { id: 'Sekitar 15', en: 'About 15' },
  pC2Half: { id: 'Sekitar 10', en: 'About 10' },
  pC2Few: { id: 'Kurang dari itu', en: 'Fewer' },
  pC3Q: { id: 'Kata tidak diberi satu aturan pun. Dibanding aturan, hasilnya?', en: 'Kata gets no rules at all. Compared with rules, how will it do?' },
  pC3Better: { id: 'Lebih baik', en: 'Better' },
  pC3Same: { id: 'Sama saja', en: 'About the same' },
  pC3Worse: { id: 'Lebih buruk', en: 'Worse' },
  pC5Q: { id: 'Setelah 3 hari bekerja, apakah Kata jadi lebih pintar?', en: 'After working for 3 days, will Kata be smarter?' },
  pC5Yes: { id: 'Ya, ia belajar sambil bekerja', en: 'Yes, it learns on the job' },
  pC5No: { id: 'Tidak, ia tetap sama', en: 'No, it stays the same' },
  pC5Depends: { id: 'Tergantung pesannya', en: 'Depends on the messages' },
  nC1: { id: 'Ada pesan yang tidak cocok dengan aturan mana pun. Ke mana pesan seperti itu harus pergi?', en: "Some messages don't match any rule. Where should those go?" },
  xC1: { id: 'Contoh: "jika pesan berisi ulangan → 📌 penting", lalu "selain itu → 💬 santai".', en: 'For example: "if the message has test → 📌 important", then "otherwise → 💬 chit-chat".' },
  nC2: { id: 'Lihat pesan yang salah. Kata apa yang ada di pesan penting tapi tidak ada di pesan santai?', en: 'Look at the messages that went wrong. Which word shows up in important messages but not in chit-chat?' },
  xC2: {
    id: 'Contoh: taruh "jika pesan berisi wkwk → 💬 santai" dan "jika pesan berisi yuk → 💬 santai" paling atas, lalu aturan penting untuk ulangan, pr, besok, tugas, dan jadwal, lalu "selain itu → 💬 santai".',
    en: 'For example: put "if the message has lol → 💬 chit-chat" at the top, then important rules for test, hw, tomorrow, due and bring, then "otherwise → 💬 chit-chat".',
  },
  nC3: { id: 'Kata belajar dari contoh yang sudah diberi label. Apakah Kata sudah dapat contoh dari kedua jenis pesan?', en: 'Kata learns from labelled examples. Has it got examples of both kinds of message?' },
  xC3: { id: 'Contoh: "kumpulkan 10 contoh 📌 penting", "kumpulkan 10 contoh 💬 santai", "latih Kata", lalu "uji pada pesan baru".', en: 'For example: "collect 10 examples of 📌 important", "collect 10 examples of 💬 chit-chat", "train Kata", then "test on new messages".' },
  nC4: { id: 'Dari 2 contoh, Kata cuma kenal sedikit kata. Apa yang terjadi kalau contohnya lebih banyak?', en: 'From 2 examples Kata knows very few words. What happens with more examples?' },
  xC4: { id: 'Contoh: "kumpulkan 12 contoh 📌 penting" dan "kumpulkan 12 contoh 💬 santai".', en: 'For example: "collect 12 examples of 📌 important" and "collect 12 examples of 💬 chit-chat".' },
  nC5: { id: 'Kata tidak berubah saat bekerja. Dari mana Kata bisa tahu arti kata-kata baru itu?', en: "Kata doesn't change while it works. Where could it learn what the new words mean?" },
  xC5: { id: 'Contoh: setelah "Kata bekerja selama 3 hari", tambah "kumpulkan 3 contoh 📌 penting", "kumpulkan 3 contoh 💬 santai", "latih Kata", lalu "Kata bekerja selama 1 hari".', en: 'For example: after "Kata works for 3 days", add "collect 3 examples of 📌 important", "collect 3 examples of 💬 chit-chat", "train Kata", then "Kata works for 1 days".' },
  nCSandbox: { id: 'Aturan paling atas dicek duluan. Kata apa yang hampir selalu berarti santai?', en: 'The top rule is checked first. Which word almost always means chit-chat?' },
  xCSandbox: { id: 'Contoh: mulai dengan aturan santai seperti wkwk, yuk, dan mabar, lalu aturan penting, lalu "selain itu → 📌 penting".', en: 'For example: start with chit-chat rules like lol, gaming and movie, then the important ones, then "otherwise → 📌 important".' },
  hint_c_start: { id: 'Semua blok harus menempel di bawah "saat ▶ ditekan".', en: 'Every block has to sit under "when ▶ clicked".' },
  hint_c_addTest: { id: 'Tambahkan blok ini supaya Kata benar-benar menyortir pesan.', en: 'Add this block so Kata actually sorts some messages.' },
  hint_c_addElse: { id: 'Pesan yang tidak cocok dengan aturan mana pun butuh tempat. Tambahkan blok ini.', en: 'Messages that match no rule need somewhere to go. Add this block.' },
  hint_c_moreRules: { id: 'Tambah satu aturan lagi untuk pesan yang masih salah.', en: 'Add one more rule for a message that still goes wrong.' },
  hint_c_collect: { id: 'Kata butuh contoh dulu. Mulai dari sini.', en: 'Kata needs examples first. Start here.' },
  hint_c_bothLabels: { id: 'Kata juga butuh contoh dari jenis pesan yang satunya.', en: 'Kata needs examples of the other kind of message too.' },
  hint_c_train: { id: 'Contohnya sudah ada. Sekarang Kata harus belajar dari contoh itu.', en: 'The examples are there. Now Kata has to learn from them.' },
  hint_c_collectFirst: { id: 'Contoh harus dikumpulkan sebelum Kata dilatih. Pindahkan blok kumpulkan ke atas.', en: 'Collect the examples before training Kata. Move the collect blocks up.' },
  hint_c_moreExamples: { id: 'Naikkan angka ini. Lebih banyak contoh, lebih banyak kata yang Kata kenal.', en: 'Raise this number. More examples, more words Kata knows.' },
  hint_c_work: { id: 'Biarkan Kata bekerja sampai hari ke-3 dengan blok ini.', en: 'Let Kata work until day 3 with this block.' },
  hint_c_moreDays: { id: 'Kata baru bekerja sebentar. Naikkan jumlah harinya ke 3.', en: 'Kata only worked a little. Raise the days to 3.' },
  hint_c_retrain: { id: 'Setelah Kata bekerja, kumpulkan contoh baru dari chat terbaru, lalu latih Kata lagi.', en: 'After Kata works, collect new examples from the latest chat, then train Kata again.' },
  hint_c_workAgain: { id: 'Setelah dilatih lagi, biarkan Kata bekerja satu hari lagi.', en: 'After retraining, let Kata work one more day.' },
  aCRulesTitle: { id: 'Penulis Aturan', en: 'Rule Writer' },
  aCRulesDesc: { id: 'Menulis 6 aturan atau lebih.', en: 'Wrote 6 rules or more.' },
  aCLostTitle: { id: 'Aturan Kalah', en: 'Rules Lost' },
  aCLostDesc: { id: 'Kata yang belajar dari contoh mengalahkan aturan tulisanmu.', en: 'Kata, learning from examples, beat your hand-written rules.' },
  aCMagicTitle: { id: 'Bukan Sihir', en: 'Not Magic' },
  aCMagicDesc: { id: 'Kamu melihat bahwa Kata tidak belajar sendiri saat bekerja.', en: "You saw that Kata doesn't learn by itself while it works." },
  aCChampTitle: { id: 'Juara Aturan', en: 'Rule Champion' },
  aCChampDesc: { id: 'Aturanmu benar 18 dari 20 pesan.', en: 'Your rules got 18 of 20 messages right.' },
  cSceneChat: { id: 'CHAT KELAS 8A', en: 'CLASS 8A CHAT' },
  cSceneBrain: { id: 'OTAK KATA', en: "KATA'S BRAIN" },
  cSceneRules: { id: 'ATURAN', en: 'RULES' },
  cSceneDay: { id: 'HARI {d}', en: 'DAY {d}' },
  cSceneExamples: { id: 'CONTOH', en: 'EXAMPLES' },
  cSceneUnknown: { id: '?', en: '?' },
  cSceneNoRule: { id: 'tidak ada aturan cocok', en: 'no rule matched' },
  demoCExamples: { id: 'Programmu sekarang berisi aturan-aturan umum, ditambah Kata yang belajar dari 20 contoh. Tebak dulu, lalu jalankan dan bandingkan skor keduanya.', en: 'Your program now has some common rules, plus Kata learning from 20 examples. Guess first, then run it and compare the two scores.' },
  demoCFew: { id: 'Kata cuma dapat 2 contoh dari tiap jenis. Lihat apa yang terjadi.', en: 'Kata only gets 2 examples of each kind. Watch what happens.' },
  demoCWork: { id: 'Kata dilatih, lalu bekerja 3 hari. Perhatikan hari ke-3.', en: 'Kata is trained, then works for 3 days. Watch day 3.' },
  sessionsNav: { id: 'Sesi', en: 'Sessions' },
  lcTitleSession: { id: 'Sesi {n} selesai!', en: 'Session {n} complete!' },
  sessionN: { id: 'Sesi {n}', en: 'Session {n}' },
  blkFCollect: { id: 'kumpulkan %1 contoh %2 dari %3', en: 'collect %1 examples of %2 from %3' },
  blkFTest: { id: 'uji pada %1', en: 'test on %1' },
  blkFInspect: { id: 'periksa data', en: 'inspect the data' },
  blkFCheck: { id: 'minta teman cek label', en: 'ask a friend to check the labels' },
  blkFHoldout: { id: 'sisihkan %1 contoh untuk ujian', en: 'set aside %1 examples for testing' },
  blkFSender: { id: 'nilai per pengirim', en: 'score by sender' },
  src8a: { id: 'chat 8A', en: 'the 8A chat' },
  src8c: { id: 'chat 8C', en: 'the 8C chat' },
  srcDonated: { id: 'kakak kelas', en: 'an older class' },
  srcBimo: { id: 'chat Bimo', en: "Bimo's messages" },
  set8c: { id: 'chat 8C minggu depan', en: "next week's 8C chat" },
  set8a: { id: 'chat 8A', en: 'the 8A chat' },
  setTrain: { id: 'data latih', en: 'the training data' },
  setHoldout: { id: 'contoh yang disisihkan', en: 'the set-aside examples' },
  catFData: { id: 'Data', en: 'Data' },
  catFCheck: { id: 'Periksa', en: 'Check' },
  c3File: { id: 'Data yang Adil', en: 'Fair Data' },
  s3x1Title: { id: 'Kata pindah ke 8C', en: 'Kata moves to 8C' },
  s3x1Mission: { id: 'Sepupu Sari sekelas di 8C, di Surabaya, dan kelasnya mau pakai Kata juga. Kata dilatih dengan chat 8A. Jalankan, lalu tambahkan "periksa data" untuk melihat kenapa hasilnya begitu.', en: "Sari's cousin is in class 8C in another city, and that class wants Kata too. Kata was trained on the 8A chat. Run it, then add \"inspect the data\" to see why it scores the way it does." },
  s3x2Title: { id: 'Lebih banyak atau berbeda?', en: 'More, or different?' },
  s3x2Mission: { id: 'Kata butuh contoh yang lebih baik untuk 8C. Ubah datanya sampai Kata benar 17 dari 20 di chat 8C minggu depan.', en: "Kata needs better examples for 8C. Change its data until it gets 17 of 20 right on next week's 8C chat." },
  s3x3Title: { id: 'Ada label yang salah', en: 'Some labels are wrong' },
  s3x3Mission: { id: 'Kakak kelas memberi 32 contoh berlabel gratis. Tapi beberapa labelnya diisi asal-asalan. Buat Kata kembali benar 17 dari 20 di chat 8A.', en: 'An older class gave away 32 labelled examples for free. But some labels were filled in as a joke. Get Kata back to 17 of 20 on the 8A chat.' },
  s3x4Title: { id: 'Ujian yang curang', en: 'The cheating test' },
  s3x4Mission: { id: 'Kata dapat 100%, tapi diuji dengan contoh yang sama yang dipakai untuk belajar. Sisihkan beberapa contoh sebelum training, lalu uji Kata pada contoh yang disisihkan itu.', en: 'Kata scored 100%, but it was tested on the same examples it learned from. Set some examples aside before training, then test Kata on those set-aside examples.' },
  s3x5Title: { id: 'Siapa yang dirugikan?', en: 'Who gets left out?' },
  s3x5Mission: { id: 'Pakai "nilai per pengirim" untuk melihat skor Kata untuk setiap orang. Buat Kata benar minimal 5 dari 6 pesan untuk Dinda, Raka, Ayu, dan Bimo.', en: 'Use "score by sender" to see how Kata does for each person. Get Kata to at least 5 of 6 messages right for Dinda, Raka, Ayu and Bimo.' },
  s3xSandboxTitle: { id: 'Kata untuk semua, hemat data', en: 'Kata for everyone, on a budget' },
  s3xSandboxMission: { id: 'Tantangan bebas: buat Kata adil untuk keempat orang dengan paling banyak 40 contoh. Contoh dari mana yang paling berguna?', en: 'Free challenge: make Kata fair to all four people with at most 40 examples. Which examples help the most?' },
  fFailNoTest: { id: 'Belum ada blok "uji pada …", jadi belum ada hasilnya.', en: "There's no \"test on …\" block yet, so there's no result." },
  fFailNoTrain: { id: 'Kata belum dilatih. Kumpulkan contoh, lalu "latih Kata".', en: "Kata hasn't been trained. Collect examples, then \"train Kata\"." },
  fFailP1: { id: 'Kata benar {n} dari 20 di 8C. Sekarang tambahkan "periksa data" di bawah ujiannya untuk melihat kenapa.', en: 'Kata got {n} of 20 in 8C. Now add "inspect the data" under the test to see why.' },
  fFailP1Where: { id: 'Uji Kata pada chat 8C dulu, lalu periksa datanya.', en: 'Test Kata on the 8C chat first, then inspect the data.' },
  fFailP2: { id: 'Kata benar {n} dari 20 di 8C. Belum 17.', en: 'Kata got {n} of 20 in 8C. Not 17 yet.' },
  fFailP2Where: { id: 'Puzzle ini dinilai dari "uji pada chat 8C minggu depan".', en: "This puzzle is scored with \"test on next week's 8C chat\"." },
  fFailP3: { id: 'Kata benar {n} dari 20 di 8A. Kata belajar dari {wrong} contoh yang labelnya salah.', en: 'Kata got {n} of 20 on 8A. It learned from {wrong} examples with wrong labels.' },
  fFailP3Where: { id: 'Puzzle ini dinilai dari "uji pada chat 8A".', en: 'This puzzle is scored with "test on the 8A chat".' },
  fFailP4: { id: 'Ujian terakhirmu belum memakai contoh yang disisihkan.', en: "Your last test doesn't use the set-aside examples yet." },
  fFailP4Small: { id: 'Sisihkan minimal 5 contoh supaya ujiannya berarti.', en: 'Set aside at least 5 examples so the test means something.' },
  fFailP5: { id: 'Belum adil untuk semua. Masih di bawah 5 dari 6: {who}.', en: 'Not fair to everyone yet. Still under 5 of 6: {who}.' },
  fFailP5NoSender: { id: 'Tambahkan "nilai per pengirim" setelah Kata dilatih.', en: 'Add "score by sender" after Kata is trained.' },
  fFailSandbox: { id: 'Kata dilatih dengan {e} contoh. Batasnya 40.', en: 'Kata trained on {e} examples. The limit is 40.' },
  fWin: { id: 'Kata sekarang adil untuk semua orang di chat ini. Bukan karena modelnya diganti, tapi karena datanya diperbaiki.', en: 'Kata is now fair to everyone in this chat. Not because the model changed, but because the data got better.' },
  fLogCollect: { id: 'Mengumpulkan {n} contoh {label} dari {src}.', en: 'Collecting {n} examples of {label} from {src}.' },
  fLogCollectShort: { id: '{src} cuma punya {n} contoh {label}.', en: '{src} only has {n} examples of {label}.' },
  fLogCheck: { id: 'Seorang teman membaca semua {of} contoh dan memperbaiki {fixed} label.', en: 'A friend read all {of} examples and fixed {fixed} labels.' },
  fLogHoldout: { id: '{n} contoh disisihkan. Kata tidak akan belajar dari contoh itu.', en: "{n} examples set aside. Kata won't learn from them." },
  fLogTest: { id: 'Uji pada {set}: benar {n} dari {total}.', en: 'Test on {set}: {n} of {total} right.' },
  fLogNextWeek: { id: 'Untuk perbandingan, di chat 8C minggu depan Kata benar {n} dari {total}.', en: "For comparison, on next week's 8C chat Kata gets {n} of {total}." },
  fLogEmptyHoldout: { id: 'Belum ada contoh yang disisihkan.', en: 'No examples have been set aside yet.' },
  fLogInspect: { id: 'Kata kenal {pct}% kata di {set}. Kata yang belum pernah ia lihat: {words}.', en: 'Kata knows {pct}% of the words in {set}. Words it has never seen: {words}.' },
  fLogInspectSources: { id: 'Contoh Kata: {list}.', en: "Kata's examples: {list}." },
  fLogSuspicious: { id: 'Label yang mencurigakan: "{text}".', en: 'A suspicious label: "{text}".' },
  fLogSender: { id: '{name}: benar {n} dari {total}.', en: '{name}: {n} of {total} right.' },
  fLogOverall: { id: 'Untuk semua orang: {pct}%.', en: 'Everyone together: {pct}%.' },
  pF1Q: { id: 'Di chat 8A Kata benar 19 dari 20. Di chat 8C, berapa?', en: 'Kata gets 19 of 20 on the 8A chat. How about the 8C chat?' },
  pF1High: { id: '18 atau lebih', en: '18 or more' },
  pF1Mid: { id: '12 sampai 17', en: '12 to 17' },
  pF1Low: { id: '11 atau kurang', en: '11 or fewer' },
  pF4Q: { id: 'Kata dapat 100% di data latihnya sendiri. Di chat 8C minggu depan, hasilnya?', en: "Kata gets 100% on its own training data. On next week's 8C chat, how will it do?" },
  pF4Same: { id: 'Tetap 100%', en: 'Still 100%' },
  pF4Lower: { id: 'Lebih rendah', en: 'Lower' },
  pF5Q: { id: 'Skor Kata untuk semua orang tinggi. Apakah itu berarti Kata bagus untuk setiap orang?', en: "Kata's score for everyone together is high. Does that mean it works well for each person?" },
  pF5Yes: { id: 'Ya', en: 'Yes' },
  pF5NotSure: { id: 'Belum tentu', en: 'Not necessarily' },
  nF1: { id: 'Kata cuma kenal kata-kata dari chat 8A. Apa yang berbeda dari cara 8C menulis?', en: 'Kata only knows words from the 8A chat. What is different about how 8C writes?' },
  xF1: { id: 'Contoh: setelah "uji pada chat 8C minggu depan", tambahkan "periksa data".', en: "For example: after \"test on next week's 8C chat\", add \"inspect the data\"." },
  nF2: { id: 'Menambah contoh dari 8A cuma mengajari Kata kata-kata yang sudah ia tahu. Contoh dari mana yang berisi kata-kata 8C?', en: "More 8A examples only teach Kata words it already knows. Which examples have 8C's words in them?" },
  xF2: { id: 'Contoh: tambahkan "kumpulkan 8 contoh penting dari chat 8C" dan "kumpulkan 8 contoh santai dari chat 8C" sebelum "latih Kata".', en: 'For example: add "collect 8 examples of important from the 8C chat" and "collect 8 examples of chit-chat from the 8C chat" before "train Kata".' },
  nF3: { id: 'Data gratis tidak selalu bagus. Bagaimana kamu tahu labelnya benar?', en: "Free data isn't always good data. How would you know the labels are right?" },
  xF3: { id: 'Contoh: taruh "minta teman cek label" setelah blok-blok kumpulkan, sebelum "latih Kata".', en: 'For example: put "ask a friend to check the labels" after the collect blocks, before "train Kata".' },
  nF4: { id: 'Ujian yang jujur memakai pesan yang belum pernah Kata lihat. Contoh mana yang belum Kata lihat?', en: "An honest test uses messages Kata has never seen. Which examples hasn't it seen?" },
  xF4: { id: 'Contoh: "sisihkan 10 contoh untuk ujian" sebelum "latih Kata", lalu "uji pada contoh yang disisihkan".', en: 'For example: "set aside 10 examples for testing" before "train Kata", then "test on the set-aside examples".' },
  nF5: { id: 'Siapa yang paling sering salah? Apakah Kata pernah melihat pesan seperti punya dia?', en: 'Who does Kata get wrong most? Has Kata ever seen messages like theirs?' },
  xF5: { id: 'Contoh: untuk tiap label, kumpulkan 10 contoh dari chat 8A, 10 dari chat 8C, dan 5 dari chat Bimo. Lalu "latih Kata" dan "nilai per pengirim".', en: "For example: for each label, collect 10 examples from the 8A chat, 10 from the 8C chat and 5 from Bimo's messages. Then \"train Kata\" and \"score by sender\"." },
  nFSandbox: { id: 'Setiap orang butuh beberapa contoh yang mirip pesannya. Siapa yang paling butuh?', en: 'Everyone needs a few examples that look like their messages. Who needs them most?' },
  xFSandbox: { id: 'Contoh: untuk tiap label, 5 dari 8A, 10 dari 8C, dan 5 dari Bimo. Totalnya 40.', en: 'For example: for each label, 5 from 8A, 10 from 8C and 5 from Bimo. That is 40 in all.' },
  hint_f_start: { id: 'Semua blok harus menempel di bawah "saat ▶ ditekan".', en: 'Every block has to sit under "when ▶ clicked".' },
  hint_f_train: { id: 'Kata harus dilatih dulu dengan contoh.', en: 'Kata has to be trained on examples first.' },
  hint_f_test8c: { id: 'Uji Kata pada chat 8C minggu depan.', en: "Test Kata on next week's 8C chat." },
  hint_f_inspect: { id: 'Tambahkan blok ini di bawah ujiannya.', en: 'Add this block under the test.' },
  hint_f_collect8c: { id: 'Pilih chat 8C di sini, lalu kumpulkan contoh dari sana.', en: 'Choose the 8C chat here, and collect examples from it.' },
  hint_f_test8a: { id: 'Puzzle ini dinilai dari ujian di chat 8A.', en: 'This puzzle is scored with a test on the 8A chat.' },
  hint_f_check: { id: 'Minta teman memeriksa labelnya sebelum Kata dilatih.', en: 'Have a friend check the labels before Kata is trained.' },
  hint_f_holdout: { id: 'Sisihkan beberapa contoh sebelum training.', en: 'Set some examples aside before training.' },
  hint_f_testHoldout: { id: 'Sekarang uji Kata pada contoh yang disisihkan.', en: 'Now test Kata on the set-aside examples.' },
  hint_f_sender: { id: 'Tambahkan ini untuk melihat skor setiap orang.', en: "Add this to see each person's score." },
  hint_f_collectBimo: { id: 'Kata butuh contoh pesan seperti punya Bimo.', en: "Kata needs examples that look like Bimo's messages." },
  hint_f_fewer: { id: 'Kurangi angka ini. Batasnya 40 contoh.', en: 'Lower this number. The limit is 40 examples.' },
  demoFMore: { id: 'Kata dapat 40 contoh dari 8A. Lihat hasilnya di 8C.', en: 'Kata gets 40 examples from 8A. Watch what happens in 8C.' },
  demoFDonated: { id: 'Kata dilatih dengan data dari kakak kelas, lalu diuji di 8A.', en: "Kata learns from the older class's data, then gets tested on 8A." },
  demoFCheat: { id: 'Kata diuji dengan contoh yang sama yang dipakai untuk belajar.', en: 'Kata is tested on the same examples it learned from.' },
  aFDiverseTitle: { id: 'Beragam > Banyak', en: 'Different beats more' },
  aFDiverseDesc: { id: 'Kata jadi bagus di 8C dengan lebih sedikit contoh daripada 40 contoh dari 8A.', en: 'Kata got good at 8C with fewer examples than 40 from 8A.' },
  aFLabelTitle: { id: 'Detektif Label', en: 'Label Detective' },
  aFLabelDesc: { id: 'Kamu memeriksa label sebelum Kata belajar.', en: 'You checked the labels before Kata learned.' },
  aFHonestTitle: { id: 'Ujian Jujur', en: 'Honest Test' },
  aFHonestDesc: { id: 'Kamu menguji Kata dengan contoh yang belum pernah ia lihat.', en: 'You tested Kata on examples it had never seen.' },
  aFFairTitle: { id: 'Pemburu Bias', en: 'Bias Hunter' },
  aFFairDesc: { id: 'Kamu menemukan orang yang dirugikan Kata, lalu memperbaikinya.', en: 'You found who Kata was failing, and fixed it.' },
  aFBudgetTitle: { id: 'Adil dan Hemat', en: 'Fair on a Budget' },
  aFBudgetDesc: { id: 'Kata adil untuk semua dengan paling banyak 40 contoh.', en: 'Kata was fair to everyone with 40 examples or fewer.' },
  fSceneInspect: { id: 'PERIKSA DATA', en: 'DATA CHECK' },
  fSceneSenders: { id: 'SKOR PER PENGIRIM', en: 'SCORE BY SENDER' },
  fSceneKnown: { id: 'kata yang Kata kenal', en: 'words Kata knows' },
  fSceneSetAside: { id: 'DISISIHKAN', en: 'SET ASIDE' },
  fSceneFixed: { id: 'LABEL DIPERBAIKI', en: 'LABELS FIXED' },
  senderDinda: { id: 'Dinda (8A)', en: 'Dinda (8A)' },
  senderRaka: { id: 'Raka (8A)', en: 'Raka (8A)' },
  senderAyu: { id: 'Ayu (8C)', en: 'Ayu (8C)' },
  senderBimo: { id: 'Bimo (8A)', en: 'Bimo (8A)' },
  predictTitle: { id: 'TEBAK DULU', en: 'GUESS FIRST' },
  predictNeed: { id: 'Pilih tebakanmu, lalu tekan ▶ JALANKAN.', en: 'Pick your guess, then press ▶ RUN.' },
  predictYours: { id: 'Tebakanmu', en: 'Your guess' },
  predictResult: { id: 'Hasilnya', en: 'What happened' },
  predictRight: { id: 'Tebakanmu tepat!', en: 'Your guess was right!' },
  predictWrong: { id: 'Beda dari tebakanmu. Kenapa, ya?', en: 'Not what you guessed. Why might that be?' },
  predictNoAnswer: { id: 'Run ini belum menjawab tebakanmu.', en: "This run didn't answer your guess." },
  pTrainQ: { id: 'Berapa banyak buah baru yang akan ditebak benar oleh robot?', en: 'How many new fruits will the robot get right?' },
  pTrainHigh: { id: 'Hampir semua (90% ke atas)', en: 'Almost all (90% or more)' },
  pTrainMid: { id: 'Sebagian (50 sampai 89%)', en: 'Some (50 to 89%)' },
  pTrainLow: { id: 'Kurang dari setengah', en: 'Less than half' },
  pTreeQ: { id: 'Berapa makhluk yang akan masuk kandang yang benar?', en: 'How many critters will end up in the right pen?' },
  pTreeAll: { id: 'Semua', en: 'All of them' },
  pTreeMost: { id: 'Sebagian besar', en: 'Most of them' },
  pTreeFew: { id: 'Kurang dari dua pertiga', en: 'Fewer than two thirds' },
  pHillQ: { id: 'Dengan 6 langkah energi, robotmu akan sampai di lembah?', en: 'With 6 steps of energy, will your robot reach the valley?' },
  pHillYes: { id: 'Ya, sampai', en: 'Yes, it gets there' },
  pHillShort: { id: 'Tidak, energinya habis duluan', en: 'No, it runs out of energy first' },
  pHillOff: { id: 'Tidak, malah terpental', en: 'No, it bounces off' },
  pTavernQ: { id: 'Apakah cerita sang penyair akan selesai dengan titik?', en: "Will the bard's story end with a full stop?" },
  pTavernDone: { id: 'Ya, selesai', en: 'Yes, it finishes' },
  pTavernLoop: { id: 'Tidak, ceritanya berputar-putar', en: 'No, it goes round in circles' },
  pTavernOut: { id: 'Tidak, kehabisan token', en: 'No, it runs out of tokens' },
  notebookNew: { id: 'MASUK BUKU KATA', en: 'ADDED TO THE NOTEBOOK' },
  notebookOpenShort: { id: 'Buka Buku Kata', en: 'Open the notebook' },
  notebookTitle: { id: 'Buku Kata', en: "Kata's notebook" },
  notebookIntro: {
    id: 'Semua istilah yang sudah kamu temui saat bermain, lengkap dengan momen saat kamu menemukannya.',
    en: 'Every term you have met while playing, with the moment you found it.',
  },
  yourMoment: { id: 'Momenmu', en: 'Your moment' },
  backToGame: { id: '← Kembali main', en: '← Back to the game' },
  notebookCount: { id: '{found} dari {total} istilah', en: '{found} of {total} terms' },
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

/** A card's "moment" line, filled with numbers from the run where it was found. */
export function fillMoment(card: TermCard, lang: Lang, vars: Record<string, string | number>) {
  return card.moment[lang].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
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
  | 'ai'
  | 'trainingData'
  | 'model'
  | 'machineLearning'
  | 'bias'
  | 'dataQuality'
  | 'testData'
  | 'overfitting'
  | 'fairness'

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

/** Session 1: Rules or examples? */
export const SESSION1_CARDS: TermCard[] = [
  {
    id: 'ai',
    term: 'AI',
    icon: '🤖',
    body: {
      id: 'Program yang belajar dari contoh, bukan dari aturan yang ditulis orang satu per satu. Singkatan dari artificial intelligence (kecerdasan artifisial).',
      en: 'A program that learns from examples instead of rules a person writes one by one. Short for artificial intelligence.',
    },
    moment: {
      id: 'Kamu tidak menulis satu aturan pun untuk Kata, tapi Kata benar {kata} dari {n} pesan. Ia belajar dari contoh.',
      en: "You didn't write a single rule for Kata, yet it got {kata} of {n} messages right. It learned from examples.",
    },
  },
  {
    id: 'trainingData',
    term: 'Training Data',
    icon: '🗂️',
    body: {
      id: 'Contoh berlabel yang dipakai AI untuk belajar. Kalau contohnya sedikit atau berat sebelah, hasilnya ikut buruk.',
      en: 'The labelled examples an AI learns from. Too few, or too one-sided, and the AI gets worse too.',
    },
    moment: {
      id: 'Kata belajar dari {n} contoh ini. Dari sinilah ia tahu kata mana yang biasanya penting dan mana yang santai.',
      en: 'Kata learned from these {n} examples. That is how it knows which words usually mean important and which mean chit-chat.',
    },
  },
  {
    id: 'model',
    term: 'Model',
    icon: '🧠',
    body: {
      id: 'Hasil training: apa yang sudah dipelajari AI, misalnya bobot tiap kata. Model tidak berubah saat dipakai. Ia hanya berubah saat dilatih lagi.',
      en: "What training produces: what the AI has learned, such as each word's weight. A model doesn't change while it's used. It only changes when it's trained again.",
    },
    moment: {
      id: 'Kata bekerja {days} hari, tapi bobot katanya sama persis seperti sebelum bekerja.',
      en: 'Kata worked for {days} days, and its word weights are exactly what they were before.',
    },
  },
  {
    id: 'machineLearning',
    term: 'Machine Learning',
    icon: '🔁',
    body: {
      id: 'Cara membuat AI: beri contoh, latih, uji dengan data baru, lalu latih lagi saat dunianya berubah.',
      en: 'How AI is made: give examples, train, test on new data, then train again when the world changes.',
    },
    moment: {
      id: 'Kata menyortir chat kelas dari contoh, dan kamu melatihnya lagi saat kata-kata baru muncul.',
      en: 'Kata sorts the class chat from examples, and you trained it again when new words showed up.',
    },
  },
]

/** Session 3: Fair data */
export const SESSION3_CARDS: TermCard[] = [
  {
    id: 'bias',
    term: 'Bias',
    icon: '⚖️',
    body: {
      id: 'Saat AI bekerja lebih buruk untuk sebagian orang karena data latihnya tidak mewakili mereka.',
      en: "When an AI works worse for some people because its training data doesn't represent them.",
    },
    moment: {
      id: 'Kata cuma kenal {pct}% kata di chat 8C. Ia dilatih dengan chat 8A, jadi ia berat sebelah ke cara 8A menulis.',
      en: 'Kata knows only {pct}% of the words in the 8C chat. It was trained on 8A, so it leans towards how 8A writes.',
    },
  },
  {
    id: 'dataQuality',
    term: 'Data Quality',
    icon: '🏷️',
    body: {
      id: 'Seberapa benar dan rapi data latihnya. Label yang salah mengajari AI hal yang salah.',
      en: 'How correct and clean the training data is. Wrong labels teach an AI the wrong thing.',
    },
    moment: {
      id: 'Temanmu memperbaiki {fixed} label yang salah. Tanpa itu, Kata belajar bahwa "ulangan" itu santai.',
      en: 'Your friend fixed {fixed} wrong labels. Without that, Kata learns that "test" means chit-chat.',
    },
  },
  {
    id: 'testData',
    term: 'Test Data',
    icon: '🧪',
    body: {
      id: 'Data yang disisihkan dan tidak dipakai untuk belajar, supaya ujiannya jujur.',
      en: 'Data kept back from training, so the test is honest.',
    },
    moment: {
      id: 'Kamu menyisihkan {n} contoh. Kata belum pernah melihatnya, jadi skornya lebih mirip skor di dunia nyata.',
      en: 'You set aside {n} examples. Kata has never seen them, so its score is closer to its real-world score.',
    },
  },
  {
    id: 'overfitting',
    term: 'Overfitting',
    icon: '🪞',
    body: {
      id: 'Saat model bagus sekali di data latihnya tapi kurang bagus di data baru. Ujian dengan data latih menyembunyikan masalah ini.',
      en: 'When a model does very well on its training data but worse on new data. Testing on the training data hides this.',
    },
    moment: {
      id: 'Di data latihnya Kata benar {train}%, tapi di chat 8C minggu depan cuma {next}%.',
      en: "Kata got {train}% on its training data, but only {next}% on next week's 8C chat.",
    },
  },
  {
    id: 'fairness',
    term: 'Fairness',
    icon: '🤝',
    body: {
      id: 'AI yang bekerja sama baiknya untuk setiap orang, bukan cuma bagus rata-ratanya.',
      en: 'An AI that works about as well for each person, not just well on average.',
    },
    moment: {
      id: 'Skor untuk semua orang {pct}%, tapi Bimo cuma {bimo} dari 6. Rata-rata bisa menyembunyikan orang yang dirugikan.',
      en: "The score for everyone together was {pct}%, but Bimo got only {bimo} of 6. An average can hide who is left out.",
    },
  },
]
