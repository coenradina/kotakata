import { describe, expect, it } from 'vitest'
import { layoutFor } from './useLayout'

describe('layoutFor', () => {
  it('treats narrow screens as phones', () => {
    expect(layoutFor(375, 667, true)).toBe('phone')
    expect(layoutFor(390, 664, true)).toBe('phone')
    // A narrow desktop window gets the phone layout too.
    expect(layoutFor(600, 900, false)).toBe('phone')
  })
  it('treats a short touch screen as a phone on its side', () => {
    expect(layoutFor(664, 390, true)).toBe('phone-landscape')
    expect(layoutFor(844, 390, true)).toBe('phone-landscape')
  })
  it('keeps tablets and laptops on the wide layout', () => {
    expect(layoutFor(768, 1024, true)).toBe('wide')
    expect(layoutFor(1024, 768, true)).toBe('wide')
    expect(layoutFor(1440, 900, false)).toBe('wide')
    // A short desktop window without touch stays wide.
    expect(layoutFor(1200, 480, false)).toBe('wide')
  })
})
