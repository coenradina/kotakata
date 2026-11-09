import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GUIDES, ROLES } from './guides'
import { matchRoute } from './router'
import { GUIDE_IDS, GUIDE_ROLES, PLAY_IDS, STATIC_ROUTES } from './staticRoutes'

// The level list itself can't load in tests (its theme reads CSS), so this
// reads each level folder's index.ts for its top-level `id: '…'`.
function levelIds() {
  const dir = join(__dirname, 'levels')
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => {
      try {
        const m = readFileSync(join(dir, d.name, 'index.ts'), 'utf8').match(/^ {2}id: '(\w+)',$/m)
        return m ? [m[1]] : []
      } catch {
        return []
      }
    })
}

describe('STATIC_ROUTES', () => {
  it('lists every playable session and level', () => {
    expect([...PLAY_IDS].sort()).toEqual(levelIds().sort())
  })

  it('lists every guide for every role', () => {
    expect([...GUIDE_IDS].sort()).toEqual(GUIDES.map((g) => g.session).sort())
    expect([...GUIDE_ROLES].sort()).toEqual([...ROLES].sort())
  })

  it('has only routes the router knows', () => {
    for (const r of STATIC_ROUTES.filter(Boolean)) expect(matchRoute(`/${r}`).name, r).not.toBe('landing')
  })
})
