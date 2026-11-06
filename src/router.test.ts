import { describe, expect, it } from 'vitest'
import { toRoute } from './router'

describe('toRoute', () => {
  const base = '/kotakata'
  it('maps the base to /', () => {
    expect(toRoute('/kotakata', base)).toBe('/')
    expect(toRoute('/kotakata/', base)).toBe('/')
  })
  it('strips the base and trailing slashes', () => {
    expect(toRoute('/kotakata/buku', base)).toBe('/buku')
    expect(toRoute('/kotakata/buku/', base)).toBe('/buku')
    expect(toRoute('/kotakata/main/s1', base)).toBe('/main/s1')
  })
  it('sends paths outside the base home', () => {
    expect(toRoute('/elsewhere', base)).toBe('/')
  })
})
