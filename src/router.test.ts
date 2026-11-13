import { describe, expect, it } from 'vitest'
import { matchRoute, pagePath, toRoute } from './router'

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
    expect(matchRoute('/survei')).toEqual({ name: 'survey' })
    expect(matchRoute('/sertifikat/train')).toEqual({ name: 'certificate', id: 'train' })
    expect(matchRoute('/panduan')).toEqual({ name: 'guides' })
    expect(matchRoute('/panduan/guru/s1')).toEqual({ name: 'guide', role: 'guru', id: 's1' })
    expect(matchRoute('/privasi')).toEqual({ name: 'privacy' })
    expect(matchRoute('/admin')).toEqual({ name: 'admin' })
    expect(matchRoute('/masuk')).toEqual({ name: 'signin' })
    expect(matchRoute('/guru')).toEqual({ name: 'educator' })
    expect(matchRoute('/ortu')).toEqual({ name: 'parent' })
    expect(matchRoute('/akun')).toEqual({ name: 'account' })
  })
  it('sends unknown routes to the landing page', () => {
    expect(matchRoute('/nope')).toEqual({ name: 'landing' })
    expect(matchRoute('/sertifikat')).toEqual({ name: 'landing' })
  })
})

describe('pagePath', () => {
  it('records one path per page', () => {
    expect(pagePath(matchRoute('/'))).toBe('/')
    expect(pagePath(matchRoute('/nope/whatever'))).toBe('/')
    expect(pagePath(matchRoute('/main/s3'))).toBe('/main/s3')
    expect(pagePath(matchRoute('/panduan/guru/s1'))).toBe('/panduan/guru/s1')
  })
  it('leaves the admin dashboard out', () => {
    expect(pagePath(matchRoute('/admin'))).toBeNull()
  })
})
