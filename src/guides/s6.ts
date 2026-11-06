import type { Card, SessionGuide } from './types'

type T = Record<'id' | 'en', string>
const ROLE: T = { id: 'Peran', en: 'Role' }
const PROPOSAL: T = { id: 'Usulan', en: 'Proposal' }
const EVENT: T = { id: 'Kejadian', en: 'Event' }

const CARDS: [T, T][] = [
  [ROLE, { id: 'Raka, Ketua OSIS. Peduli: waktu yang dihemat.', en: 'Raka, council chair. Cares about: time saved.' }],
  [ROLE, { id: 'Bu Rina, guru. Peduli: keadilan, dan esai salinan tertangkap.', en: 'Bu Rina, teacher. Cares about: fairness, and copied essays being caught.' }],
  [ROLE, { id: 'Pak Joko, orang tua. Peduli: privasi anaknya, dan info sekolah yang benar.', en: "Pak Joko, parent. Cares about: his child's privacy, and correct school information." }],
  [ROLE, { id: 'Sari, siswa. Peduli: diperlakukan adil, dan privasi.', en: 'Sari, student. Cares about: being treated fairly, and privacy.' }],
  [ROLE, { id: 'Pak Udin, satpam. Peduli: keamanan sekolah.', en: 'Pak Udin, guard. Cares about: school safety.' }],
  [PROPOSAL, { id: 'Kamera pengenal wajah untuk absen. Butuh foto wajah semua siswa.', en: "A face-scan camera for attendance. Needs every student's face on file." }],
  [PROPOSAL, { id: 'Detektor esai AI. Esai yang dicurigai langsung diberi nilai 0.', en: 'An AI essay detector. Flagged essays get 0 straight away.' }],
  [PROPOSAL, { id: 'Kata menjawab pertanyaan orang tua di meja info, tanpa dicek.', en: "Kata answers parents' questions at the info desk, unchecked." }],
  [PROPOSAL, { id: 'Kamera di gerbang. Rekaman disimpan selamanya dan bisa dilihat staf mana pun.', en: 'A camera at the gate. Recordings kept forever and open to any staff.' }],
  [EVENT, { id: 'Kamera tidak mengenali siswa yang memakai masker. Ia tercatat tidak hadir.', en: "The camera doesn't recognise a student wearing a mask. The student is marked absent." }],
  [EVENT, { id: 'Detektor menandai esai Bimo, yang menulis sangat formal. Esainya jujur.', en: 'The detector flags Bimo, who writes very formally. Bimo\'s essay is honest.' }],
  [EVENT, { id: 'Kata memberi tahu orang tua tanggal ujian yang belum diumumkan.', en: "Kata tells a parent an exam date that hasn't been announced." }],
]

export const GUIDE_S6: SessionGuide = {
  session: 's6',
  title: { id: 'Rapat OSIS', en: 'Student Council' },
  bigQuestion: {
    id: 'OSIS mau pasang kamera absen otomatis. Setuju?',
    en: 'The student council wants an automatic attendance camera. Do you agree?',
  },
  kelas: '9',
  kka: {
    elements: [
      { id: 'Literasi dan Etika KA', en: 'Literasi dan Etika KA (AI literacy and ethics)' },
      { id: 'Pemanfaatan dan Pengembangan KA', en: 'Pemanfaatan dan Pengembangan KA (using and developing AI)' },
    ],
    materi: [
      { id: 'Kelas IX: Keamanan Data; Analisis Artefak Hasil KA', en: 'Grade IX: Keamanan Data (data security); Analisis Artefak Hasil KA (analysing AI outputs)' },
      { id: 'CP: menjaga data pribadi', en: 'CP: protecting personal data' },
      { id: 'CP: menimbang dampak KA bagi berbagai pihak, termasuk kapan KA sebaiknya tidak dipakai', en: 'CP: weighing the effect of AI on different people, including when AI should not be used' },
    ],
  },
  goals: [
    { id: 'Menimbang dampak sebuah usulan AI bagi beberapa pihak dengan matriks etika.', en: 'Weigh the effect of an AI proposal on several people with an ethics matrix.' },
    { id: 'Menjelaskan false positive dan false negative, dan kenapa ambang yang lebih ketat tidak selalu lebih adil.', en: "Explain false positives and false negatives, and why a stricter threshold isn't always fairer." },
    { id: 'Merancang aturan pemakaian AI dengan manusia yang memeriksa, atau memutuskan tidak memakai AI.', en: 'Design rules for using AI with a person checking, or decide not to use AI.' },
  ],
  forParents: {
    id: 'Anak memimpin rapat OSIS yang membahas empat usulan: kamera absen, detektor esai AI, chatbot di meja info, dan kamera gerbang. Mereka melihat siapa yang terbantu dan siapa yang dirugikan, dan menemukan bahwa kadang rencana terbaik justru tidak memakai AI.',
    en: 'Your child chairs a student council meeting about four proposals: an attendance camera, an AI essay detector, a chatbot at the info desk, and a gate camera. They see who is helped and who is harmed, and find that sometimes the best plan uses no AI at all.',
  },
  terms: [
    { term: 'Data Privacy', def: { id: 'Hak menentukan siapa yang boleh menyimpan dan memakai data tentang dirimu.', en: 'The right to decide who may keep and use data about you.' } },
    { term: 'False Positive', def: { id: 'AI bilang "ya" padahal "tidak", misalnya menuduh esai jujur.', en: 'The AI says "yes" when the answer is "no", such as accusing an honest essay.' } },
    { term: 'False Negative', def: { id: 'AI bilang "tidak" padahal "ya", misalnya meloloskan esai salinan.', en: 'The AI says "no" when the answer is "yes", such as missing a copied essay.' } },
    { term: 'Human in the Loop', def: { id: 'Manusia memeriksa keputusan AI sebelum berdampak pada orang.', en: "A person checks the AI's decision before it affects anyone." } },
    { term: 'AI Ethics', def: { id: 'Menimbang siapa yang terbantu dan dirugikan sebelum memakai AI.', en: 'Weighing who is helped and who is harmed before using AI.' } },
  ],
  prep: {
    guru: [
      { id: 'Buka aastr.id/kotakata/main/s6 di setiap perangkat.', en: 'Open aastr.id/kotakata/main/s6 on every device.' },
      { id: 'Cetak kartu peran, usulan, dan kejadian (lampiran) untuk versi role-play.', en: 'Print the role, proposal and event cards (appendix) for the role-play version.' },
      { id: 'Sesi ini memakai ide dari Sesi 3 sampai 5. Siswa yang belum memainkannya tetap bisa mengikuti, karena setiap usulan dijelaskan di layar.', en: "This session uses ideas from Sessions 3 to 5. Students who haven't played them can still follow, because each proposal is explained on screen." },
      { id: 'Untuk diskusi detektor esai: alat pendeteksi teks AI banyak dilaporkan tidak andal dan cenderung menandai tulisan penutur non-asli. Lihat Liang dkk. (2023), "GPT detectors are biased against non-native English writers", Patterns 4(7).', en: 'For the essay detector discussion: AI-text detectors are widely reported to be unreliable and to flag non-native writers more often. See Liang et al. (2023), "GPT detectors are biased against non-native English writers", Patterns 4(7).' },
    ],
    ortu: [
      { id: 'Buka aastr.id/kotakata/main/s6. Tidak perlu daftar.', en: 'Open aastr.id/kotakata/main/s6. No sign-up needed.' },
      { id: 'Pikirkan satu aturan keluarga tentang HP atau kamera, untuk dibandingkan di akhir.', en: 'Think of one family rule about phones or cameras, to compare at the end.' },
    ],
  },
  warmup: {
    guru: [
      { id: 'Voting cepat: "Sekolah mau pasang kamera absen yang mengenali wajah. Setuju?" Hitung tangan dan catat alasan dari kedua pihak.', en: 'Quick vote: "The school wants an attendance camera that recognises faces. Agree?" Count hands and note reasons from both sides.' },
      { id: 'Catat sebagai asesmen awal: apakah siswa menyebut privasi, kesalahan alat, atau hanya kemudahan?', en: 'Note as the initial assessment: do students mention privacy, mistakes by the tool, or only convenience?' },
    ],
    ortu: {
      id: 'Tanyakan: "Kalau sekolah memasang kamera yang mengenali wajahmu, kamu setuju? Kenapa?"',
      en: 'Ask: "If school put in a camera that recognised your face, would you agree? Why?"',
    },
  },
  puzzles: [
    {
      title: { id: 'Tahap 1 · Kamera absen', en: 'Stage 1 · Attendance camera' },
      happens: { id: 'Kamera wajah paling menghemat waktu, tapi butuh wajah semua siswa dan salah mencatat siswa bermasker. Pak Joko dan Sari keberatan. Kartu QR diterima semua.', en: "The face camera saves the most time, but needs every student's face and wrongly marks students in masks as absent. Pak Joko and Sari object. The QR card is accepted by everyone." },
      stuck: { id: 'Siswa memilih "guru memanggil nama", lalu Raka keberatan karena terlalu lama.', en: 'Students pick "teacher calls names", then Raka objects that it takes too long.' },
      say: { id: '"Siapa yang keberatan, dan kenapa? Adakah cara yang cukup cepat tanpa menyimpan wajah?"', en: '"Who objects, and why? Is there a way that is fast enough without keeping faces?"' },
    },
    {
      title: { id: 'Tahap 2 · Detektor esai', en: 'Stage 2 · Essay detector' },
      happens: { id: 'Di ketegasan 5, semua salinan tertangkap tapi lima siswa jujur ikut mendapat nilai 0. Siswa menggeser ketegasan sampai seimbang di 8.', en: 'At strictness 5 every copy is caught, but five honest students get 0 too. Students move the strictness until it balances at 8.' },
      stuck: { id: 'Siswa memilih 9 supaya tidak ada yang dituduh, lalu hanya 1 salinan tertangkap.', en: 'Students pick 9 so nobody is accused, and then only 1 copy is caught.' },
      say: { id: '"Kalau dinaikkan, siapa yang untung dan siapa yang rugi? Kalau diturunkan?"', en: '"If you raise it, who gains and who loses? And if you lower it?"' },
    },
    {
      title: { id: 'Tahap 3 · Kelas lain, minggu lain', en: 'Stage 3 · Another class, another week' },
      happens: { id: 'Di kelas lain, tiga siswa jujur menulis formal dan detektor mencurigai mereka. Tidak ada angka ketegasan yang adil. Blok "guru bicara dulu dengan siswa" membuatnya adil.', en: 'In another class, three honest students write formally and the detector suspects them. No strictness number is fair. The "teacher talks to the student first" block makes it fair.' },
      stuck: { id: 'Siswa terus mencari angka yang tepat.', en: 'Students keep hunting for the right number.' },
      say: { id: '"Kalau mesin bisa salah, siapa yang sebaiknya memutuskan hukuman?"', en: '"If the machine can be wrong, who should decide on a punishment?"' },
    },
    {
      title: { id: 'Tahap 4 · Kata di meja info', en: 'Stage 4 · Kata at the info desk' },
      happens: { id: 'Kata dari Sesi 5 mengarang 8 jawaban untuk orang tua. Kalau semua jawaban dicek guru, guru kewalahan. "Kata bilang \'tanya guru\'" menyerahkan pertanyaan yang tidak ada di pengumuman saja.', en: 'Kata from Session 5 makes up 8 answers for parents. If a teacher checks every answer, the teachers are swamped. "Kata says \'ask a teacher\'" hands over only the questions no notice answers.' },
      stuck: { id: 'Siswa memilih "semua dicek guru", lalu Raka keberatan.', en: 'Students pick "all checked by a teacher", then Raka objects.' },
      say: { id: '"Pertanyaan mana yang aman dijawab Kata sendiri? Mana yang butuh manusia?"', en: '"Which questions is it safe for Kata to answer alone? Which need a person?"' },
    },
    {
      title: { id: 'Tahap 5 · Kamera gerbang', en: 'Stage 5 · Gate camera' },
      happens: { id: 'Kamera gerbang bisa diterima kalau tidak mengenali wajah, rekamannya disimpan 7 hari, dan hanya dilihat kalau ada kejadian. Alatnya mirip tahap 1, tapi tujuan dan batasnya berbeda.', en: "A gate camera can be accepted if it doesn't recognise faces, keeps recordings for 7 days, and is only watched after an incident. The tool is like stage 1's, but its purpose and limits differ." },
      stuck: { id: 'Siswa mengira semua kamera pasti ditolak setelah tahap 1.', en: 'Students assume every camera will be turned down after stage 1.' },
      say: { id: '"Apa bedanya kamera ini dengan kamera absen? Data apa yang benar-benar dibutuhkan?"', en: '"How is this camera different from the attendance camera? What data is really needed?"' },
    },
    {
      title: { id: 'Bonus · Rapat besar', en: 'Bonus · The big meeting' },
      happens: { id: 'Keempat usulan dijalankan bersamaan dengan satu paket keputusan. Tidak boleh ada yang keberatan.', en: 'All four proposals run together with one set of decisions. Nobody may object.' },
      stuck: { id: 'Siswa lupa satu keputusan dari tahap sebelumnya.', en: 'Students forget one decision from an earlier stage.' },
      say: { id: '"Baca matriksnya baris demi baris. Siapa yang masih belum tersenyum?"', en: '"Read the matrix row by row. Who still isn\'t smiling?"' },
    },
  ],
  debrief: {
    guru: [
      { q: { id: 'Kenapa rencana absen terbaik tidak memakai AI?', en: "Why didn't the best attendance plan use AI?" }, a: { id: 'Kartu QR cukup cepat tanpa menyimpan wajah dan tanpa salah mengenali. AI bukan selalu jawaban.', en: "A QR card is fast enough without keeping faces or misrecognising anyone. AI isn't always the answer." } },
      { q: { id: 'Mana yang lebih buruk: menuduh siswa jujur, atau meloloskan salinan?', en: 'Which is worse: accusing an honest student, or missing a copy?' }, a: { id: 'Tidak ada jawaban tunggal. Itulah sebabnya keputusan ambang perlu dibahas bersama, dan manusia perlu memeriksa.', en: 'There is no single answer. That is why the threshold needs discussing together, and a person needs to check.' } },
      { q: { id: 'Kapan AI sebaiknya menyerahkan keputusan ke manusia?', en: 'When should AI hand a decision to a person?' }, a: { id: 'Saat ia tidak yakin, dan saat keputusannya berdampak besar pada seseorang.', en: 'When it is unsure, and when the decision has a big effect on someone.' } },
      { q: { id: 'AI dan pekerjaan: siapa yang pekerjaannya berubah karena usulan-usulan ini?', en: 'AI and jobs: whose work changes because of these proposals?' }, a: { id: 'Guru, satpam, dan staf tata usaha. Sebagian tugas hilang, sebagian baru muncul, seperti memeriksa kasus sulit.', en: 'Teachers, guards and office staff. Some tasks go, and new ones appear, such as checking hard cases.' } },
    ],
    ortu: [
      { id: 'Kalau sebuah aplikasi bisa salah menuduh, siapa yang sebaiknya memutuskan?', en: 'If an app can wrongly accuse someone, who should decide?' },
      { id: 'Data apa tentang keluarga kita yang tidak ingin kita berikan ke sekolah atau aplikasi?', en: "What data about our family wouldn't we want to give a school or an app?" },
      { id: 'Kapan lebih baik tidak memakai AI sama sekali?', en: 'When is it better not to use AI at all?' },
    ],
  },
  exitTicket: [
    { q: { id: 'Detektor menandai esai jujur sebagai buatan AI. Itu false positive atau false negative?', en: 'A detector flags an honest essay as AI-written. Is that a false positive or a false negative?' }, a: { id: 'False positive.', en: 'False positive.' } },
    { q: { id: 'Sebutkan satu cara supaya siswa tidak dihukum karena kesalahan AI.', en: 'Name one way to make sure a student is not punished for an AI mistake.' }, a: { id: 'Guru bicara dulu dengan siswa sebelum memberi nilai (human in the loop).', en: 'The teacher talks to the student before giving a mark (human in the loop).' } },
    { q: { id: 'Sebutkan satu masalah yang lebih baik diselesaikan tanpa AI. Kenapa?', en: 'Name one problem better solved without AI. Why?' }, a: { id: 'Contoh: absen dengan kartu QR, karena tidak perlu menyimpan wajah siapa pun.', en: "For example: attendance with a QR card, because nobody's face has to be kept." } },
  ],
  misconceptions: [
    { belief: { id: '"Pakai AI selalu lebih modern, jadi lebih baik."', en: '"Using AI is more modern, so it\'s better."' }, reply: { id: 'Tahap 1: rencana yang diterima semua tidak memakai AI.', en: 'Stage 1: the plan everyone accepted used no AI.' } },
    { belief: { id: '"Detektor AI yang ketat pasti adil."', en: '"A strict AI detector is fair."' }, reply: { id: 'Tahap 2 dan 3: makin ketat, makin banyak siswa jujur dituduh.', en: 'Stages 2 and 3: the stricter it is, the more honest students are accused.' } },
    { belief: { id: '"Kalau ada manusia yang memeriksa, AI tidak ada gunanya."', en: '"If a person checks, the AI is pointless."' }, reply: { id: 'Tahap 4: Kata tetap menjawab 30 pertanyaan sendiri. Guru hanya memeriksa yang sulit.', en: 'Stage 4: Kata still answers 30 questions alone. Teachers only take the hard ones.' } },
  ],
  extension: {
    guru: [
      { id: 'Proyek (2 JP): siswa menulis "Aturan Pemakaian AI di Sekolah Kita" berisi 5 aturan, masing-masing dengan alasan dari matriks etika.', en: 'Project (2 lessons): students write "Rules for Using AI at Our School" with 5 rules, each with a reason from the ethics matrix.' },
      { id: 'Lanjutan: bandingkan dengan aturan sungguhan, misalnya UU Pelindungan Data Pribadi No. 27 Tahun 2022.', en: "Follow-up: compare with real rules, such as Indonesia's Personal Data Protection Law (UU No. 27 Tahun 2022)." },
    ],
    ortu: {
      id: 'Buat bersama satu "aturan AI keluarga", misalnya kapan boleh memakai chatbot untuk tugas, dan siapa yang mengecek hasilnya.',
      en: 'Make one "family AI rule" together, such as when a chatbot may be used for homework, and who checks the result.',
    },
  },
  unplugged: {
    guru: [
      { id: 'Bagi kelas menjadi kelompok 5. Setiap siswa mendapat satu kartu peran.', en: 'Split the class into groups of 5. Each student gets one role card.' },
      { id: 'Bacakan satu kartu usulan. Setiap peran menyatakan setuju, ragu, atau keberatan, dengan alasan dari kartunya.', en: 'Read out one proposal card. Each role says agree, unsure or object, with a reason from their card.' },
      { id: 'Bacakan satu kartu kejadian. Apakah ada yang berubah pikiran? Kelompok mengubah usulannya sampai tidak ada yang keberatan.', en: 'Read out one event card. Does anyone change their mind? The group changes the proposal until nobody objects.' },
      { id: 'Tulis hasilnya di matriks etika di papan: peran di baris, nilai (waktu, privasi, keadilan, kepercayaan, keamanan) di kolom.', en: 'Record the result on an ethics matrix on the board: roles in rows, values (time, privacy, fairness, trust, safety) in columns.' },
    ],
    ortu: [
      { id: 'Setiap anggota keluarga memilih satu kartu peran. Bacakan usulan kamera gerbang.', en: 'Each family member picks a role card. Read out the gate camera proposal.' },
      { id: 'Bahas bersama: aturan apa yang membuat semua peran bisa setuju?', en: 'Talk it through: what rules would let every role agree?' },
    ],
  },
  cardSets: [
    {
      title: { id: 'Kartu peran, usulan, dan kejadian', en: 'Role, proposal and event cards' },
      showLabel: true,
      cards: (lang): Card[] => CARDS.map(([kind, text]) => ({ text: text[lang], label: kind[lang] })),
    },
  ],
  mapping: [
    { framework: 'KKA Fase D', covers: { id: 'Literasi dan Etika KA (menjaga data pribadi, dampak KA, kapan tidak memakai KA); Pemanfaatan dan Pengembangan KA (analisis keluaran KA). Materi kelas IX.', en: 'Literasi dan Etika KA (protecting personal data, the effects of AI, when not to use AI); Pemanfaatan dan Pengembangan KA (analysing AI output). Grade IX material.' } },
    { framework: 'AI4K12 (grade 6–8)', covers: { id: '5-A-iii (matriks etika untuk para pihak), 5-B-i (dampak AI pada masyarakat), 5-C (AI dan pekerjaan).', en: '5-A-iii (an ethics matrix for stakeholders), 5-B-i (the effect of AI on society), 5-C (AI and jobs).' } },
    { framework: 'UNESCO (2024)', covers: { id: 'CG4.1.4.1 (kapan AI sebaiknya tidak dipakai), CG4.1.1.1 (AI dipimpin manusia), CG4.2.1.2 (privasi data).', en: 'CG4.1.4.1 (when AI should not be used), CG4.1.1.1 (AI is human-led), CG4.2.1.2 (data privacy).' } },
  ],
}
