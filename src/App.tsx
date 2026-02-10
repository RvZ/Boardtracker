import { Outlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import SnowParticles from './components/shared/SnowParticles'

function App() {
  return (
    <div className="min-h-screen text-white">
      <SnowParticles />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
