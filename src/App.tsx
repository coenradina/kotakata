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
import SignInPage from './pages/SignInPage'
import EducatorPage from './pages/EducatorPage'
import ClassRequestPage from './pages/ClassRequestPage'
import ClassPage from './pages/ClassPage'
import ClassJoinPage from './pages/ClassJoinPage'
import WhoPlaysPage from './pages/WhoPlaysPage'
import ParentPage from './pages/ParentPage'
import AccountPage from './pages/AccountPage'
import { AccountProvider, useAccount } from './account/AccountProvider'
import SurveyPage from './pages/SurveyPage'
import { RouterProvider, matchRoute, pagePath, useRoute, type Page } from './router'
import { ALL, isUnlocked } from './levels'
import { store } from './store'
import { externalReferrer, impact } from './impact'
import { ADMIN_ONLY, isVisible, useAccess, type Access } from './access'

// Only the admin needs Firebase Auth and the dashboard, so they load on demand.
const AdminPage = lazy(() => import('./pages/AdminPage'))

const playable = (id: string, access: Access) => ALL.some((l) => l.id === id) && isVisible(id, access) && isUnlocked(id, new Set(store.load().passed), access === 'admin')

/** Counts each page shown, for the dashboard's traffic numbers. Only the first page of a visit has a referrer. */
function usePageViews(page: Page, access: Access) {
  const first = useRef(true)
  // Not counted while an admin-only play page waits for the admin check.
  const waiting = access === 'checking' && page.name === 'play' && ADMIN_ONLY.has(page.id)
  const path = waiting ? null : page.name === 'play' && !playable(page.id, access) ? '/main' : pagePath(page)
  useEffect(() => {
    if (!path) return
    impact.page(path, first.current ? externalReferrer() : null)
    first.current = false
  }, [path])
}

/** Pages that show the player's progress: they wait for a profile's progress, and a parent with several children picks one first. */
const PLAYER_PAGES = new Set<Page['name']>(['landing', 'map', 'play', 'notebook', 'certificate'])

function Routes() {
  const { route } = useRoute()
  const page = matchRoute(route)
  const { ready, player, storeKey } = useAccount()
  const access = useAccess()
  usePageViews(page, access)
  if (PLAYER_PAGES.has(page.name)) {
    if (!ready) return <div className="min-h-full bg-cream" aria-busy="true" />
    if (player.kind === 'choose' && page.name !== 'landing') return <WhoPlaysPage />
    // A different player (a student, another child) remounts the page, so nothing from the last one lingers.
    return <PlayerPage key={storeKey} page={page} />
  }
  return <OtherPage page={page} />
}

function PlayerPage({ page }: { page: Page }) {
  const access = useAccess()
  switch (page.name) {
    case 'landing':
      return <LandingPage />
    case 'map':
      return <MapPage />
    case 'notebook':
      return <NotebookPage />
    case 'certificate':
      return <CertificatePage id={page.id} />
    case 'play':
      // An admin-only session waits for the admin check rather than flashing the map.
      if (access === 'checking' && ADMIN_ONLY.has(page.id)) return null
      // A session that doesn't exist yet, is still locked, or is admin-only shows the map instead.
      return playable(page.id, access) ? <PlayPage sessionId={page.id} /> : <MapPage />
    default:
      return null
  }
}

function OtherPage({ page }: { page: Page }) {
  switch (page.name) {
    case 'guides':
      return <GuidesPage />
    case 'guide':
      return <GuidePage role={page.role} id={page.id} />
    case 'survey':
      return <SurveyPage />
    case 'privacy':
      return <PrivacyPage />
    case 'signin':
      return <SignInPage />
    case 'educator':
      return <EducatorPage />
    case 'classRequest':
      return <ClassRequestPage />
    case 'classPage':
      return <ClassPage id={page.id} />
    case 'classJoin':
      return <ClassJoinPage code={page.code} />
    case 'parent':
      return <ParentPage />
    case 'account':
      return <AccountPage />
    case 'admin':
      return (
        <Suspense fallback={null}>
          <AdminPage />
        </Suspense>
      )
    default:
      return null
  }
}

export default function App() {
  return (
    <LangProvider>
      <RouterProvider>
        <AccountProvider>
          <Routes />
        </AccountProvider>
      </RouterProvider>
    </LangProvider>
  )
}
