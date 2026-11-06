import { LangProvider } from './lang'
import NotebookPage from './pages/NotebookPage'
import PlayPage from './pages/PlayPage'
import { RouterProvider, useRoute } from './router'

function Routes() {
  const { route } = useRoute()
  switch (route) {
    case '/buku':
      return <NotebookPage />
    // The game, for now, until the landing page exists. Unknown paths show it too.
    default:
      return <PlayPage />
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
