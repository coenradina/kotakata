import { LangProvider } from './lang'
import CertificatePage from './pages/CertificatePage'
import GuidePage from './pages/GuidePage'
import GuidesPage from './pages/GuidesPage'
import LandingPage from './pages/LandingPage'
import MapPage from './pages/MapPage'
import NotebookPage from './pages/NotebookPage'
import PlayPage from './pages/PlayPage'
import { RouterProvider, matchRoute, useRoute } from './router'
import { ALL, isUnlocked } from './levels'
import { store } from './store'

function Routes() {
  const { route } = useRoute()
  const page = matchRoute(route)
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
    case 'play':
      // A session that doesn't exist yet, or is still locked, shows the map instead.
      return ALL.some((l) => l.id === page.id) && isUnlocked(page.id, new Set(store.load().passed)) ? <PlayPage sessionId={page.id} /> : <MapPage />
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
