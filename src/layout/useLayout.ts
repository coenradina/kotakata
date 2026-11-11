import { useSyncExternalStore } from 'react'

/**
 * Which play screen to show (docs/plan/05-mobile-play.md, section 4):
 * - `phone`: a portrait phone, with one view at a time
 * - `phone-landscape`: a phone on its side, blocks and stage side by side
 * - `wide`: laptops, desktops and tablets on their side: blocks on the left, the stage on the right
 * - `tall`: tablets upright: the stage and its controls on top, the blocks underneath
 */
export type Layout = 'phone' | 'phone-landscape' | 'wide' | 'tall'

/** Phones are under 640px wide, or under 500px tall with a touch screen (a phone on its side). */
export function layoutFor(width: number, height: number, touch: boolean): Layout {
  if (width < 640) return 'phone'
  if (touch && height < 500) return 'phone-landscape'
  // Upright screens give the stage the top and the blocks the full width below.
  return width / height < 1.25 ? 'tall' : 'wide'
}

const QUERIES = ['(max-width: 639.98px)', '(max-height: 499.98px)', '(pointer: coarse)']

function current(): Layout {
  if (typeof window === 'undefined') return 'wide'
  return layoutFor(window.innerWidth, window.innerHeight, window.matchMedia('(pointer: coarse)').matches)
}

function subscribe(onChange: () => void) {
  const lists = QUERIES.map((q) => window.matchMedia(q))
  for (const l of lists) l.addEventListener('change', onChange)
  window.addEventListener('resize', onChange)
  return () => {
    for (const l of lists) l.removeEventListener('change', onChange)
    window.removeEventListener('resize', onChange)
  }
}

/** The current layout, updated when the window is resized or the phone is turned. */
export function useLayout(): Layout {
  return useSyncExternalStore(subscribe, current, () => 'wide')
}
