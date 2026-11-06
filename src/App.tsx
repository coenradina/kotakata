import { LangProvider } from './lang'
import PlayPage from './pages/PlayPage'
import { RouterProvider, useRoute } from './router'

function Routes() {
  const { route } = useRoute()
  // Only the game exists so far. Unknown paths show it too.
  switch (route) {
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
