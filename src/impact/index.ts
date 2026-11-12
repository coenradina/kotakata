// The one impact client the app uses, wired to this browser: localStorage,
// the `ingestImpact` function, and timers that flush the queue.

import { layoutFor } from '../layout/useLayout'
import { createImpact, type Send } from './client'
import type { Batch } from './schema'

/** `ingestImpact` in functions/src/index.ts. */
export const INGEST_URL = 'https://asia-southeast2-kotakata-prod.cloudfunctions.net/ingestImpact'
const FLUSH_EVERY = 60_000

declare const __APP_VERSION__: string

const browser = typeof window !== 'undefined'
/** Only the real site sends: local and preview builds would muddy the numbers. */
const live = browser && import.meta.env.PROD && window.location.hostname === 'aastr.id'

// text/plain keeps the POST a simple request, so the browser sends no preflight.
const send: Send = async (batch: Batch, beacon: boolean) => {
  const body = JSON.stringify(batch)
  if (!live) {
    if (import.meta.env.DEV) console.debug('[impact]', batch)
    return true
  }
  if (beacon && navigator.sendBeacon) return navigator.sendBeacon(INGEST_URL, new Blob([body], { type: 'text/plain' }))
  try {
    const res = await fetch(INGEST_URL, { method: 'POST', body, headers: { 'Content-Type': 'text/plain' }, keepalive: true })
    return res.ok || res.status === 400 // a 400 won't pass on a retry either
  } catch {
    return false
  }
}

const memory = new Map<string, string>()
const storage = browser
  ? window.localStorage
  : { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => void memory.set(k, v), removeItem: (k: string) => void memory.delete(k) }

export const impact = createImpact({
  storage,
  send,
  newId: () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join(''),
  now: () => Date.now(),
  lang: () => (document.documentElement.lang === 'en' ? 'en' : 'id'),
  device: () => {
    const touch = window.matchMedia('(pointer: coarse)').matches
    return layoutFor(window.innerWidth, window.innerHeight, touch).startsWith('phone') ? 'phone' : 'wide'
  },
  app: typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev',
})

// Active time: the clock only runs while the page is visible, so a tab left
// in the background doesn't count as minutes spent on a puzzle.
let activeTotal = 0
let visibleSince: number | null = browser && document.visibilityState === 'visible' ? performance.now() : null

/** Milliseconds this page has been visible since it loaded. Durations are differences of two readings. */
export function activeMs(): number {
  return activeTotal + (visibleSince === null ? 0 : performance.now() - visibleSince)
}

if (browser) {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') visibleSince = performance.now()
    else {
      activeTotal = activeMs()
      visibleSince = null
      void impact.flush(true)
    }
  })
  window.addEventListener('online', () => void impact.flush())
  window.setInterval(() => void impact.flush(), FLUSH_EVERY)
}

/** The referring site for the first page of this visit, if it's another site. */
export function externalReferrer(): string | null {
  if (!browser || !document.referrer) return null
  try {
    const host = new URL(document.referrer).hostname.replace(/^www\./, '').toLowerCase()
    return host && host !== window.location.hostname ? host : null
  } catch {
    return null
  }
}
