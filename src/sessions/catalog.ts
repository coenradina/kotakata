// The sessions from docs/plan/02-sessions.md, as the landing page and the
// school map show them. A session is playable once it has an entry in
// LEVELS; until then it's listed here as coming soon.

import type { Lang } from '../i18n'

export type PlannedId = 's1' | 's2' | 's3' | 's4' | 's5' | 's6'

export interface PlannedSession {
  id: PlannedId
  /** The number shown on the map and the cards. */
  n: number
  icon: string
  title: Record<Lang, string>
  bigQuestion: Record<Lang, string>
  /** KKA Fase D grades it fits best (docs/plan/01-learning-path.md, section 6). */
  kelas: (7 | 8 | 9)[]
  minutes: 60
  /** In the first release (sessions 1, 3 and 5) or later. */
  firstRelease: boolean
}

export const PLANNED: PlannedSession[] = [
  {
    id: 's1',
    n: 1,
    icon: '💬',
    title: { id: 'Aturan atau Contoh?', en: 'Rules or Examples?' },
    bigQuestion: {
      id: 'Bisa nggak kamu nulis aturan buat semua chat kelas?',
      en: 'Could you write rules for every message in the class chat?',
    },
    kelas: [7, 8],
    minutes: 60,
    firstRelease: true,
  },
  {
    id: 's2',
    n: 2,
    icon: '📷',
    title: { id: 'Filter Kamera', en: 'Camera Filter' },
    bigQuestion: {
      id: 'Gimana filter kamera tahu di mana matamu?',
      en: 'How does a camera filter know where your eyes are?',
    },
    kelas: [8],
    minutes: 60,
    firstRelease: false,
  },
  {
    id: 's3',
    n: 3,
    icon: '⚖️',
    title: { id: 'Data yang Adil', en: 'Fair Data' },
    bigQuestion: {
      id: 'Kenapa Kata jadi kacau di kelas sepupuku?',
      en: "Why does Kata get it so wrong in my cousin's class?",
    },
    kelas: [8, 9],
    minutes: 60,
    firstRelease: true,
  },
  {
    id: 's4',
    n: 4,
    icon: '🌳',
    title: { id: 'Ekskul Apa?', en: 'Which Club?' },
    bigQuestion: {
      id: 'Kenapa aku disarankan masuk paduan suara? Aku kan mau basket.',
      en: 'Why was I told to join the choir? I wanted basketball.',
    },
    kelas: [8],
    minutes: 60,
    firstRelease: false,
  },
  {
    id: 's5',
    n: 5,
    icon: '📌',
    title: { id: 'Kata demi Kata', en: 'Word by Word' },
    bigQuestion: {
      id: 'Kata bilang ulangan IPA hari Senin. Padahal belum diumumkan. Kok bisa?',
      en: "Kata says the science test is on Monday. It hasn't been announced. How?",
    },
    kelas: [7],
    minutes: 60,
    firstRelease: true,
  },
  {
    id: 's6',
    n: 6,
    icon: '🗳️',
    title: { id: 'Rapat OSIS', en: 'Student Council' },
    bigQuestion: {
      id: 'OSIS mau pasang kamera absen otomatis. Kamu setuju?',
      en: 'The student council wants an automatic attendance camera. Do you agree?',
    },
    kelas: [8, 9],
    minutes: 60,
    firstRelease: false,
  },
]
