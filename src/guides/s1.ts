import { CORPUS } from '../levels/chat/messages'
import type { SessionGuide } from './types'

const label = { id: { penting: 'PENTING', santai: 'SANTAI' }, en: { penting: 'IMPORTANT', santai: 'CHIT-CHAT' } }

export const GUIDE_S1: SessionGuide = {
  session: 's1',
  title: { id: 'Aturan atau Contoh?', en: 'Rules or Examples?' },
  bigQuestion: {
    id: 'Bisa nggak kamu nulis aturan buat semua chat kelas?',
    en: 'Could you write rules for every message in the class chat?',
  },
  kelas: '7–8',
  kka: {
    elements: [
      { id: 'Pemanfaatan dan Pengembangan KA', en: 'Pemanfaatan dan Pengembangan KA (using and developing AI)' },
      { id: 'Literasi dan Etika KA', en: 'Literasi dan Etika KA (AI literacy and ethics)' },
    ],
    materi: [
      { id: 'Kelas VII: Pengenalan Perangkat KA Sederhana', en: 'Grade VII: Pengenalan Perangkat KA Sederhana (simple AI tools)' },
      { id: 'Kelas VIII: Data Latih dalam Pengembangan KA; Eksperimen Klasifikasi oleh KA', en: 'Grade VIII: Data Latih (training data); Eksperimen Klasifikasi oleh KA (classification experiments)' },
    ],
  },
  goals: [
    { id: 'Menjelaskan beda program yang mengikuti aturan buatan orang dan AI yang belajar dari contoh.', en: 'Explain the difference between a program that follows rules a person wrote and an AI that learns from examples.' },
    { id: 'Menjelaskan bahwa data latih membentuk model: contoh yang terlalu sedikit membuat AI sering salah.', en: 'Explain that training data shapes the model: too few examples make an AI wrong more often.' },
    { id: 'Menjelaskan bahwa model tidak berubah saat dipakai, dan baru berubah saat dilatih ulang.', en: "Explain that a model doesn't change while it's used, only when it's trained again." },
  ],
  forParents: {
    id: 'Anak akan mencoba menulis aturan untuk memilah chat kelas, lalu melihat aturannya patah oleh pesan sehari-hari. Setelah itu anak melatih robot Kata dengan contoh, dan Kata ternyata lebih jitu. Terakhir anak melihat bahwa Kata tidak pintar dengan sendirinya: ia harus dilatih lagi saat muncul kata-kata baru.',
    en: 'Your child tries to write rules that sort a class chat, and watches everyday messages break them. Then they train the robot Kata on examples, and Kata does better. Finally they see that Kata does not get smarter on its own: it has to be trained again when new words appear.',
  },
  terms: [
    { term: 'AI', def: { id: 'Program yang belajar dari contoh, bukan dari aturan yang ditulis satu per satu.', en: 'A program that learns from examples, not from rules written one by one.' } },
    { term: 'Training Data', def: { id: 'Contoh berlabel yang dipakai AI untuk belajar.', en: 'The labelled examples an AI learns from.' } },
    { term: 'Model', def: { id: 'Hasil training: apa yang sudah dipelajari AI. Tidak berubah saat dipakai.', en: "What training produces: what the AI has learned. It doesn't change while it's used." } },
    { term: 'Machine Learning', def: { id: 'Cara membuat AI: beri contoh, latih, uji, dan latih ulang.', en: 'How AI is made: give examples, train, test, and train again.' } },
  ],
  prep: {
    guru: [
      { id: 'Buka aastr.id/kotakata/main/s1 di setiap perangkat. Tidak perlu akun atau email siswa.', en: 'Open aastr.id/kotakata/main/s1 on every device. No accounts or student emails are needed.' },
      { id: 'Satu perangkat untuk 1–2 siswa. Kalau perangkat kurang, pakai versi unplugged di bagian akhir panduan ini.', en: 'One device per 1–2 students. If there are not enough devices, use the unplugged version at the end of this guide.' },
      { id: 'Cetak kartu pesan (lampiran) kalau memakai pemanasan unplugged.', en: 'Print the message cards (appendix) if you use the unplugged warm-up.' },
      { id: 'Tulis pertanyaan besarnya di papan tulis.', en: 'Write the big question on the board.' },
    ],
    ortu: [
      { id: 'Buka aastr.id/kotakata/main/s1 di laptop atau tablet. Tidak perlu daftar.', en: 'Open aastr.id/kotakata/main/s1 on a laptop or tablet. No sign-up needed.' },
      { id: 'Satu perangkat cukup. Duduk di samping anak.', en: 'One device is enough. Sit next to your child.' },
    ],
  },
  warmup: {
    guru: [
      { id: 'Bacakan 10 kartu pesan "latih" (lampiran) dan sebutkan labelnya: penting atau santai.', en: 'Read out 10 "training" message cards (appendix) and say their labels: important or chit-chat.' },
      { id: 'Dalam kelompok, siswa menulis aturan di sticky note, misalnya "kalau ada kata ulangan, berarti penting".', en: 'In groups, students write rules on sticky notes, such as "if it has the word test, it\'s important".' },
      { id: 'Bacakan 10 kartu "uji". Kelompok memakai aturannya dan menghitung berapa yang benar.', en: 'Read out 10 "test" cards. Groups apply their rules and count how many they get right.' },
      { id: 'Tanyakan: "Pesan mana yang mematahkan aturan kalian?" Catat jawaban sebagai asesmen awal.', en: 'Ask: "Which messages broke your rules?" Note the answers as the initial assessment.' },
    ],
    ortu: {
      id: 'Tanyakan saat makan: "Pernah lihat galeri HP mengelompokkan foto makanan sendiri? Menurutmu, siapa yang membuat aturannya?" Dengarkan dulu tebakannya.',
      en: 'Ask over a meal: "Have you seen a phone gallery group food photos by itself? Who do you think wrote the rules?" Listen to the guess first.',
    },
  },
  puzzles: [
    {
      title: { id: 'Tahap 1 · Empat pesan', en: 'Stage 1 · Four messages' },
      happens: { id: 'Program awal punya satu aturan dan benar 2 dari 4.', en: 'The starter program has one rule and gets 2 of 4.' },
      stuck: { id: 'Siswa tidak tahu harus apa dengan pesan yang tidak cocok dengan aturan mana pun.', en: "Students don't know what to do with messages that match no rule." },
      say: { id: '"Pesan yang tidak cocok dengan aturan mana pun mau dikirim ke mana?"', en: '"Where should a message go if no rule matches it?"' },
    },
    {
      title: { id: 'Tahap 2 · Dua puluh pesan', en: 'Stage 2 · Twenty messages' },
      happens: { id: 'Aturan dari tahap 1 cuma benar sekitar 12 dari 20. Menulis 6 aturan sudah cukup untuk lanjut.', en: 'The stage 1 rules get about 12 of 20. Writing 6 rules is enough to move on.' },
      stuck: { id: 'Siswa terus menambah aturan dan frustrasi. Itu wajar: pelajarannya justru di sini.', en: "Students keep adding rules and get frustrated. That's expected: that is the lesson." },
      say: { id: '"Pesan mana yang membuat aturanmu salah? Kenapa?"', en: '"Which message made your rule wrong? Why?"' },
    },
    {
      title: { id: 'Tahap 3 · Belajar dari contoh', en: 'Stage 3 · Learn from examples' },
      happens: { id: 'Program berisi aturan umum dan Kata yang belajar dari 20 contoh. Siswa menebak dulu. Aturan sekitar 12, Kata sekitar 19.', en: 'The program has common rules plus Kata learning from 20 examples. Students guess first. Rules get about 12, Kata about 19.' },
      stuck: { id: 'Siswa mengira Kata "curang" atau "sudah tahu jawabannya".', en: 'Students think Kata "cheated" or "already knew the answers".' },
      say: { id: '"Siapa yang menulis aturan untuk kata \'bsk\'? Lihat Otak Kata."', en: '"Who wrote a rule for the word \'tmrw\'? Look at Kata\'s brain."' },
    },
    {
      title: { id: 'Tahap 4 · Berapa contoh?', en: 'Stage 4 · How many examples?' },
      happens: { id: 'Dengan 2 contoh tiap jenis, Kata kacau. Dengan sekitar 12 contoh tiap jenis, Kata benar 17 dari 20.', en: 'With 2 examples of each kind, Kata gets it wrong a lot. With about 12 each, it gets 17 of 20.' },
      stuck: { id: 'Siswa menaikkan jumlah contoh satu jenis saja.', en: 'Students only raise the count for one kind.' },
      say: { id: '"Dari mana Kata tahu kata \'besok\' itu penting?"', en: '"How does Kata know \'tomorrow\' is important?"' },
    },
    {
      title: { id: 'Tahap 5 · Kata mulai bekerja', en: 'Stage 5 · Kata goes to work' },
      happens: { id: 'Di hari ke-3 kelas memakai slang baru. Kata turun ke 4 dari 6 dan bobot katanya sama persis. Setelah dilatih ulang dengan chat terbaru, Kata benar lagi.', en: 'On day 3 the class uses new slang. Kata drops to 4 of 6, and its word weights stay exactly the same. After retraining on the latest chat, it is right again.' },
      stuck: { id: 'Siswa berharap Kata belajar sendiri kalau bekerja lebih lama.', en: 'Students expect Kata to learn on its own if it works longer.' },
      say: { id: '"Apakah aplikasi di HP-mu jadi lebih pintar setiap kamu pakai?"', en: '"Do the apps on your phone get smarter every time you use them?"' },
    },
    {
      title: { id: 'Bonus · Bisakah aturan menyamai Kata?', en: 'Bonus · Can rules match Kata?' },
      happens: { id: 'Aturan saja harus benar 18 dari 20. Bisa, dengan aturan santai di urutan atas.', en: 'Rules alone must get 18 of 20. It can be done with chit-chat rules at the top.' },
      stuck: { id: 'Siswa lupa bahwa aturan paling atas dicek duluan.', en: 'Students forget the top rule is checked first.' },
      say: { id: '"Aturanmu cocok untuk 20 pesan ini. Apakah akan cocok untuk chat besok?"', en: '"Your rules fit these 20 messages. Will they fit tomorrow\'s chat?"' },
    },
  ],
  debrief: {
    guru: [
      { q: { id: 'Aplikasi apa di HP-mu yang menurutmu belajar dari contoh?', en: 'Which apps on your phone do you think learn from examples?' }, a: { id: 'Filter spam, saran kata di keyboard, pengelompokan foto.', en: 'Spam filters, keyboard suggestions, photo grouping.' } },
      { q: { id: 'Kenapa aturanmu kalah dari contoh? Apakah aturan selalu kalah?', en: 'Why did your rules lose to examples? Do rules always lose?' }, a: { id: 'Bahasa sehari-hari terlalu beragam. Aturan tetap menang untuk hal yang sedikit dan jelas, seperti kalkulator.', en: 'Everyday language varies too much. Rules still win for small, clear jobs, such as a calculator.' } },
      { q: { id: 'Siapa yang memberi label pada contoh-contoh Kata? Bagaimana kalau ia salah?', en: "Who labelled Kata's examples? What if they got it wrong?" }, a: { id: 'Manusia. Label yang salah mengajari AI hal yang salah. Ini dibahas di Sesi 3.', en: 'People did. Wrong labels teach the AI wrong things. Session 3 picks this up.' } },
      { q: { id: 'Kata tidak bertambah pintar saat dipakai. Apakah aplikasi sungguhan juga begitu?', en: "Kata didn't get smarter while it worked. Is that true of real apps?" }, a: { id: 'Umumnya ya. Model dilatih ulang dan diperbarui secara terpisah.', en: 'Mostly yes. Models are retrained and updated separately.' } },
    ],
    ortu: [
      { id: 'Aplikasi apa di HP kita yang mungkin belajar dari contoh?', en: 'Which apps on our phones might learn from examples?' },
      { id: 'Kalau HP menyarankan kata yang aneh, menurutmu kenapa?', en: 'When a phone suggests a strange word, why do you think it does?' },
      { id: 'Apa bedanya menulis aturan dengan memberi contoh?', en: 'What is the difference between writing rules and giving examples?' },
    ],
  },
  exitTicket: [
    { q: { id: 'Galeri HP-mu mengelompokkan foto "makanan". Siapa yang membuat aturannya? (a) programmer menulis aturan untuk setiap foto, (b) aplikasi belajar dari banyak contoh foto berlabel, (c) HP menebak acak', en: 'Your phone gallery groups "food" photos. Who made the rules? (a) a programmer wrote a rule for every photo, (b) the app learned from many labelled example photos, (c) the phone guesses at random' }, a: { id: '(b)', en: '(b)' } },
    { q: { id: 'Sebuah aplikasi dirilis bulan lalu. Apakah ia makin pintar setiap kamu pakai, tanpa dilatih ulang? Jelaskan.', en: 'An app was released last month. Does it get smarter every time you use it, without retraining? Explain.' }, a: { id: 'Tidak. Model hanya berubah saat dilatih ulang.', en: 'No. A model only changes when it is trained again.' } },
    { q: { id: 'Kata cuma diberi 2 contoh pesan penting. Apa yang mungkin terjadi?', en: 'Kata only got 2 examples of important messages. What might happen?' }, a: { id: 'Ia hanya kenal sedikit kata, jadi banyak pesan baru salah dipilah.', en: 'It knows only a few words, so it sorts many new messages wrongly.' } },
  ],
  misconceptions: [
    { belief: { id: '"AI berpikir seperti manusia."', en: '"AI thinks like a person."' }, reply: { id: 'Tunjuk Otak Kata: Kata hanya menghitung seberapa sering tiap kata muncul bersama label.', en: "Point at Kata's brain: Kata only counts how often each word came with each label." } },
    { belief: { id: '"AI makin pintar setiap dipakai."', en: '"AI gets smarter every time it\'s used."' }, reply: { id: 'Ulangi tahap 5: bobot kata tidak berubah sampai Kata dilatih lagi.', en: "Replay stage 5: the word weights don't change until Kata is trained again." } },
    { belief: { id: '"Makin banyak aturan, makin bagus."', en: '"More rules is always better."' }, reply: { id: 'Tahap 2 menunjukkan aturan terus patah oleh pesan baru. Aturan bagus untuk 20 pesan ini belum tentu bagus untuk besok.', en: "Stage 2 shows rules keep breaking on new messages. Rules that fit these 20 may not fit tomorrow." } },
  ],
  extension: {
    guru: [
      { id: 'Literasi Digital (8 menit): buat poster 4 panel "Cara Kata belajar": aturan, contoh, training, latih ulang.', en: 'Digital literacy (8 minutes): make a 4-panel poster, "How Kata learns": rules, examples, training, retraining.' },
      { id: 'Lanjutan: proyek "Pemilah Sampah Pintar" dengan Teachable Machine di Buku Siswa KKA kelas VII, Bab 4. Idenya sama, tapi memakai kamera.', en: 'Follow-up: the "Pemilah Sampah Pintar" (smart waste sorter) project with Teachable Machine in the KKA grade VII student book, chapter 4. Same idea, with a camera.' },
    ],
    ortu: {
      id: 'Kebiasaan "AI di rumah": sebelum memakai saran dari HP (kata, video, lagu), tebak bersama kenapa HP menyarankannya.',
      en: 'An "AI at home" habit: before using a suggestion from a phone (a word, a video, a song), guess together why it suggested it.',
    },
  },
  unplugged: {
    guru: [
      { id: 'Bagikan kartu "latih" (berlabel) ke tiap kelompok.', en: 'Give each group the "training" cards (with labels).' },
      { id: 'Kelompok membuat lembar tally: untuk setiap kata, berapa kali muncul di kartu penting dan berapa kali di kartu santai.', en: 'Groups make a tally sheet: for each word, how many times it appears on important cards and how many on chit-chat cards.' },
      { id: 'Bagikan kartu "uji" (tanpa label). Untuk setiap kartu, jumlahkan tally kata-katanya. Sisi yang lebih besar menang.', en: 'Give out the "test" cards (no labels). For each card, add up the tallies of its words. The bigger side wins.' },
      { id: 'Bandingkan dengan aturan di sticky note dari pemanasan. Mana yang lebih sering benar?', en: 'Compare with the sticky-note rules from the warm-up. Which is right more often?' },
      { id: 'Tambahkan 4 kartu slang baru, buatan siswa sendiri. Apakah tally lama masih berhasil? Apa yang perlu dilakukan?', en: "Add 4 new slang cards that students make up. Does the old tally still work? What needs to happen?" },
    ],
    ortu: [
      { id: 'Tulis 6 pesan di kertas kecil: 3 penting, 3 santai. Anak membuat tally kata.', en: 'Write 6 messages on slips of paper: 3 important, 3 chit-chat. Your child tallies the words.' },
      { id: 'Tulis 4 pesan baru. Anak menebak labelnya dengan tally, lalu jelaskan caranya ke Ayah/Bunda.', en: 'Write 4 new messages. Your child guesses their labels using the tally, then explains how to you.' },
    ],
  },
  cardSets: [
    {
      title: { id: 'Kartu latih (berlabel)', en: 'Training cards (labelled)' },
      showLabel: true,
      cards: (lang) => CORPUS[lang].train.slice(0, 20).map((m) => ({ text: m.text, label: label[lang][m.label] })),
    },
    {
      title: { id: 'Kartu uji (tanpa label, kunci jawaban di bawah lembar)', en: 'Test cards (no label; answer key under the sheet)' },
      showLabel: false,
      cards: (lang) => CORPUS[lang].test.map((m) => ({ text: m.text, label: label[lang][m.label] })),
    },
  ],
  mapping: [
    { framework: 'KKA Fase D', covers: { id: 'Pemanfaatan dan Pengembangan KA; Literasi dan Etika KA. Materi kelas VII–VIII.', en: 'Pemanfaatan dan Pengembangan KA; Literasi dan Etika KA. Grade VII–VIII material.' } },
    { framework: 'AI4K12 (grade 6–8)', covers: { id: '3-A-i (manusia vs ML), 3-A-iii (melatih dan menguji model), 3-A-iv (melatih vs memakai model).', en: '3-A-i (people vs ML), 3-A-iii (training and testing a model), 3-A-iv (training vs using a model).' } },
    { framework: 'UNESCO (2024)', covers: { id: 'CG4.1.3.1 (apa itu AI), CG4.1.3.2 (cara model dilatih dari data).', en: 'CG4.1.3.1 (what AI is), CG4.1.3.2 (how models are trained from data).' } },
  ],
}
