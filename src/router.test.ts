import { describe, expect, it } from 'vitest'
import { matchRoute, toRoute } from './router'

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

describe('matchRoute', () => {
  it('maps each route to its page', () => {
    expect(matchRoute('/')).toEqual({ name: 'landing' })
    expect(matchRoute('/main')).toEqual({ name: 'map' })
    expect(matchRoute('/main/tree')).toEqual({ name: 'play', id: 'tree' })
    expect(matchRoute('/buku')).toEqual({ name: 'notebook' })
    expect(matchRoute('/sertifikat/train')).toEqual({ name: 'certificate', id: 'train' })
    expect(matchRoute('/panduan')).toEqual({ name: 'guides' })
    expect(matchRoute('/panduan/guru/s1')).toEqual({ name: 'guide', role: 'guru', id: 's1' })
  })
  it('sends unknown routes to the landing page', () => {
    expect(matchRoute('/nope')).toEqual({ name: 'landing' })
    expect(matchRoute('/sertifikat')).toEqual({ name: 'landing' })
  })
})
