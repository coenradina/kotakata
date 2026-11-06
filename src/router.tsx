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
