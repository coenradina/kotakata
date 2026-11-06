import { describe, expect, it } from 'vitest'
import { MAX_NAME, cleanName } from './content'

describe('cleanName', () => {
  it('trims and collapses spaces', () => {
    expect(cleanName('  Rina   Putri  ')).toBe('Rina Putri')
  })
  it('caps the length', () => {
    expect(cleanName('a'.repeat(100))).toHaveLength(MAX_NAME)
  })
})
