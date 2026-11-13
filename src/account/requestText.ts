// Small helpers the class request pages share: how a session and a day are
// written, and the note that a request was just sent.

import { t, type Lang } from '../i18n'
import { ALL, numberOf } from '../levels'

/** "S1 · title", or "Klasik 3 · title" for a classic level. */
export function sessionLabel(lang: Lang, id: string): string {
  const s = ALL.find((l) => l.id === id)
  const title = s?.title[lang] ?? id
  return /^s\d$/.test(id) ? `${id.toUpperCase()} · ${title}` : `${t(lang, 'crClassic', { n: numberOf(id) })} · ${title}`
}

/** A YYYY-MM-DD day as "20 Nov 2026". */
export const dayLabel = (lang: Lang, day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/** Set after a request is sent, so /guru can say so once. */
export const justSent = { value: false }
