// A small router for a static site under a base path. GitHub Pages serves
// 404.html for unknown paths, and the build copies index.html there, so a
// deep link like /kotakata/buku still boots the app.

import { createContext, use, useEffect, useState, type ReactNode, type MouseEvent } from 'react'

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** '/kotakata/buku/' → '/buku'; anything outside the base → '/'. */
export function toRoute(pathname: string, base = BASE): string {
  if (!pathname.startsWith(base)) return '/'
  const rest = pathname.slice(base.length).replace(/\/+$/, '')
  return rest === '' ? '/' : rest.startsWith('/') ? rest : `/${rest}`
}

export const href = (route: string) => `${BASE}${route === '/' ? '/' : route}`

const RouteContext = createContext<{ route: string; navigate: (to: string) => void }>({ route: '/', navigate: () => {} })

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState(() => toRoute(window.location.pathname))
  useEffect(() => {
    const onPop = () => setRoute(toRoute(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const navigate = (to: string) => {
    if (to === route) return
    window.history.pushState(null, '', href(to))
    setRoute(to)
    window.scrollTo(0, 0)
  }
  return <RouteContext value={{ route, navigate }}>{children}</RouteContext>
}

export const useRoute = () => use(RouteContext)

/** An <a> that changes route without reloading. Modified clicks open normally. */
export function Link({ to, className, children, ...rest }: { to: string; className?: string; children: ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const { navigate } = useRoute()
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={href(to)} onClick={onClick} className={className} {...rest}>
      {children}
    </a>
  )
}

export type Page =
  | { name: 'landing' }
  | { name: 'map' }
  | { name: 'play'; id: string }
  | { name: 'notebook' }
  | { name: 'certificate'; id: string }
  | { name: 'guides' }
  | { name: 'guide'; role: string; id: string }
  | { name: 'survey' }
  | { name: 'privacy' }
  | { name: 'admin' }
  | { name: 'signin' }
  | { name: 'educator' }
  | { name: 'classRequest' }
  | { name: 'parent' }
  | { name: 'account' }

/** Which page a route shows. Unknown routes go to the landing page. */
export function matchRoute(route: string): Page {
  const parts = route.split('/').filter(Boolean)
  if (parts.length === 0) return { name: 'landing' }
  if (parts[0] === 'main') return parts[1] ? { name: 'play', id: parts[1] } : { name: 'map' }
  if (parts[0] === 'buku' && parts.length === 1) return { name: 'notebook' }
  if (parts[0] === 'sertifikat' && parts[1]) return { name: 'certificate', id: parts[1] }
  if (parts[0] === 'survei' && parts.length === 1) return { name: 'survey' }
  if (parts[0] === 'privasi' && parts.length === 1) return { name: 'privacy' }
  if (parts[0] === 'admin' && parts.length === 1) return { name: 'admin' }
  if (parts[0] === 'guru' && parts[1] === 'ajukan' && parts.length === 2) return { name: 'classRequest' }
  if (parts.length === 1) {
    const account = ({ masuk: 'signin', guru: 'educator', ortu: 'parent', akun: 'account' } as const)[parts[0] as 'masuk' | 'guru' | 'ortu' | 'akun']
    if (account) return { name: account }
  }
  if (parts[0] === 'panduan') return parts[1] && parts[2] ? { name: 'guide', role: parts[1], id: parts[2] } : { name: 'guides' }
  return { name: 'landing' }
}

/**
 * The page as impact data records it: one path per page, whatever the URL
 * said, so a typo or a made-up path doesn't become a row. Null for pages not
 * counted (the admin dashboard).
 */
export function pagePath(page: Page): string | null {
  switch (page.name) {
    case 'landing':
      return '/'
    case 'map':
      return '/main'
    case 'play':
      return `/main/${page.id}`
    case 'notebook':
      return '/buku'
    case 'certificate':
      return `/sertifikat/${page.id}`
    case 'guides':
      return '/panduan'
    case 'guide':
      return `/panduan/${page.role}/${page.id}`
    case 'survey':
      return '/survei'
    case 'privacy':
      return '/privasi'
    case 'admin':
      return null
    case 'signin':
      return '/masuk'
    case 'educator':
      return '/guru'
    case 'classRequest':
      return '/guru/ajukan'
    case 'parent':
      return '/ortu'
    case 'account':
      return '/akun'
  }
}
