import { useEffect, useState, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import Heart3D from '../components/Heart3D'
import { ThreeMotion, threeAnimationBus } from '../components/ThreeAnimationSystem'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const settings = useStore(s => s.settings)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    document.title = settings.site_title || 'Happy Birthday! 🎂'
    const timer = setTimeout(() => setLoaded(true), 300)
    // Trigger 3D intro sparkle burst on canvas
    threeAnimationBus.triggerSparks(window.innerWidth / 2, window.innerHeight * 0.48, 25)
    return () => clearTimeout(timer)
  }, [settings])

  return (
    <div className={styles.page}>
      {/* Background gradient */}
      <div className={styles.bg} />

      {/* Content */}
      <div className={styles.content}>
        {/* 3D Heart Section */}
        <ThreeMotion.div
          className={styles.heartSection}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
        >
          <Suspense fallback={
            <div className={styles.loadingHeart}>
              <ThreeMotion.div className={styles.loadingPulse} pulse={{ frequency: 3.5, amplitude: 0.18 }}>❤️</ThreeMotion.div>
            </div>
          }>
            <Heart3D height="400px" />
          </Suspense>
        </ThreeMotion.div>

        {/* Text Content */}
        <ThreeMotion.div
          className={styles.textSection}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 40 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <ThreeMotion.p
            className={styles.fromText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            A surprise from {settings.from_name || 'Your Partner'} ✨
          </ThreeMotion.p>

          <ThreeMotion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {settings.site_title || 'Happy Birthday! 🎂'}
          </ThreeMotion.h1>

          <ThreeMotion.p
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            {settings.landing_subtitle || 'A special surprise just for you ✨'}
          </ThreeMotion.p>

          <ThreeMotion.p
            className={styles.nameTag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            For{' '}
            <ThreeMotion.span className={styles.nameGlow} pulse={{ frequency: 2, amplitude: 0.04 }}>
              {settings.birthday_person_name || 'My Love'}
            </ThreeMotion.span>
          </ThreeMotion.p>

          <ThreeMotion.button
            className={styles.ctaButton}
            onClick={() => navigate('/birthday')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>Open Your Surprise</span>
            <ThreeMotion.span className={styles.buttonIcon} bounce={{ frequency: 4, amplitude: 5 }}>🎁</ThreeMotion.span>
          </ThreeMotion.button>

          <ThreeMotion.div
            className={styles.scrollHint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            <span>Scroll down for the magic</span>
            <ThreeMotion.span className={styles.scrollArrow} bounce={{ frequency: 3.5, amplitude: 4 }}>↓</ThreeMotion.span>
          </ThreeMotion.div>
        </ThreeMotion.div>
      </div>

      {/* Bottom decorative strip */}
      <div className={styles.bottomStrip}>
        {Array.from({ length: 20 }).map((_, i) => (
          <ThreeMotion.span key={i} className={styles.heartRow} pulse={{ frequency: 2 + (i % 3) * 0.5, amplitude: 0.1 }}>♥</ThreeMotion.span>
        ))}
      </div>
    </div>
  )
}
