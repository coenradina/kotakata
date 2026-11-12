// The parts every guide shares: the timing, the rubric and the privacy
// note. Session-specific content lives in s1.ts, s3.ts and s5.ts.

import type { L } from './types'

/** The session timeline (docs/plan/02-sessions.md, section 1), for 60 minutes and for 2 JP. */
export const TIMELINE: { block: L; hoc: string; jp: string }[] = [
  { block: { id: 'Pemanasan unplugged (asesmen awal)', en: 'Unplugged warm-up (initial assessment)' }, hoc: '5', jp: '10' },
  { block: { id: 'Pertanyaan besar', en: 'The big question' }, hoc: '2', jp: '2' },
  { block: { id: 'Bermain: 5 tahap dan bonus', en: 'Play: 5 stages and a bonus' }, hoc: '40', jp: '40' },
  { block: { id: 'Diskusi kelas', en: 'Class discussion' }, hoc: '10', jp: '15' },
  { block: { id: 'Exit ticket (asesmen akhir)', en: 'Exit ticket (final assessment)' }, hoc: '3', jp: '5' },
  { block: { id: 'Perluasan: poster atau infografis (Literasi Digital)', en: 'Extension: poster or infographic (Literasi Digital)' }, hoc: '–', jp: '8' },
]

/** The rubric for the poster or infographic extension. */
export const RUBRIC: { criterion: L; levels: [L, L, L] }[] = [
  {
    criterion: { id: 'Menjelaskan cara kerja AI', en: 'Explains how the AI works' },
    levels: [
      { id: 'Menyebut istilah tanpa penjelasan', en: 'Names terms without explaining them' },
      { id: 'Menjelaskan satu langkah dengan benar', en: 'Explains one step correctly' },
      { id: 'Menjelaskan urutan langkah dengan benar', en: 'Explains the steps in order, correctly' },
    ],
  },
  {
    criterion: { id: 'Memakai contoh dari permainan', en: 'Uses an example from the game' },
    levels: [
      { id: 'Belum ada contoh', en: 'No example yet' },
      { id: 'Ada contoh, tapi tidak dihubungkan', en: 'Has an example, not connected' },
      { id: 'Contoh dihubungkan dengan istilahnya', en: 'The example is tied to the term' },
    ],
  },
  {
    criterion: { id: 'Menghubungkan dengan kehidupan sehari-hari', en: 'Connects to everyday life' },
    levels: [
      { id: 'Belum ada', en: 'Not yet' },
      { id: 'Menyebut satu aplikasi', en: 'Names one app' },
      { id: 'Menjelaskan dampaknya bagi orang', en: 'Explains what it means for people' },
    ],
  },
]
export const RUBRIC_LEVELS: [L, L, L] = [
  { id: 'Mulai berkembang', en: 'Starting' },
  { id: 'Berkembang', en: 'Developing' },
  { id: 'Cakap', en: 'Secure' },
]

/** Prompts for the self-reflection journal ("asesmen as learning"). */
export const REFLECTION: L[] = [
  { id: 'Apa satu hal yang membuatmu terkejut hari ini?', en: 'What is one thing that surprised you today?' },
  { id: 'Tebakan mana yang salah, dan kenapa?', en: 'Which of your guesses was wrong, and why?' },
  { id: 'Di mana kamu akan melihat ide ini di luar sekolah?', en: 'Where will you see this idea outside school?' },
]

export const PRIVACY: { guru: L[]; ortu: L[] } = {
  guru: [
    { id: 'Siswa bermain tanpa akun. Progres hanya tersimpan di perangkat yang dipakai.', en: 'Students play without accounts. Progress is saved only on the device they use.' },
    { id: 'Semua chat, nama, dan pengumuman di permainan adalah fiksi. Jangan minta siswa mengetik atau mengunggah chat, foto, atau data asli mereka.', en: "All chats, names and notices in the game are fictional. Don't ask students to type or upload their real chats, photos or data." },
    { id: 'Nama di sertifikat hanya dipakai di perangkat dan tidak dikirim ke mana pun.', en: "The name on a certificate is only used on the device and isn't sent anywhere." },
    { id: 'Di awal sesi pertama, siswa ditanya apakah cara bermainnya boleh disimpan tanpa nama. Tidak ada jawaban yang dipilihkan. Rinciannya di halaman Privasi (/privasi).', en: 'At the start of the first session, students are asked whether their play may be saved without their name. Neither answer is preselected. The details are on the Privacy page (/privasi).' },
  ],
  ortu: [
    { id: 'Tidak perlu daftar. Progres anak hanya tersimpan di perangkat ini.', en: "No sign-up. Your child's progress is saved only on this device." },
    { id: 'Semua chat dan nama di permainan adalah fiksi. Anak tidak diminta memasukkan data pribadi.', en: 'All chats and names in the game are fictional. Your child is never asked for personal data.' },
    { id: 'Di awal sesi pertama, anak ditanya apakah cara bermainnya boleh disimpan tanpa nama. Pilihan ini bisa diubah di halaman Privasi (/privasi).', en: 'At the start of the first session, your child is asked whether their play may be saved without their name. The choice can be changed on the Privacy page (/privasi).' },
  ],
}
