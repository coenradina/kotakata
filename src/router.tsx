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

/** Which page a route shows. Unknown routes go to the landing page. */
export function matchRoute(route: string): Page {
  const parts = route.split('/').filter(Boolean)
  if (parts.length === 0) return { name: 'landing' }
  if (parts[0] === 'main') return parts[1] ? { name: 'play', id: parts[1] } : { name: 'map' }
  if (parts[0] === 'buku' && parts.length === 1) return { name: 'notebook' }
  if (parts[0] === 'sertifikat' && parts[1]) return { name: 'certificate', id: parts[1] }
  if (parts[0] === 'panduan') return parts[1] && parts[2] ? { name: 'guide', role: parts[1], id: parts[2] } : { name: 'guides' }
  return { name: 'landing' }
}
