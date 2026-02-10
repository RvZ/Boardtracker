import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import Dashboard from './pages/Dashboard'
import DayView from './pages/DayView'
import SeasonStats from './pages/SeasonStats'
import ResortMap from './pages/ResortMap'
import Import from './pages/Import'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="day/:dayId" element={<DayView />} />
          <Route path="season" element={<SeasonStats />} />
          <Route path="map" element={<ResortMap />} />
          <Route path="import" element={<Import />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
