import { describe, expect, it } from 'vitest'
import built from './codepoints.json'
import palette from './palette.json'

// Every emoji and UI symbol in the app must have a pixel icon in
// src/icons/art, or it falls back to the system emoji font and breaks the look.
// After adding art, rebuild the font with scripts/build-icon-font.py.

/** UI symbols that are icons but not emoji. Arrows and dots inside sentences stay plain text. */
const UI_SYMBOLS = [...'▶◀▸▾✓✗✕■★↺⟲⤢⬇⋯«»←↗']
const ZWJ = '\u200d'
const VS16 = /\ufe0f/g

type Icon = { char: string; mono?: boolean; rows: string[] }
const sources = import.meta.glob<string>(['../**/*.{ts,tsx}', '!../**/*.test.*', '!./**'], { query: '?raw', import: 'default', eager: true })
const artFiles = import.meta.glob<Record<string, Icon>>('./art/*.json', { import: 'default', eager: true })
const art = Object.values(artFiles).flatMap((f) => Object.entries(f))
const drawn = new Set(art.map(([, icon]) => icon.char.replace(VS16, '')))

/** Icon characters in a piece of source, with emoji joined by ZWJ kept together. */
function iconsIn(text: string): string[] {
  const found: string[] = []
  const chars = [...text.replace(VS16, '')]
  for (let i = 0; i < chars.length; i++) {
    let ch = chars[i]
    if (!/\p{Extended_Pictographic}/u.test(ch) && !UI_SYMBOLS.includes(ch)) continue
    while (chars[i + 1] === ZWJ && chars[i + 2]) {
      ch += ZWJ + chars[i + 2]
      i += 2
    }
    found.push(ch)
  }
  return found
}

describe('pixel icons', () => {
  it('draws every emoji and UI symbol the app uses', () => {
    const missing = new Map<string, string>()
    for (const [path, text] of Object.entries(sources)) for (const ch of iconsIn(text)) if (!drawn.has(ch)) missing.set(ch, path.slice(3))
    expect([...missing].map(([ch, where]) => `${ch} (${where})`)).toEqual([])
  })

  it('keeps every grid 12 rows of one width, in the right colours', () => {
    const colours = Object.keys(palette)
    for (const [name, icon] of art) {
      expect(icon.rows, name).toHaveLength(12)
      const width = icon.rows[0].length
      for (const row of icon.rows) {
        expect(row.length, name).toBe(width)
        for (const ch of row) if (ch !== '.') expect(icon.mono ? ch === 'x' : ch !== 'x' && colours.includes(ch), `${name} uses ${ch}`).toBe(true)
      }
    }
  })

  it('has a built font that covers every drawn icon', () => {
    for (const ch of drawn)
      for (const cp of [...ch]) expect(built, `${ch} is not in the font, run scripts/build-icon-font.py`).toContain(`U+${cp.codePointAt(0)!.toString(16).toUpperCase()}`)
  })
})
