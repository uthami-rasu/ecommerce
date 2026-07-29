import { Header } from './components/layout/Header'
import { useLenis } from './hooks/useLenis'
import { useTheme } from './hooks/useTheme'
import { useReveal } from './hooks/useReveal'
import { HomePage } from './pages/HomePage'

function App() {
  useLenis()
  useTheme()
  useReveal()

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 transition-colors duration-300 dark:bg-stone-950 dark:text-stone-50">
      <Header />
      <HomePage />
    </div>
  )
}

export default App
