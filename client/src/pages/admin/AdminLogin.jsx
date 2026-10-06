import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const login = useStore(s => s.login)
  const isAuthenticated = useStore(s => s.isAuthenticated)
  const loginError = useStore(s => s.loginError)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/admin')
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const ok = await login(username, password)
    setLoading(false)
    if (ok) navigate('/admin')
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className={styles.header}>
          <span className={styles.icon}>🎂</span>
          <h1 className={styles.title}>Admin Login</h1>
          <p className={styles.subtitle}>Manage your birthday surprise</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              className={styles.input}
              required
              autoFocus
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {loginError && (
            <motion.p
              className={styles.error}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              ⚠️ {loginError}
            </motion.p>
          )}

          <motion.button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>🔐 Sign In</>
            )}
          </motion.button>
        </form>

        <div className={styles.hint}>
          <p>Default credentials: <strong>admin</strong> / <strong>birthday2024</strong></p>
        </div>

        <button className={styles.backLink} onClick={() => navigate('/')}>
          ← Back to Site
        </button>
      </motion.div>
    </div>
  )
}
