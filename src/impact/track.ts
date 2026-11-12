// What the game reports for impact measurement (docs/plan/03-technical.md,
// section 6). Every event goes to the impact queue (src/impact/index.ts),
// which drops play events unless the player said yes, and to listeners,
// which tests use.

import type { ImpactEvent } from './schema'
import { impact } from './index'

export type { ImpactEvent }

type Listener = (e: ImpactEvent) => void
const listeners = new Set<Listener>()

export function track(e: ImpactEvent) {
  impact.track(e)
  for (const l of listeners) l(e)
}

/** Sends what's queued now, at the moments worth not losing (a pass, a finished session). */
export const flushImpact = () => void impact.flush()

/** Subscribes to every tracked event. Returns the unsubscribe function. */
export function onTrack(l: Listener) {
  listeners.add(l)
  return () => void listeners.delete(l)
}
