import { FAIR_CORPUS } from '../levels/fair/messages'
import type { SessionGuide } from './types'

const label = { id: { penting: 'PENTING', santai: 'SANTAI' }, en: { penting: 'IMPORTANT', santai: 'CHIT-CHAT' } }

export const GUIDE_S3: SessionGuide = {
  session: 's3',
  title: { id: 'Data yang Adil', en: 'Fair Data' },
  bigQuestion: { id: 'Kenapa Kata jadi kacau di kelas sepupuku?', en: "Why does Kata get it so wrong in my cousin's class?" },
  kelas: '8–9',
  kka: {
    elements: [{ id: 'Literasi dan Etika KA', en: 'Literasi dan Etika KA (AI literacy and ethics)' }],
    materi: [
      { id: 'Kelas VIII: Data Latih dalam Pengembangan KA', en: 'Grade VIII: Data Latih (training data)' },
      { id: 'Kelas IX: Kualitas Data', en: 'Grade IX: Kualitas Data (data quality)' },
      { id: 'CP: memahami kualitas data; KA bisa menghasilkan output yang bias', en: 'CP: understand data quality; AI can produce biased output' },
    ],
  },
  goals: [
    { id: 'Menjelaskan bahwa AI bisa bias kalau data latihnya tidak mewakili orang yang memakainya.', en: "Explain that an AI can be biased when its training data doesn't represent the people using it." },
    { id: 'Menjelaskan bahwa data yang beragam lebih berguna daripada data yang banyak tapi seragam.', en: 'Explain that varied data helps more than lots of the same data.' },
    { id: 'Menjelaskan kenapa label harus dicek dan kenapa ujian harus memakai data yang belum pernah dilihat AI.', en: "Explain why labels need checking and why a test must use data the AI hasn't seen." },
    { id: 'Memeriksa apakah AI adil untuk setiap orang, bukan hanya bagus rata-ratanya.', en: 'Check whether an AI is fair to each person, not just good on average.' },
  ],
  forParents: {
    id: 'Robot Kata dari Sesi 1 dipakai oleh kelas lain yang cara menulisnya berbeda, dan Kata jadi sering salah. Anak mencari tahu kenapa: datanya tidak mewakili kelas itu. Anak lalu memperbaiki datanya, sampai Kata adil untuk semua orang, termasuk teman yang sering salah ketik.',
    en: 'The robot Kata from Session 1 goes to work for another class that writes differently, and it starts getting things wrong. Your child works out why: its data does not represent that class. Then they fix the data until Kata is fair to everyone, including a friend who makes a lot of typos.',
  },
  terms: [
    { term: 'Bias', def: { id: 'AI bekerja lebih buruk untuk sebagian orang karena data latihnya tidak mewakili mereka.', en: "An AI works worse for some people because its training data doesn't represent them." } },
    { term: 'Data Quality', def: { id: 'Seberapa benar dan rapi data latihnya, termasuk labelnya.', en: 'How correct and clean the training data is, labels included.' } },
    { term: 'Test Data', def: { id: 'Data yang disisihkan dan tidak dipakai belajar, supaya ujiannya jujur.', en: 'Data kept back from training, so the test is honest.' } },
    { term: 'Overfitting', def: { id: 'Model bagus sekali di data latihnya, tapi kurang bagus di data baru.', en: 'A model that does very well on its training data but worse on new data.' } },
    { term: 'Fairness', def: { id: 'AI bekerja sama baiknya untuk setiap orang, bukan cuma bagus rata-ratanya.', en: 'An AI works about as well for each person, not just well on average.' } },
  ],
  prep: {
    guru: [
      { id: 'Buka aastr.id/kotakata/main/s3 di setiap perangkat. Sesi ini bisa dimainkan tanpa Sesi 1, tapi lebih bermakna setelahnya.', en: 'Open aastr.id/kotakata/main/s3 on every device. It works without Session 1, but means more after it.' },
      { id: 'Cetak kartu chat 8C dan kartu kakak kelas (lampiran) untuk versi unplugged.', en: 'Print the 8C chat cards and the older-class cards (appendix) for the unplugged version.' },
      { id: 'Siapkan contoh nyata yang aman untuk diskusi: asisten suara yang kurang mengerti logat daerah.', en: "Prepare a safe real example for discussion: voice assistants that understand some accents less well." },
    ],
    ortu: [
      { id: 'Buka aastr.id/kotakata/main/s3. Tidak perlu daftar.', en: 'Open aastr.id/kotakata/main/s3. No sign-up needed.' },
      { id: 'Lebih seru kalau anak sudah main Sesi 1 dulu.', en: 'It works best if your child has played Session 1 first.' },
    ],
  },
  warmup: {
    guru: [
      { id: 'Tanyakan: "Kata apa yang hanya dipakai di daerahmu atau di grup temanmu?" Tulis jawabannya di papan.', en: 'Ask: "What words are only used in your area or in your friend group?" Write the answers on the board.' },
      { id: 'Tanyakan: "Kalau robot hanya belajar dari chat kelas kita, apakah ia akan mengerti kata-kata itu?" Catat tebakan siswa sebagai asesmen awal.', en: 'Ask: "If a robot only learned from our class chat, would it understand those words?" Note the guesses as the initial assessment.' },
    ],
    ortu: {
      id: 'Tanyakan: "Ada kata yang cuma dipakai di keluarga kita atau di sekolahmu? Menurutmu, apakah aplikasi di HP mengerti kata itu?"',
      en: 'Ask: "Are there words only our family or your school uses? Do you think the apps on your phone understand them?"',
    },
  },
  puzzles: [
    {
      title: { id: 'Tahap 1 · Kata pindah ke 8C', en: 'Stage 1 · Kata moves to 8C' },
      happens: { id: 'Kata dari 8A benar 19 dari 20 di 8A, tapi cuma sekitar 13 di 8C. "Periksa data" menunjukkan Kata hanya kenal sebagian kecil kata 8C.', en: 'Kata from 8A gets 19 of 20 on 8A but only about 13 on 8C. "Inspect the data" shows it knows only a small share of 8C\'s words.' },
      stuck: { id: 'Siswa menaruh "periksa data" sebelum ujian.', en: 'Students put "inspect the data" before the test.' },
      say: { id: '"Kata-kata abu-abu itu apa artinya? Pernahkah Kata melihatnya?"', en: '"What do the grey words mean? Has Kata ever seen them?"' },
    },
    {
      title: { id: 'Tahap 2 · Lebih banyak atau berbeda?', en: 'Stage 2 · More, or different?' },
      happens: { id: 'Demo memberi 40 contoh dari 8A, dan Kata tetap sekitar 14 dari 20. Menambah 8 contoh dari 8C membuatnya 18–20.', en: 'The demo gives 40 examples from 8A, and Kata stays around 14 of 20. Adding 8 examples from 8C gets it to 18–20.' },
      stuck: { id: 'Siswa terus menaikkan jumlah contoh dari 8A.', en: 'Students keep raising the number of 8A examples.' },
      say: { id: '"Contoh dari 8A mengajari Kata kata-kata baru, atau kata yang sudah ia tahu?"', en: '"Do more 8A examples teach Kata new words, or words it already knows?"' },
    },
    {
      title: { id: 'Tahap 3 · Ada label yang salah', en: 'Stage 3 · Some labels are wrong' },
      happens: { id: 'Data gratis dari kakak kelas punya label iseng. Kata turun ke sekitar 10 dari 20 di 8A. "Minta teman cek label" memperbaikinya.', en: 'Free data from an older class has joke labels. Kata drops to about 10 of 20 on 8A. "Ask a friend to check the labels" fixes it.' },
      stuck: { id: 'Siswa mengira lebih banyak data selalu lebih baik.', en: 'Students assume more data is always better.' },
      say: { id: '"Data ini gratis. Bagaimana kamu tahu labelnya benar?"', en: '"This data was free. How would you know the labels are right?"' },
    },
    {
      title: { id: 'Tahap 4 · Ujian yang curang', en: 'Stage 4 · The cheating test' },
      happens: { id: 'Menguji Kata dengan data latihnya sendiri memberi 100%, tapi skor minggu depan lebih rendah. Siswa menyisihkan contoh sebelum training.', en: "Testing Kata on its own training data gives 100%, but next week's score is lower. Students set examples aside before training." },
      stuck: { id: 'Siswa menyisihkan contoh setelah "latih Kata", jadi tidak berpengaruh.', en: 'Students set examples aside after "train Kata", so it has no effect.' },
      say: { id: '"Kalau gurumu memberi soal ulangan yang sama persis dengan latihan, apakah nilaimu menunjukkan kamu paham?"', en: '"If your teacher gave a test with exactly the practice questions, would your score show you understand?"' },
    },
    {
      title: { id: 'Tahap 5 · Siapa yang dirugikan?', en: 'Stage 5 · Who gets left out?' },
      happens: { id: 'Skor untuk semua orang 83%, tapi Bimo, yang sering salah ketik, cuma 3 dari 6. Contoh pesan Bimo membuat Kata adil untuk semua.', en: 'Everyone together scores 83%, but Bimo, who types with typos, gets 3 of 6. Examples of Bimo\'s messages make Kata fair to everyone.' },
      stuck: { id: 'Siswa puas dengan skor total yang tinggi.', en: 'Students are happy with the high total.' },
      say: { id: '"Skornya bagus untuk siapa? Ada yang tertinggal?"', en: '"Who is the score good for? Is anyone left behind?"' },
    },
    {
      title: { id: 'Bonus · Hemat data', en: 'Bonus · On a budget' },
      happens: { id: 'Adil untuk keempat orang dengan paling banyak 40 contoh.', en: 'Fair to all four people with at most 40 examples.' },
      stuck: { id: 'Siswa membagi contoh sama rata untuk semua sumber.', en: 'Students split examples evenly across every source.' },
      say: { id: '"Siapa yang paling butuh contoh? Siapa yang sudah cukup?"', en: '"Who needs examples most? Who already has enough?"' },
    },
  ],
  debrief: {
    guru: [
      { q: { id: 'Siapa yang mungkin kurang dimengerti asisten suara yang dilatih kebanyakan dengan logat Jakarta?', en: 'Who might a voice assistant trained mostly on Jakarta accents understand less well?' }, a: { id: 'Penutur bahasa daerah dan logat lain. Ini nyata: banyak AI bahasa bekerja lebih buruk untuk bahasa yang datanya sedikit.', en: 'Speakers of regional languages and other accents. This is real: many language AIs work worse for languages with little data.' } },
      { q: { id: 'Kenapa skor 100% di tahap 4 menipu?', en: 'Why was the 100% in stage 4 misleading?' }, a: { id: 'Kata diuji dengan contoh yang sudah ia hafal. Ujian jujur memakai data yang belum pernah ia lihat.', en: "Kata was tested on examples it had already seen. An honest test uses data it hasn't seen." } },
      { q: { id: 'Kalau sebuah aplikasi bekerja buruk untuk sebagian orang, siapa yang harus memperbaikinya?', en: 'If an app works badly for some people, who should fix it?' }, a: { id: 'Pembuatnya bertanggung jawab. Pengguna bisa melaporkan. Ini dibahas lebih jauh di Sesi 6.', en: 'Its makers are responsible. Users can report it. Session 6 goes further.' } },
    ],
    ortu: [
      { id: 'Pernahkah aplikasi salah mengerti kata-katamu? Kenapa, menurutmu?', en: 'Has an app ever misunderstood your words? Why do you think it did?' },
      { id: 'Kenapa skor rata-rata yang tinggi belum cukup?', en: "Why isn't a high average score enough?" },
      { id: 'Apa yang bisa dilakukan pembuat aplikasi supaya adil untuk semua?', en: 'What could app makers do to be fair to everyone?' },
    ],
  },
  exitTicket: [
    { q: { id: 'Sebuah filter foto dilatih dengan wajah dari satu negara saja. Apa yang mungkin terjadi?', en: 'A photo filter was trained on faces from one country only. What might happen?' }, a: { id: 'Filter itu bekerja lebih buruk untuk wajah lain.', en: 'It works worse for other faces.' } },
    { q: { id: 'Kata benar 100% saat diuji dengan pesan latihnya. Ujian mana yang lebih bisa dipercaya?', en: 'Kata gets 100% when tested on its training messages. Which test is more trustworthy?' }, a: { id: 'Ujian dengan pesan yang disisihkan atau pesan baru.', en: 'A test on set-aside or new messages.' } },
    { q: { id: 'Tambah 1000 contoh yang mirip, atau 50 contoh yang berbeda? Kenapa?', en: 'Add 1,000 similar examples, or 50 different ones? Why?' }, a: { id: '50 yang berbeda, karena mengajari kata dan cara menulis yang belum dikenal.', en: "The 50 different ones, because they teach words and ways of writing it doesn't know yet." } },
  ],
  misconceptions: [
    { belief: { id: '"Kata bodoh di 8C karena programnya jelek."', en: '"Kata is bad at 8C because its program is bad."' }, reply: { id: 'Programnya tidak pernah berubah di sesi ini. Yang berubah hanya datanya.', en: 'The program never changes in this session. Only the data does.' } },
    { belief: { id: '"Data gratis pasti membantu."', en: '"Free data always helps."' }, reply: { id: 'Tahap 3: label yang salah membuat Kata lebih buruk daripada tanpa data itu.', en: 'Stage 3: wrong labels make Kata worse than having no such data at all.' } },
    { belief: { id: '"Skor 90% berarti bagus untuk semua."', en: '"90% means it works for everyone."' }, reply: { id: 'Tahap 5: rata-rata tinggi bisa menyembunyikan satu orang yang selalu salah dipahami.', en: 'Stage 5: a high average can hide one person who is always misunderstood.' } },
  ],
  extension: {
    guru: [
      { id: 'Literasi Digital (8 menit): infografis "3 cara data membuat AI tidak adil", memakai contoh dari permainan.', en: 'Digital literacy (8 minutes): an infographic, "3 ways data makes AI unfair", using examples from the game.' },
      { id: 'Lanjutan: jurnal bias seminggu dari Buku Siswa KKA kelas VII (Mengidentifikasi Bias dalam Teknologi).', en: 'Follow-up: the one-week bias journal from the KKA grade VII student book (Mengidentifikasi Bias dalam Teknologi).' },
    ],
    ortu: {
      id: 'Kebiasaan "AI di rumah": saat aplikasi salah mengerti, cari tahu bersama, apakah karena kata atau logatnya jarang dipakai orang?',
      en: 'An "AI at home" habit: when an app misunderstands, work out together whether it is because those words or that accent are rare.',
    },
  },
  unplugged: {
    guru: [
      { id: 'Pakai tally kata dari versi unplugged Sesi 1, atau buat dari kartu latih 8A.', en: 'Use the word tally from the Session 1 unplugged version, or build one from the 8A training cards.' },
      { id: 'Kelompok memilah kartu chat 8C dengan tally itu dan menghitung skornya.', en: 'Groups sort the 8C chat cards with that tally and count their score.' },
      { id: 'Setiap kelompok punya 2 token untuk "membeli" kartu latih baru: dari 8A atau dari 8C. Mana yang menaikkan skor?', en: 'Each group has 2 tokens to "buy" new training cards: from 8A or from 8C. Which raises the score?' },
      { id: 'Bagikan kartu kakak kelas. Siswa mencari label yang mencurigakan sebelum memakainya.', en: 'Hand out the older-class cards. Students look for suspicious labels before using them.' },
    ],
    ortu: [
      { id: 'Tulis 4 pesan dengan kata-kata khas keluarga atau daerah kalian. Apakah tally dari Sesi 1 bisa memilahnya?', en: 'Write 4 messages with words your family or region uses. Can the Session 1 tally sort them?' },
      { id: 'Tambahkan 2 contoh berlabel dengan kata-kata itu, lalu coba lagi.', en: 'Add 2 labelled examples with those words, then try again.' },
    ],
  },
  cardSets: [
    {
      title: { id: 'Kartu chat 8C (tanpa label, kunci jawaban di bawah lembar)', en: '8C chat cards (no label; answer key under the sheet)' },
      showLabel: false,
      cards: (lang) => FAIR_CORPUS[lang].cousin.test.map((m) => ({ text: m.text, label: label[lang][m.label] })),
    },
    {
      title: { id: 'Kartu latih 8C (berlabel, untuk "dibeli")', en: '8C training cards (labelled, to "buy")' },
      showLabel: true,
      cards: (lang) => FAIR_CORPUS[lang].cousin.history.slice(0, 12).map((m) => ({ text: m.text, label: label[lang][m.label] })),
    },
    {
      title: { id: 'Kartu kakak kelas (sebagian labelnya salah)', en: 'Older-class cards (some labels are wrong)' },
      showLabel: true,
      // A mix: mostly honest labels, with four of the joke ones among them.
      cards: (lang) => {
        const d = FAIR_CORPUS[lang].donated
        return [...d.filter((m) => !m.wrong).slice(0, 8), ...d.filter((m) => m.wrong).slice(0, 4)].map((m) => ({ text: m.text, label: label[lang][m.label] }))
      },
    },
  ],
  mapping: [
    { framework: 'KKA Fase D', covers: { id: 'Literasi dan Etika KA: kualitas data dan bias. Materi kelas VIII–IX.', en: 'Literasi dan Etika KA: data quality and bias. Grade VIII–IX material.' } },
    { framework: 'AI4K12 (grade 6–8)', covers: { id: '3-C-iii (pilihan data latih membentuk perilaku dan bias), 1-C-ii (bias budaya), 3-A-iii (mengevaluasi model).', en: '3-C-iii (training data shapes behaviour and bias), 1-C-ii (cultural bias), 3-A-iii (evaluating a model).' } },
    { framework: 'UNESCO (2024)', covers: { id: 'CG4.1.2.2 (non-diskriminasi), lab bias data (hlm. 41), CG4.1.3.4 (isu etika data latih).', en: 'CG4.1.2.2 (non-discrimination), the data biases lab (p. 41), CG4.1.3.4 (ethical issues with training data).' } },
  ],
}
