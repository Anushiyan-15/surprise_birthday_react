import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import { ThreeMotion, ThreeAnimatePresence } from '../../components/ThreeAnimationSystem'
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
    if (isAuthenticated) navigate('/admin', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const ok = await login(username, password)
      if (ok) navigate('/admin', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <span className={styles.grid} />
      </div>

      <ThreeMotion.section
        className={styles.card}
        initial={{ opacity: 0, y: 24, rotateX: 5, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.65 }}
        aria-labelledby="admin-login-title"
      >
        <div className={styles.brandLine}><span /> PRIVATE ADMIN PORTAL <span /></div>
        <header className={styles.header}>
          <ThreeMotion.div className={styles.mark} aria-hidden="true" animate={{ y: [0, -4, 0], rotate: [0, 2, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <span className={styles.markGlow} />
            <svg viewBox="0 0 48 48" fill="none"><path d="M12 25h24l-2.6 13H14.6L12 25Z" /><path d="M15 21c0-3 3-4 5-2 1-4 7-4 8 0 2-2 5-1 5 2v4H15v-4Z" /><path d="M17 15c-2-2 1-3 0-5m7 5c-2-2 1-3 0-5m7 5c-2-2 1-3 0-5" /></svg>
          </ThreeMotion.div>
          <p className={styles.eyebrow}>A LITTLE SPACE BEHIND THE MAGIC</p>
          <h1 id="admin-login-title" className={styles.title}>Admin <span>sign in</span></h1>
          <p className={styles.subtitle}>Manage your birthday surprise, all in one place.</p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="admin-username">Username or email</label>
            <div className={styles.inputShell}>
              <svg className={styles.fieldIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.5 3.2-5.3 7-5.3s6.3 1.8 7 5.3" /></svg>
              <input id="admin-username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" className={styles.input} required autoFocus autoComplete="username" disabled={loading} />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="admin-password">Password</label>
            <div className={styles.inputShell}>
              <svg className={styles.fieldIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></svg>
              <input id="admin-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className={`${styles.input} ${styles.passwordInput}`} required autoComplete="current-password" disabled={loading} />
              <ThreeMotion.button type="button" className={styles.togglePassword} onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} disabled={loading} whileTap={{ scale: 0.88 }}>
                {showPassword ? <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A11 11 0 0 1 12 5c5 0 8.5 4.5 9 7-.2 1.1-.9 2.2-1.9 3.2M6.2 6.2C4 7.7 2.4 10 2 12c.5 2.5 4 7 10 7 1.4 0 2.7-.3 3.8-.8" /></svg> : <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.5 12s3.2-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.2 6.5-9.5 6.5S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.7" /></svg>}
              </ThreeMotion.button>
            </div>
          </div>

          <ThreeAnimatePresence mode="wait">
            {loginError && <ThreeMotion.p className={styles.error} role="alert" initial={{ opacity: 0, y: -7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}><span aria-hidden="true">!</span>{loginError}</ThreeMotion.p>}
          </ThreeAnimatePresence>

          <ThreeMotion.button type="submit" className={styles.submitBtn} disabled={loading} whileHover={loading ? undefined : { y: -2 }} whileTap={loading ? undefined : { scale: 0.985 }}>
            {loading ? <><ThreeMotion.span className={styles.spinner} spin={{ speed: 450 }} /> Authenticating securely…</> : <>Sign in to dashboard <span aria-hidden="true">↗</span></>}
          </ThreeMotion.button>
        </form>

        <div className={styles.credentialHint}>
          <span className={styles.credentialLabel}>Default credentials</span>
          <span><strong>Username</strong> admin <i>·</i> <strong>Password</strong> birthday2024</span>
        </div>
        <div className={styles.secureNote}><span className={styles.secureDot} /> Your private celebration, kept secure</div>
        <button className={styles.backLink} type="button" onClick={() => navigate('/')}>← <span>Back to birthday site</span></button>
      </ThreeMotion.section>
      <p className={styles.footer}>MADE WITH CARE <span>·</span> JUST FOR YOU</p>
    </main>
  )
}
