import { describe, expect, it } from 'vitest'
import { GUIDES } from '.'
import { CHAT_STAGES } from '../levels/chat/stages'
import { FAIR_STAGES } from '../levels/fair/stages'
import { BOARD_STAGES } from '../levels/board/stages'

const PUZZLES = { s1: CHAT_STAGES, s3: FAIR_STAGES, s5: BOARD_STAGES }

/** Every { id, en } pair anywhere in a value. */
function pairs(v: unknown, path = ''): { path: string; id: unknown; en: unknown }[] {
  if (!v || typeof v !== 'object') return []
  if (Array.isArray(v)) return v.flatMap((x, i) => pairs(x, `${path}[${i}]`))
  const o = v as Record<string, unknown>
  if ('id' in o && 'en' in o && Object.keys(o).length === 2) return [{ path, id: o.id, en: o.en }]
  return Object.entries(o).flatMap(([k, x]) => (typeof x === 'function' ? [] : pairs(x, `${path}.${k}`)))
}

describe('guides', () => {
  for (const g of GUIDES) {
    it(`${g.session}: every text exists in Indonesian and English`, () => {
      const all = pairs(g)
      expect(all.length).toBeGreaterThan(40)
      for (const p of all) {
        expect(typeof p.id === 'string' && p.id.trim().length > 0, `${p.path} id`).toBe(true)
        expect(typeof p.en === 'string' && p.en.trim().length > 0, `${p.path} en`).toBe(true)
      }
    })
    it(`${g.session}: has a note for every puzzle, three exit-ticket items and cards to print`, () => {
      expect(g.puzzles).toHaveLength(PUZZLES[g.session].length)
      expect(g.exitTicket).toHaveLength(3)
      for (const set of g.cardSets) for (const lang of ['id', 'en'] as const) expect(set.cards(lang).length).toBeGreaterThanOrEqual(10)
    })
  }
})
