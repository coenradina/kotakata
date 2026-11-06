import { PAST, PAST_BIASED } from '../levels/ekskul/model'
import type { Card, SessionGuide } from './types'

const CLUB: Record<string, Record<'id' | 'en', string>> = {
  basket: { id: 'basket', en: 'basketball' },
  choir: { id: 'paduan suara', en: 'choir' },
  robot: { id: 'robotik', en: 'robotics' },
}
const ANSWER: [keyof (typeof PAST)[number]['answers'], Record<'id' | 'en', string>][] = [
  ['music', { id: 'musik', en: 'music' }],
  ['team', { id: 'olahraga tim', en: 'team sports' }],
  ['build', { id: 'merakit', en: 'building' }],
  ['after', { id: 'bisa sore', en: 'free after school' }],
  ['classA', { id: 'kelas A', en: 'class A' }],
]

/** One card per past member: what they answered, and the club they joined on the back. */
const members = (list: typeof PAST) => (lang: 'id' | 'en'): Card[] =>
  list.map((s) => ({
    text: ANSWER.filter(([f]) => s.answers[f]).map(([, l]) => l[lang]).join(', ') || '-',
    label: CLUB[s.ekskul][lang],
  }))

export const GUIDE_S4: SessionGuide = {
  session: 's4',
  title: { id: 'Ekskul Apa?', en: 'Which Club?' },
  bigQuestion: {
    id: 'Kenapa aku disarankan masuk paduan suara? Aku kan mau basket.',
    en: 'Why was I told to join the choir? I wanted basketball.',
  },
  kelas: '8',
  kka: {
    elements: [
      { id: 'Pemanfaatan dan Pengembangan KA', en: 'Pemanfaatan dan Pengembangan KA (using and developing AI)' },
      { id: 'Literasi dan Etika KA', en: 'Literasi dan Etika KA (AI literacy and ethics)' },
    ],
    materi: [
      { id: 'Kelas VIII: Eksperimen Klasifikasi; Data Latih', en: 'Grade VIII: Eksperimen Klasifikasi (classification experiments); Data Latih (training data)' },
      { id: 'CP: bias pada data dan dampaknya pada keputusan KA', en: 'CP: bias in data and its effect on AI decisions' },
      { id: 'CP: menjelaskan cara KA mengambil keputusan', en: 'CP: explaining how AI makes a decision' },
    ],
  },
  goals: [
    { id: 'Membuat pohon keputusan dan menelusuri jalurnya untuk menjelaskan sebuah saran.', en: 'Build a decision tree and trace its path to explain a suggestion.' },
    { id: 'Menjelaskan bahwa komputer bisa membuat pohon sendiri dengan memilih pertanyaan yang paling merapikan data.', en: 'Explain that a computer can build a tree itself by picking the question that tidies the data most.' },
    { id: 'Mengenali bias dari data masa lalu dan pohon yang terlalu panjang, lalu memperbaikinya.', en: 'Spot bias from past data and trees that are too long, and fix them.' },
  ],
  forParents: {
    id: 'Anak membantu robot Kata menyarankan ekskul untuk murid baru dengan pohon pertanyaan ya/tidak. Mereka membaca alasan di balik saran, membiarkan Kata belajar dari data anggota lama, lalu menemukan bahwa data lama bisa membuat Kata tidak adil untuk murid dari kelas lain.',
    en: 'Your child helps the robot Kata suggest a club for new students with a tree of yes/no questions. They read the reason behind each suggestion, let Kata learn from past members, then find that old data can make Kata unfair to students from another class.',
  },
  terms: [
    { term: 'Recommender System', def: { id: 'Program yang menyarankan sesuatu dari data, seperti video, lagu, atau ekskul.', en: 'A program that suggests things from data, such as videos, songs or clubs.' } },
    { term: 'Explainability', def: { id: 'Bisa menunjukkan alasan sebuah keputusan AI supaya bisa diperiksa.', en: "Being able to show the reasons for an AI's decision so it can be checked." } },
    { term: 'Decision Tree Learning', def: { id: 'Komputer membuat pohon sendiri, memilih pertanyaan yang paling merapikan kelompok.', en: 'The computer builds the tree itself, picking the question that tidies the groups most.' } },
    { term: 'Historical Bias', def: { id: 'Ketidakadilan masa lalu yang terbawa di data dan ditiru AI.', en: 'Past unfairness carried in the data and copied by the AI.' } },
    { term: 'Pruning', def: { id: 'Memangkas pohon yang terlalu panjang supaya tidak menghafal kebetulan.', en: "Cutting back a tree that's too long so it doesn't memorise accidents." } },
  ],
  prep: {
    guru: [
      { id: 'Buka aastr.id/kotakata/main/s4 di setiap perangkat.', en: 'Open aastr.id/kotakata/main/s4 on every device.' },
      { id: 'Cetak dua set kartu anggota lama (lampiran): tahun biasa dan tahun "semua basket dari kelas A".', en: 'Print the two sets of past-member cards (appendix): a normal year, and the year when every basketball member was from class A.' },
      { id: 'Sesi ini paling lancar setelah Sesi 3, karena idenya tentang bias dan data uji dipakai lagi.', en: 'This session goes best after Session 3, because it reuses the ideas of bias and test data.' },
    ],
    ortu: [
      { id: 'Buka aastr.id/kotakata/main/s4. Tidak perlu daftar.', en: 'Open aastr.id/kotakata/main/s4. No sign-up needed.' },
      { id: 'Pikirkan satu aplikasi yang memberi saran di rumah, misalnya video atau belanja, untuk dibahas di akhir.', en: 'Think of one app at home that makes suggestions, such as videos or shopping, to talk about at the end.' },
    ],
  },
  warmup: {
    guru: [
      { id: 'Tanyakan: "Kalau kamu harus menyarankan ekskul untuk adik kelas, pertanyaan apa yang kamu tanyakan dulu?" Tulis jawabannya sebagai pohon di papan.', en: 'Ask: "If you had to suggest a club for a younger student, what would you ask first?" Write the answers on the board as a tree.' },
      { id: 'Catat sebagai asesmen awal: apakah siswa memakai pertanyaan tentang minat, atau hal lain seperti kelas dan teman?', en: 'Note as the initial assessment: do students ask about interests, or about other things such as class and friends?' },
    ],
    ortu: {
      id: 'Tanyakan: "Pernah dapat saran dari aplikasi yang tidak cocok? Menurutmu kenapa aplikasinya salah?"',
      en: 'Ask: "Have you ever got a suggestion from an app that was wrong for you? Why do you think it got it wrong?"',
    },
  },
  puzzles: [
    {
      title: { id: 'Tahap 1 · Pohon saran', en: 'Stage 1 · A suggestion tree' },
      happens: { id: 'Pohon dimulai dengan "suka musik?" dan satu cabang kosong. Siswa melengkapinya supaya keenam murid dapat ekskulnya.', en: 'The tree starts with "likes music?" and one empty branch. Students finish it so all six students get their club.' },
      stuck: { id: 'Siswa menaruh saran langsung di cabang "tidak", sehingga basket dan robotik tercampur.', en: 'Students put a suggestion straight on the "no" branch, so basketball and robotics get mixed up.' },
      say: { id: '"Murid yang tidak suka musik ada dua jenis. Pertanyaan apa yang memisahkan mereka?"', en: '"The students who don\'t like music are of two kinds. What question splits them?"' },
    },
    {
      title: { id: 'Tahap 2 · Kenapa aku?', en: 'Stage 2 · Why me?' },
      happens: { id: 'Kata menyarankan paduan suara untuk Dinda. "Jelaskan untuk Dinda" menunjukkan jalurnya: suka musik, ya, paduan suara. Siswa mengubah urutan pertanyaan.', en: 'Kata suggests choir for Dinda. "Explain for Dinda" shows the path: likes music, yes, choir. Students change the order of the questions.' },
      stuck: { id: 'Siswa memperbaiki Dinda tapi lupa blok "jelaskan".', en: 'Students fix Dinda but forget the "explain" block.' },
      say: { id: '"Kalau kamu Dinda, apakah kamu puas hanya diberi jawaban, tanpa alasan?"', en: '"If you were Dinda, would you be happy with an answer and no reason?"' },
    },
    {
      title: { id: 'Tahap 3 · Kata membuat pohon', en: 'Stage 3 · Kata builds the tree' },
      happens: { id: 'Ada 24 anggota lama dan 8 murid baru. Pohon tahap 2 salah untuk Raka dan Ayu yang suka merakit. "Pelajari pohon" membuat pohon yang dimulai dengan "suka merakit?".', en: 'There are 24 past members and 8 new students. The stage 2 tree is wrong for Raka and Ayu, who like building things. "Learn a tree" builds one that starts with "likes building things?".' },
      stuck: { id: 'Siswa mencoba menyusun pohon besar sendiri. Itu boleh, tapi lama.', en: 'Students try to build a big tree by hand. That is allowed, but slow.' },
      say: { id: '"Kata mencoba semua pertanyaan. Kenapa ia memilih \'suka merakit\' paling atas?"', en: '"Kata tried every question. Why did it put \'likes building things\' at the top?"' },
    },
    {
      title: { id: 'Tahap 4 · Dulu semuanya dari kelas A', en: 'Stage 4 · They were all from class A' },
      happens: { id: 'Di data tahun lalu, semua anggota basket dari kelas A. Kata bertanya "dari kelas A?" lebih dulu dan hanya cocok untuk 1 dari 8 murid baru. Siswa melarang pertanyaan itu.', en: 'In last year\'s data every basketball member was from class A. Kata asks "from class A?" first and fits only 1 of 8 new students. Students ban that question.' },
      stuck: { id: 'Siswa mengira Kata rusak, padahal Kata belajar persis dari datanya.', en: 'Students think Kata is broken, when it learned exactly what the data shows.' },
      say: { id: '"Kenapa semua anggota basket dulu dari kelas A? Apakah itu alasan yang adil untuk murid baru?"', en: '"Why might every basketball member have been from class A? Is that a fair reason for a new student?"' },
    },
    {
      title: { id: 'Tahap 5 · Ikut teman', en: 'Stage 5 · Following friends' },
      happens: { id: 'Enam anggota lama masuk paduan suara karena ikut teman. Pohon Kata yang panjang menghafal mereka dan salah untuk Bimo dan Tono. Batas 2 pertanyaan membuat pohonnya cocok untuk semua murid baru.', en: "Six past members joined choir to follow friends. Kata's long tree memorises them and gets Bimo and Tono wrong. A limit of 2 questions makes the tree fit every new student." },
      stuck: { id: 'Siswa mengira pohon yang lebih panjang selalu lebih pintar.', en: 'Students think a longer tree is always smarter.' },
      say: { id: '"Pohon ini benar 90% untuk anggota lama. Kenapa malah salah untuk murid baru?"', en: '"This tree is 90% right on past members. Why is it wrong on new students?"' },
    },
    {
      title: { id: 'Bonus · Kalahkan Kata', en: 'Bonus · Beat Kata' },
      happens: { id: 'Siswa menyusun pohon sendiri dengan paling banyak 2 pertanyaan, tanpa bertanya soal kelas, yang cocok untuk kedelapan murid baru.', en: 'Students build their own tree with at most 2 questions, without asking about class, that fits all eight new students.' },
      stuck: { id: 'Siswa memakai 3 pertanyaan. Mengingat pohon Kata dari tahap 5 membantu.', en: "Students use 3 questions. Remembering Kata's tree from stage 5 helps." },
      say: { id: '"Pohon pendek yang adil itu seperti apa? Bisakah kamu menjelaskannya ke adik kelas?"', en: '"What does a short, fair tree look like? Could you explain it to a younger student?"' },
    },
  ],
  debrief: {
    guru: [
      { q: { id: 'Kenapa penting bisa menjelaskan saran AI?', en: "Why does it matter to be able to explain an AI's suggestion?" }, a: { id: 'Supaya orang bisa memeriksa, membantah, dan memperbaikinya, seperti Dinda.', en: 'So people can check it, argue with it and fix it, like Dinda.' } },
      { q: { id: 'Kata belajar dengan benar dari data tahun lalu. Kenapa hasilnya tetap tidak adil?', en: "Kata learned correctly from last year's data. Why was it still unfair?" }, a: { id: 'Data lama membawa kebiasaan lama. AI meniru pola, termasuk pola yang tidak adil.', en: 'Old data carries old habits. AI copies patterns, unfair ones included.' } },
      { q: { id: 'Pohon yang benar 90% di data lama salah untuk murid baru. Apa hubungannya dengan Sesi 3?', en: 'A tree that was 90% right on old data was wrong on new students. How does this connect to Session 3?' }, a: { id: 'Itu overfitting. Ujilah AI pada data yang belum pernah ia lihat.', en: 'That is overfitting. Test AI on data it has never seen.' } },
      { q: { id: 'Di mana kamu bertemu sistem rekomendasi di kehidupan sehari-hari?', en: 'Where do you meet recommender systems in everyday life?' }, a: { id: 'Video, musik, belanja, berita, bahkan penerimaan sekolah atau kerja.', en: 'Videos, music, shopping, news, even school or job admissions.' } },
    ],
    ortu: [
      { id: 'Kalau aplikasi menyarankan sesuatu, bisakah kita tahu alasannya?', en: 'When an app suggests something, can we find out why?' },
      { id: 'Kalau data lama tidak adil, apa yang terjadi pada AI yang belajar darinya?', en: 'If old data was unfair, what happens to an AI that learns from it?' },
      { id: 'Siapa yang sebaiknya memeriksa saran AI sebelum dipakai untuk keputusan penting?', en: "Who should check an AI's suggestion before it is used for an important decision?" },
    ],
  },
  exitTicket: [
    { q: { id: 'Pohon bertanya "suka musik?" lebih dulu. Dinda suka musik dan olahraga tim, dan mau basket. Apa yang terjadi?', en: 'A tree asks "likes music?" first. Dinda likes music and team sports, and wants basketball. What happens?' }, a: { id: 'Dinda disarankan paduan suara. Urutan pertanyaannya perlu diubah.', en: 'Dinda is told choir. The question order needs changing.' } },
    { q: { id: 'Data lama: semua anggota basket dari kelas A. AI-nya akan bertanya apa?', en: 'Old data: every basketball member was from class A. What will the AI ask?' }, a: { id: '"Dari kelas A?", padahal itu tidak adil.', en: '"From class A?", even though that is unfair.' } },
    { q: { id: 'Pohon panjang 100% benar di data latih. Apakah pasti bagus untuk murid baru?', en: 'A long tree is 100% right on the training data. Is it sure to be good on new students?' }, a: { id: 'Tidak. Ia bisa menghafal kebetulan. Uji pada data baru.', en: 'No. It may have memorised accidents. Test it on new data.' } },
  ],
  misconceptions: [
    { belief: { id: '"Komputer itu netral, jadi sarannya pasti adil."', en: '"Computers are neutral, so their suggestions are fair."' }, reply: { id: 'Tahap 4: Kata belajar dengan benar, tapi datanya tidak adil, jadi sarannya juga tidak adil.', en: 'Stage 4: Kata learned correctly, but the data was unfair, so the suggestions were too.' } },
    { belief: { id: '"Pohon yang lebih panjang lebih pintar."', en: '"A longer tree is smarter."' }, reply: { id: 'Tahap 5: pohon pendek lebih cocok untuk murid baru.', en: 'Stage 5: the short tree fit new students better.' } },
    { belief: { id: '"AI tidak bisa menjelaskan keputusannya."', en: '"AI can\'t explain its decisions."' }, reply: { id: 'Tahap 2: pohon keputusan bisa ditelusuri langkah demi langkah. Tidak semua AI semudah ini, karena itu penjelasan perlu diminta.', en: 'Stage 2: a decision tree can be traced step by step. Not every AI is this easy, which is why explanations must be asked for.' } },
  ],
  extension: {
    guru: [
      { id: 'Diskusi (8 menit): kalau sekolah memakai AI untuk menyarankan jurusan SMA, data apa yang boleh dipakai, dan siapa yang memeriksanya?', en: 'Discussion (8 minutes): if a school used AI to suggest a senior high track, what data may it use, and who checks it?' },
      { id: 'Lanjutan: Sesi 6 (Rapat OSIS) membahas kapan sebaiknya AI tidak dipakai sama sekali.', en: 'Follow-up: Session 6 (student council meeting) covers when AI should not be used at all.' },
    ],
    ortu: {
      id: 'Buka satu aplikasi yang memberi saran. Cari tombol "kenapa saya melihat ini?" kalau ada, dan baca alasannya bersama.',
      en: 'Open one app that makes suggestions. Look for a "why am I seeing this?" button if there is one, and read the reason together.',
    },
  },
  unplugged: {
    guru: [
      { id: 'Kelompok mendapat kartu anggota lama tahun biasa. Mereka menyusun pohon ya/tidak di kertas supaya setiap kartu sampai ke ekskul di baliknya.', en: 'Groups get the normal-year member cards. They draw a yes/no tree on paper so every card reaches the club on its back.' },
      { id: 'Untuk meniru "pelajari pohon": coba setiap pertanyaan, pisahkan kartu jadi dua tumpukan, dan pilih pertanyaan yang tumpukannya paling seragam.', en: 'To act out "learn a tree": try each question, split the cards into two piles, and keep the question whose piles are most alike.' },
      { id: 'Ulangi dengan kartu tahun "semua basket dari kelas A". Pertanyaan apa yang menang? Apakah adil?', en: 'Repeat with the "every basketball member from class A" cards. Which question wins? Is it fair?' },
    ],
    ortu: [
      { id: 'Pakai kartu anggota lama. Anak membuat pohon, lalu Ayah/Bunda menjadi "murid baru" dan menjawab pertanyaannya.', en: 'Use the past-member cards. Your child builds a tree, then you play a "new student" and answer its questions.' },
      { id: 'Minta anak menjelaskan kenapa Anda mendapat saran itu, dengan menelusuri jalurnya.', en: 'Ask your child to explain why you got that suggestion by tracing the path.' },
    ],
  },
  cardSets: [
    { title: { id: 'Kartu anggota lama (tahun biasa)', en: 'Past-member cards (normal year)' }, showLabel: false, cards: members(PAST) },
    { title: { id: 'Kartu anggota lama (semua basket dari kelas A)', en: 'Past-member cards (every basketball member from class A)' }, showLabel: false, cards: members(PAST_BIASED) },
  ],
  mapping: [
    { framework: 'KKA Fase D', covers: { id: 'Pemanfaatan dan Pengembangan KA (eksperimen klasifikasi, data latih); Literasi dan Etika KA (bias, menjelaskan keputusan KA). Materi kelas VIII.', en: 'Pemanfaatan dan Pengembangan KA (classification experiments, training data); Literasi dan Etika KA (bias, explaining AI decisions). Grade VIII material.' } },
    { framework: 'AI4K12 (grade 6–8)', covers: { id: '3-A-iii dan 3-A-v (algoritma belajar membuat model), 3-C-i dan 3-C-iii (bias dari data latih).', en: '3-A-iii and 3-A-v (learning algorithms build models), 3-C-i and 3-C-iii (bias from training data).' } },
    { framework: 'UNESCO (2024)', covers: { id: 'CG4.2.1.1 (keadilan dan inklusi), CG4.2.2.1 (transparansi dan penjelasan).', en: 'CG4.2.1.1 (fairness and inclusion), CG4.2.2.1 (transparency and explanation).' } },
  ],
}
