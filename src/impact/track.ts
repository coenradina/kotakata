// What the game reports for impact measurement (docs/plan/03-technical.md,
// section 6). Nothing is sent anywhere yet: build step 4 adds the queue
// and the backend. Until then events go to listeners only, which tests use.

export type ImpactEvent =
  | { t: 'session_start'; session: string }
  | {
      t: 'run'
      session: string
      puzzle: string
      /** Runs on this puzzle so far, this one included. */
      n: number
      passed: boolean
      prediction: number | null
      outcome: number | null
      hint: 0 | 1 | 2 | 3
    }
  | { t: 'puzzle_pass'; session: string; puzzle: string; runs: number; hint: 0 | 1 | 2 | 3 }

type Listener = (e: ImpactEvent) => void
const listeners = new Set<Listener>()

export function track(e: ImpactEvent) {
  for (const l of listeners) l(e)
}

/** Subscribes to every tracked event. Returns the unsubscribe function. */
export function onTrack(l: Listener) {
  listeners.add(l)
  return () => void listeners.delete(l)
}
