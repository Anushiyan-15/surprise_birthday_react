import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useStore from './store/useStore'
import LandingPage from './pages/LandingPage'
import BirthdayPage from './pages/BirthdayPage'
import MemoriesPage from './pages/MemoriesPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import FloatingParticles from './components/FloatingParticles'
import './index.css'

function PrivateRoute({ children }) {
  const isAuthenticated = useStore(s => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />
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
      <FloatingParticles />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/birthday" element={<BirthdayPage />} />
        <Route path="/memories" element={<MemoriesPage />} />
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
