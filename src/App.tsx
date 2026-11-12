import { lazy, Suspense, useEffect, useRef } from 'react'
import { LangProvider } from './lang'
import CertificatePage from './pages/CertificatePage'
import GuidePage from './pages/GuidePage'
import GuidesPage from './pages/GuidesPage'
import LandingPage from './pages/LandingPage'
import MapPage from './pages/MapPage'
import NotebookPage from './pages/NotebookPage'
import PlayPage from './pages/PlayPage'
import PrivacyPage from './pages/PrivacyPage'
import SurveyPage from './pages/SurveyPage'
import { RouterProvider, matchRoute, pagePath, useRoute, type Page } from './router'
import { ALL, isUnlocked } from './levels'
import { store } from './store'
import { externalReferrer, impact } from './impact'

// Only the admin needs Firebase Auth and the dashboard, so they load on demand.
const AdminPage = lazy(() => import('./pages/AdminPage'))

const playable = (id: string) => ALL.some((l) => l.id === id) && isUnlocked(id, new Set(store.load().passed))

/** Counts each page shown, for the dashboard's traffic numbers. Only the first page of a visit has a referrer. */
function usePageViews(page: Page) {
  const first = useRef(true)
  const path = page.name === 'play' && !playable(page.id) ? '/main' : pagePath(page)
  useEffect(() => {
    if (!path) return
    impact.page(path, first.current ? externalReferrer() : null)
    first.current = false
  }, [path])
}

function Routes() {
  const { route } = useRoute()
  const page = matchRoute(route)
  usePageViews(page)
  switch (page.name) {
    case 'landing':
      return <LandingPage />
    case 'map':
      return <MapPage />
    case 'notebook':
      return <NotebookPage />
    case 'certificate':
      return <CertificatePage id={page.id} />
    case 'guides':
      return <GuidesPage />
    case 'guide':
      return <GuidePage role={page.role} id={page.id} />
    case 'survey':
      return <SurveyPage />
    case 'privacy':
      return <PrivacyPage />
    case 'admin':
      return (
        <Suspense fallback={null}>
          <AdminPage />
        </Suspense>
      )
    case 'play':
      // A session that doesn't exist yet, or is still locked, shows the map instead.
      return playable(page.id) ? <PlayPage sessionId={page.id} /> : <MapPage />
  }
}

export default function App() {
  return (
    <LangProvider>
      <RouterProvider>
        <Routes />
      </RouterProvider>
    </LangProvider>
  )
}
