import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import useStore from './store/useStore'
import LandingPage from './pages/LandingPage'
import BirthdayPage from './pages/BirthdayPage'
import MemoriesPage from './pages/MemoriesPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import ThreeGlobalCanvas from './components/ThreeGlobalCanvas'
import './index.css'

function PrivateRoute({ children }) {
  const isAuthenticated = useStore(s => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />
}

const BACKGROUND_THEMES = {
  'dark-purple': 'linear-gradient(160deg, #0d0119 0%, #1a0a2e 35%, #2d1445 70%, #1a0a2e 100%)',
  'midnight-blue': 'linear-gradient(160deg, #030817 0%, #071a35 38%, #102d55 72%, #071426 100%)',
  'deep-rose': 'linear-gradient(160deg, #1a0610 0%, #351020 38%, #5a1835 72%, #260b19 100%)',
  'forest-night': 'linear-gradient(160deg, #04120e 0%, #0a241b 38%, #174331 72%, #071a14 100%)',
}

function PublicTheme({ children }) {
  const settings = useStore(s => s.settings)
  const themeStyle = {
    '--primary': settings.primary_color || '#ff6b9d',
    '--secondary': settings.secondary_color || '#c44569',
    '--accent': settings.accent_color || '#f8a5c2',
    '--font-serif': `"${settings.font_family || 'Playfair Display'}", Georgia, serif`,
    '--page-background': BACKGROUND_THEMES[settings.background_theme] || BACKGROUND_THEMES['dark-purple'],
    minHeight: '100dvh',
  }

  return <div style={themeStyle}>{children}</div>
}

function PublicEffects() {
  const location = useLocation()
  return location.pathname.startsWith('/admin') ? null : <ThreeGlobalCanvas />
}

function App() {
  const fetchSettings = useStore(s => s.fetchSettings)
  const verifyAuth = useStore(s => s.verifyAuth)

  useEffect(() => {
    fetchSettings()
    verifyAuth()
  }, [])

  return (
    <BrowserRouter>
      <PublicEffects />
      <Routes>
        <Route path="/" element={<PublicTheme><LandingPage /></PublicTheme>} />
        <Route path="/birthday" element={<PublicTheme><BirthdayPage /></PublicTheme>} />
        <Route path="/memories" element={<PublicTheme><MemoriesPage /></PublicTheme>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
