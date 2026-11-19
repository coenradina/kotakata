import { describe, expect, it } from 'vitest'
import { ADMIN_ONLY, isVisible } from './access'
import { PLAY_IDS } from './staticRoutes'

describe('admin-only sessions', () => {
  it('names only sessions and levels that exist', () => {
    const ids = new Set(PLAY_IDS)
    expect([...ADMIN_ONLY].filter((id) => !ids.has(id))).toEqual([])
  })

  it('hides them from the public and shows them to the admin', () => {
    expect(PLAY_IDS.filter((id) => isVisible(id, 'public'))).toEqual(['s1', 's2', 's3', 'train', 'tree'])
    expect(PLAY_IDS.filter((id) => isVisible(id, 'checking'))).toHaveLength(5)
    expect(PLAY_IDS.every((id) => isVisible(id, 'admin'))).toBe(true)
  })
})
