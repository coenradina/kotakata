// What a certificate says. Kept apart from drawing so the page preview,
// the PNG and the tests all use the same words.

import { t, type Lang } from '../i18n'
import type { Session } from '../levels/types'

export const MAX_NAME = 40

/** Trims, collapses spaces and caps the length. The name never leaves the device. */
export function cleanName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME)
}

export interface CertificateText {
  title: string
  given: string
  name: string
  forLine: string
  what: string
  topic: string
  learnedLabel: string
  learned: string
  date: string
  site: string
}

export function certificateText(level: Session, index: number, lang: Lang, name: string, date: Date): CertificateText {
  return {
    title: t(lang, 'certTitle'),
    given: t(lang, 'certGiven'),
    name: cleanName(name) || '…',
    forLine: t(lang, 'certFor'),
    what: `${t(lang, 'levelN', { n: index + 1 })} · ${level.title[lang]}`,
    topic: level.topic[lang],
    learnedLabel: t(lang, 'certLearned'),
    learned: level.cards.map((c) => c.term).join(' · '),
    date: date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    site: 'aastr.id/kotakata',
  }
}
