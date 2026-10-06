import { useEffect, useState, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import Heart3D from '../components/Heart3D'
import styles from './LandingPage.module.css'

function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2
  }))

  return (
    <div className={styles.starField}>
      {stars.map(star => (
        <div
          key={star.id}
          className={styles.star}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`
          }}
        />
      ))}
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const settings = useStore(s => s.settings)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    document.title = settings.site_title || 'Happy Birthday! 🎂'
    setTimeout(() => setLoaded(true), 300)
  }, [settings])

  return (
    <div className={styles.page}>
      {/* Background gradient */}
      <div className={styles.bg} />
      <StarField />

      {/* Content */}
      <div className={styles.content}>
        {/* 3D Heart Section */}
        <motion.div
          className={styles.heartSection}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <Suspense fallback={
            <div className={styles.loadingHeart}>
              <div className={styles.loadingPulse}>❤️</div>
            </div>
          }>
            <Heart3D height="400px" />
          </Suspense>
        </motion.div>

        {/* Text Content */}
        <motion.div
          className={styles.textSection}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 40 }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
        >
          <motion.p
            className={styles.fromText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            A surprise from {settings.from_name || 'Your Partner'} ✨
          </motion.p>

          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {settings.site_title || 'Happy Birthday! 🎂'}
          </motion.h1>

          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            {settings.landing_subtitle || 'A special surprise just for you ✨'}
          </motion.p>

          <motion.p
            className={styles.nameTag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            For{' '}
            <span className={styles.nameGlow}>
              {settings.birthday_person_name || 'My Love'}
            </span>
          </motion.p>

          <motion.button
            className={styles.ctaButton}
            onClick={() => navigate('/birthday')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
            whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(255,107,157,0.7)' }}
            whileTap={{ scale: 0.97 }}
          >
            <span>Open Your Surprise</span>
            <span className={styles.buttonIcon}>🎁</span>
          </motion.button>

          <motion.div
            className={styles.scrollHint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.8 }}
          >
            <span>Scroll down for the magic</span>
            <span className={styles.scrollArrow}>↓</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom decorative strip */}
      <div className={styles.bottomStrip}>
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className={styles.heartRow}>♥</span>
        ))}
      </div>
    </div>
  )
}
