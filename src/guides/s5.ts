import { BOARD } from '../levels/board/model'
import type { SessionGuide } from './types'

export const GUIDE_S5: SessionGuide = {
  session: 's5',
  title: { id: 'Kata demi Kata', en: 'Word by Word' },
  bigQuestion: {
    id: 'Kata bilang ulangan IPA hari Senin. Padahal belum diumumkan. Kok bisa?',
    en: "Kata says the science test is on Monday. It hasn't been announced. How?",
  },
  kelas: '7',
  kka: {
    elements: [
      { id: 'Literasi dan Etika KA', en: 'Literasi dan Etika KA (AI literacy and ethics)' },
      { id: 'Pemanfaatan dan Pengembangan KA', en: 'Pemanfaatan dan Pengembangan KA (using and developing AI)' },
    ],
    materi: [
      { id: 'Kelas VII: Konsep dan Cara Kerja KA Generatif; Risiko KA Generatif', en: 'Grade VII: Konsep dan Cara Kerja KA Generatif (how generative AI works); Risiko KA Generatif (its risks)' },
      { id: 'Kelas VII: Menuliskan Input Bermakna', en: 'Grade VII: Menuliskan Input Bermakna (writing meaningful input)' },
      { id: 'CP: KA bisa menghasilkan output yang salah atau berhalusinasi; KA adalah alat bantu', en: 'CP: AI can produce wrong output or hallucinate; AI is a tool' },
    ],
  },
  goals: [
    { id: 'Menjelaskan bahwa AI generatif menulis dengan menebak kata berikutnya dari pola di data latihnya.', en: 'Explain that generative AI writes by guessing the next word from patterns in its training data.' },
    { id: 'Menjelaskan apa itu halusinasi dan kenapa AI tetap terdengar yakin saat salah.', en: 'Explain what a hallucination is and why an AI sounds sure even when it is wrong.' },
    { id: 'Menulis pertanyaan yang jelas dan memeriksa jawaban AI ke sumbernya.', en: "Write clear questions, and check an AI's answers against the source." },
  ],
  forParents: {
    id: 'Robot Kata menjadi chatbot info kelas yang belajar dari papan pengumuman. Anak melihat Kata menulis kata demi kata dari tebakan yang paling mungkin, lalu memergoki Kata menjawab dengan yakin jadwal yang tidak pernah diumumkan. Anak belajar bertanya dengan jelas dan mengecek jawabannya.',
    en: "The robot Kata becomes a class info chatbot that learned from the notice board. Your child watches Kata write word by word from its most likely guess, then catches Kata confidently giving a date that was never announced. They learn to ask clearly and check the answer.",
  },
  terms: [
    { term: 'Generative AI', def: { id: 'AI yang membuat teks, gambar, atau suara baru. Chatbot menebak kata berikutnya, satu per satu.', en: 'AI that makes new text, images or sound. A chatbot guesses the next word, one at a time.' } },
    { term: 'Hallucination', def: { id: 'AI menjawab dengan yakin, tapi jawabannya salah atau dikarang.', en: 'An AI answers confidently, but the answer is wrong or made up.' } },
    { term: 'Prompt', def: { id: 'Pertanyaan atau perintah yang kamu tulis ke AI.', en: 'The question or instruction you give an AI.' } },
    { term: 'AI as a Tool', def: { id: 'AI membantu, tapi manusia yang memutuskan dan mengecek.', en: 'AI helps, but people decide and check.' } },
  ],
  prep: {
    guru: [
      { id: 'Buka aastr.id/kotakata/main/s5 di setiap perangkat.', en: 'Open aastr.id/kotakata/main/s5 on every device.' },
      { id: 'Cetak kartu papan pengumuman dan lembar tally pasangan kata (lampiran).', en: 'Print the notice board cards and the word-pair tally sheet (appendix).' },
      { id: 'Siapkan satu dadu per kelompok untuk versi unplugged.', en: 'Have one die per group for the unplugged version.' },
    ],
    ortu: [
      { id: 'Buka aastr.id/kotakata/main/s5. Tidak perlu daftar.', en: 'Open aastr.id/kotakata/main/s5. No sign-up needed.' },
      { id: 'Kalau keluarga memakai chatbot (misalnya untuk tugas), sesi ini bagus untuk dibahas bersama.', en: 'If your family uses chatbots (for homework, say), this session is a good one to talk through together.' },
    ],
  },
  warmup: {
    guru: [
      { id: 'Tulis di papan: "Besok kita ulangan ..." dan minta siswa menebak kata berikutnya.', en: 'Write on the board: "Tomorrow we have a ... test" and ask students to guess the missing word.' },
      { id: 'Tanyakan: "Kenapa tebakan kalian mirip-mirip?" Catat jawaban sebagai asesmen awal: apakah siswa sudah tahu chatbot menebak dari pola?', en: 'Ask: "Why are your guesses so alike?" Note the answers as the initial assessment: do students already know chatbots guess from patterns?' },
    ],
    ortu: {
      id: 'Tanyakan: "Pernah lihat HP menebak kata berikutnya saat mengetik? Menurutmu, dari mana HP tahu?"',
      en: 'Ask: "Have you seen a phone guess your next word as you type? How do you think it knows?"',
    },
  },
  puzzles: [
    {
      title: { id: 'Tahap 1 · Kata berikutnya', en: 'Stage 1 · The next word' },
      happens: { id: 'Kata menulis "jumat" setelah "kelas libur hari". Bar menunjukkan peluang tiap kata.', en: 'Kata writes "friday" after "no class on". The bars show the chance of each word.' },
      stuck: { id: 'Jarang tersangkut. Ajak siswa membaca bar sebelum lanjut.', en: 'Rarely a problem. Ask students to read the bars before moving on.' },
      say: { id: '"Kenapa bar ini paling panjang? Cari kalimatnya di papan."', en: '"Why is this bar the longest? Find the sentence on the board."' },
    },
    {
      title: { id: 'Tahap 2 · Temperature', en: 'Stage 2 · Temperature' },
      happens: { id: 'Di temperature 0 hasilnya selalu sama. Di temperature 1 Kata kadang memilih kata yang lebih jarang.', en: 'At temperature 0 the result is always the same. At temperature 1 Kata sometimes picks a rarer word.' },
      stuck: { id: 'Hasilnya kebetulan sama dan siswa mengira temperature tidak berpengaruh.', en: "It happens to come out the same and students think temperature doesn't matter." },
      say: { id: '"Jalankan lagi. Apa yang berubah dari bar-nya?"', en: '"Run it again. What changes in the bars?"' },
    },
    {
      title: { id: 'Tahap 3 · Ingatan', en: 'Stage 3 · Memory' },
      happens: { id: 'Dengan ingatan 1 kata, Kata berputar-putar. Dengan 3 kata, Kata menulis ulang papan dengan benar.', en: 'With a one-word memory Kata goes in circles. With three words it writes the board back correctly.' },
      stuck: { id: 'Siswa menambah jumlah kata, padahal yang perlu diubah ingatannya.', en: 'Students write more words, when it is the memory that needs changing.' },
      say: { id: '"Kalau kamu cuma ingat satu kata terakhir, bisakah kamu menulis kalimat panjang?"', en: '"If you only remembered the last word, could you write a long sentence?"' },
    },
    {
      title: { id: 'Tahap 4 · Senin?', en: 'Stage 4 · Monday?' },
      happens: { id: 'Kata menjawab "senin" untuk ulangan IPA dengan peluang 100%. Papan bilang jadwalnya menyusul. "Cek di papan" memergokinya.', en: 'Kata answers "monday" for the science test with 100% confidence. The board says the date is still to follow. "Check the notice board" catches it.' },
      stuck: { id: 'Siswa percaya jawaban Kata karena peluangnya 100%.', en: 'Students trust the answer because it shows 100%.' },
      say: { id: '"100% artinya Kata yakin. Apakah yakin sama dengan benar?"', en: '"100% means Kata is sure. Is sure the same as right?"' },
    },
    {
      title: { id: 'Tahap 5 · Bertanya dengan jelas', en: 'Stage 5 · Ask clearly' },
      happens: { id: 'Tiga pertanyaan singkat dijawab untuk hal lain. Pertanyaan yang lebih spesifik dijawab dengan benar.', en: 'Three short questions get answers about something else. More specific questions get the right answers.' },
      stuck: { id: 'Cek menunjukkan "ada di papan", padahal jawabannya untuk pertanyaan lain.', en: 'The check says "on the board", but the answer is for a different question.' },
      say: { id: '"Jawabannya memang ada di papan. Tapi apakah itu yang ditanyakan Dinda?"', en: '"The answer is on the board. But is it what Dinda asked?"' },
    },
    {
      title: { id: 'Bonus · Pengumuman baru', en: 'Bonus · A new notice' },
      happens: { id: 'Jadwal IPA baru ditempel. Kata tetap menjawab jadwal lama sampai ia membaca ulang papan.', en: 'The science test date goes up. Kata keeps its old answer until it reads the board again.' },
      stuck: { id: 'Siswa menaruh "baca ulang" setelah pertanyaan.', en: 'Students put "read again" after the question.' },
      say: { id: '"Kapan Kata belajar hal baru: saat ditanya, atau saat membaca?"', en: '"When does Kata learn something new: when asked, or when it reads?"' },
    },
  ],
  debrief: {
    guru: [
      { q: { id: 'Kenapa Kata yakin padahal salah?', en: 'Why was Kata sure when it was wrong?' }, a: { id: 'Ia memilih kata yang paling mungkin, bukan yang benar. Ia tidak tahu bedanya.', en: "It picks the most likely word, not the true one. It can't tell the difference." } },
      { q: { id: 'Kapan kamu harus mengecek jawaban chatbot?', en: "When should you check a chatbot's answer?" }, a: { id: 'Untuk fakta, tanggal, angka, dan hal yang penting.', en: 'For facts, dates, numbers and anything that matters.' } },
      { q: { id: 'Chatbot sungguhan belajar dari miliaran kalimat. Apakah itu berarti ia tidak pernah berhalusinasi?', en: 'Real chatbots learn from billions of sentences. Does that mean they never hallucinate?' }, a: { id: 'Tidak. Halusinasi tetap terjadi, hanya lebih sulit dikenali.', en: 'No. They still do, it is just harder to spot.' } },
      { q: { id: 'Apakah aman menulis data pribadimu ke chatbot?', en: 'Is it safe to type your personal data into a chatbot?' }, a: { id: 'Sebaiknya tidak. Data yang kamu tulis bisa disimpan. Ini sesuai CP KKA soal menjaga data pribadi.', en: 'Better not. What you type may be stored. This matches the KKA CP on protecting personal data.' } },
    ],
    ortu: [
      { id: 'Kapan kita perlu mengecek jawaban chatbot sebelum percaya?', en: "When do we need to check a chatbot's answer before trusting it?" },
      { id: 'Apa bedanya pertanyaan "kapan ulangan?" dan "kapan ulangan matematika kelas 8B?"', en: 'What is the difference between "when is the test?" and "when is class 8B\'s maths test?"' },
      { id: 'Data apa yang sebaiknya tidak kita tulis ke chatbot?', en: 'What information should we not type into a chatbot?' },
    ],
  },
  exitTicket: [
    { q: { id: 'Chatbot bilang tugasmu dikumpulkan besok. Apa yang kamu lakukan?', en: 'A chatbot says your assignment is due tomorrow. What do you do?' }, a: { id: 'Cek ke sumbernya, misalnya guru atau pengumuman.', en: 'Check the source, such as the teacher or the announcement.' } },
    { q: { id: 'Mana yang lebih jelas: "kapan ulangan?" atau "kapan ulangan matematika kelas 8B menurut pengumuman?"', en: 'Which is clearer: "when is the test?" or "when is class 8B\'s maths test, according to the announcement?"' }, a: { id: 'Yang kedua.', en: 'The second.' } },
    { q: { id: 'Papan pengumuman diperbarui hari ini. Apakah Kata langsung tahu?', en: 'The board was updated today. Does Kata know straight away?' }, a: { id: 'Tidak, sampai ia membaca atau dilatih ulang.', en: 'No, not until it reads it or is trained again.' } },
  ],
  misconceptions: [
    { belief: { id: '"Chatbot mencari jawabannya di internet."', en: '"A chatbot looks the answer up on the internet."' }, reply: { id: 'Kata tidak mencari apa-apa. Ia menebak kata berikutnya dari yang pernah ia baca. Sebagian chatbot sungguhan bisa mencari, tapi tetap bisa salah membaca.', en: 'Kata looks nothing up. It guesses the next word from what it has read. Some real chatbots can search, but they can still misread.' } },
    { belief: { id: '"Kalau AI yakin, berarti benar."', en: '"If the AI is sure, it\'s right."' }, reply: { id: 'Tahap 4: peluang 100% untuk jawaban yang tidak pernah diumumkan.', en: 'Stage 4: 100% for an answer that was never announced.' } },
    { belief: { id: '"AI tahu semua hal terbaru."', en: '"AI knows the latest everything."' }, reply: { id: 'Bonus: Kata baru tahu pengumuman baru setelah membaca ulang papan.', en: 'The bonus: Kata only knew the new notice after reading the board again.' } },
  ],
  extension: {
    guru: [
      { id: 'Literasi Digital (8 menit): poster "Sebelum percaya chatbot": 3 langkah cek fakta.', en: 'Digital literacy (8 minutes): a poster, "Before you trust a chatbot": 3 fact-checking steps.' },
      { id: 'Lanjutan: aktivitas "Detektif Halusinasi" di Buku Siswa KKA kelas VII, Bab 3.', en: 'Follow-up: the "Detektif Halusinasi" (hallucination detective) activity in the KKA grade VII student book, chapter 3.' },
    ],
    ortu: {
      id: 'Kebiasaan "AI di rumah": setiap kali chatbot memberi tanggal atau angka, cek bersama ke sumbernya.',
      en: 'An "AI at home" habit: whenever a chatbot gives a date or a number, check the source together.',
    },
  },
  unplugged: {
    guru: [
      { id: 'Kelompok membuat lembar tally pasangan kata dari kartu papan: setiap kata, kata apa yang muncul sesudahnya, dan berapa kali.', en: 'Groups build a word-pair tally from the board cards: for each word, which word came after it, and how often.' },
      { id: 'Satu siswa menjadi Kata. Ia mulai dari kata pertanyaan dan memilih kata berikutnya yang paling sering (temperature 0), atau melempar dadu di antara pilihan (temperature 1).', en: 'One student plays Kata. They start from the question word and pick the most common next word (temperature 0), or roll a die between the options (temperature 1).' },
      { id: 'Teman sekelas bertanya. Kelas mengecek setiap jawaban "Kata" ke kartu papan.', en: 'Classmates ask questions. The class checks each of "Kata\'s" answers against the board cards.' },
      { id: 'Tanyakan soal ulangan IPA. Apa jawaban "Kata"? Apakah ada di papan?', en: 'Ask about the science test. What does "Kata" answer? Is it on the board?' },
    ],
    ortu: [
      { id: 'Tulis 5 kalimat pengumuman keluarga, misalnya jadwal les atau piket rumah.', en: 'Write 5 family notices, such as lesson times or chores.' },
      { id: 'Anak menjadi Kata dan menjawab pertanyaan Ayah/Bunda dengan menebak kata berikutnya. Cek bersama: apakah jawabannya ada di kalimat yang ditulis?', en: "Your child plays Kata and answers your questions by guessing the next word. Check together: is the answer in what you wrote?" },
    ],
  },
  cardSets: [
    {
      title: { id: 'Kartu papan pengumuman', en: 'Notice board cards' },
      showLabel: false,
      cards: (lang) => BOARD[lang].map((s) => ({ text: s.replace(/ \.$/, '.') })),
    },
  ],
  mapping: [
    { framework: 'KKA Fase D', covers: { id: 'Literasi dan Etika KA (halusinasi, KA sebagai alat bantu); Pemanfaatan dan Pengembangan KA (input bermakna). Materi kelas VII.', en: 'Literasi dan Etika KA (hallucination, AI as a tool); Pemanfaatan dan Pengembangan KA (meaningful input). Grade VII material.' } },
    { framework: 'AI4K12 (grade 6–8)', covers: { id: '4-A-iv (tugas NLP dan cara kerjanya), 3-A-iv (melatih vs memakai model).', en: '4-A-iv (NLP tasks and how they work), 3-A-iv (training vs using a model).' } },
    { framework: 'UNESCO (2024)', covers: { id: 'CG4.2.2.2 (misinformasi dan konten sintetis), CG4.1.1.1 (AI dipimpin manusia).', en: 'CG4.2.2.2 (misinformation and synthetic content), CG4.1.1.1 (AI is human-led).' } },
  ],
}
