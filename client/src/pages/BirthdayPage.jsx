import { useState, useEffect, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import BirthdayCake3D from '../components/BirthdayCake3D'
import styles from './BirthdayPage.module.css'

const STEPS = {
  INTRO: 'intro',
  APPEARING: 'appearing',
  CAKE_READY: 'cake_ready',
  LIGHTING: 'lighting',
  LIT: 'lit',
  BLOWN: 'blown',
  DONE: 'done'
}

function ConfettiPiece({ x, color, delay }) {
  return (
    <motion.div
      className={styles.confetti}
      style={{
        left: `${x}%`,
        background: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        width: `${Math.random() * 8 + 6}px`,
        height: `${Math.random() * 8 + 6}px`,
      }}
      initial={{ top: '-5%', rotate: 0, opacity: 1 }}
      animate={{
        top: '110%',
        rotate: 720,
        opacity: [1, 1, 0.5, 0],
        x: [0, Math.random() * 100 - 50, Math.random() * 80 - 40]
      }}
      transition={{ duration: Math.random() * 2 + 2, delay, ease: 'linear' }}
    />
  )
}

function ConfettiExplosion({ active }) {
  const COLORS = ['#ff6b9d', '#ffd700', '#f8a5c2', '#00d2d3', '#ff9f43', '#54a0ff', '#5f27cd']
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.5
  }))

  if (!active) return null

  return (
    <div className={styles.confettiContainer}>
      {pieces.map(p => (
        <ConfettiPiece key={p.id} x={p.x} color={p.color} delay={p.delay} />
      ))}
    </div>
  )
}

export default function BirthdayPage() {
  const navigate = useNavigate()
  const settings = useStore(s => s.settings)
  const [step, setStep] = useState(STEPS.INTRO)
  const [message, setMessage] = useState('Click to reveal the cake! 🎂')

  const name = settings.birthday_person_name || 'My Love'

  const handleRevealCake = () => {
    setStep(STEPS.APPEARING)
    setMessage('✨ Your cake is appearing...')
    setTimeout(() => {
      setStep(STEPS.CAKE_READY)
      setMessage('🕯️ Now light the candles!')
    }, 1500)
  }

  const handleLightCandles = () => {
    setStep(STEPS.LIGHTING)
    setMessage('🔥 Lighting the candles with love...')
    setTimeout(() => {
      setStep(STEPS.LIT)
      setMessage('Make a wish and blow! 🌬️')
    }, 2000)
  }

  const handleBlowCandles = () => {
    setStep(STEPS.BLOWN)
    setMessage('🎉 Your wish is on its way!')
    setTimeout(() => {
      setStep(STEPS.DONE)
      setMessage('🌟 Now see our memories together...')
    }, 2000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} />

      {/* Back button */}
      <motion.button
        className={styles.backBtn}
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ← Back
      </motion.button>

      <div className={styles.content}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className={styles.nameLabel}>Happy Birthday,</p>
          <h1 className={styles.bigName}>{name}</h1>
          <div className={styles.divider}>
            {['❤️', '✨', '🌟', '✨', '❤️'].map((e, i) => (
              <span key={i}>{e}</span>
            ))}
          </div>
        </motion.div>

        {/* Status message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            className={styles.statusMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {message}
          </motion.p>
        </AnimatePresence>

        {/* Cake area */}
        <div className={styles.cakeArea}>
          <AnimatePresence>
            {step === STEPS.INTRO && (
              <motion.button
                className={styles.revealBtn}
                onClick={handleRevealCake}
                whileHover={{ scale: 1.08, boxShadow: '0 15px 50px rgba(255,107,157,0.7)' }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
              >
                <span className={styles.btnEmoji}>🎂</span>
                <span>Click to Reveal Your Cake</span>
              </motion.button>
            )}

            {step !== STEPS.INTRO && (
              <motion.div
                className={styles.cakeWrapper}
                initial={{ opacity: 0, scale: 0.3, rotateX: -30 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ duration: 1, type: 'spring', stiffness: 80 }}
              >
                <Suspense fallback={
                  <div className={styles.cakeLoading}>
                    <div className={styles.spinner} />
                    <p>Baking your cake...</p>
                  </div>
                }>
                  <BirthdayCake3D
                    candlesLit={[STEPS.LIT, STEPS.BLOWN, STEPS.DONE].includes(step)}
                    showFireworks={[STEPS.BLOWN, STEPS.DONE].includes(step)}
                  />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className={styles.actionArea}>
          <AnimatePresence mode="wait">
            {step === STEPS.CAKE_READY && (
              <motion.button
                key="light"
                className={`${styles.actionBtn} ${styles.lightBtn}`}
                onClick={handleLightCandles}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <span>🕯️</span> Light the Candles
              </motion.button>
            )}

            {step === STEPS.LIT && (
              <motion.button
                key="blow"
                className={`${styles.actionBtn} ${styles.blowBtn}`}
                onClick={handleBlowCandles}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <span>🌬️</span> Make a Wish & Blow!
              </motion.button>
            )}

            {step === STEPS.DONE && (
              <motion.div
                key="done"
                className={styles.doneSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p className={styles.wishText}>
                  🌟 May all your wishes come true! 🌟
                </p>
                <button
                  className={`${styles.actionBtn} ${styles.nextBtn}`}
                  onClick={() => navigate('/memories')}
                >
                  <span>💌</span> See Our Memories
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Confetti on blow */}
      <ConfettiExplosion active={[STEPS.BLOWN, STEPS.DONE].includes(step)} />
    </div>
  )
}
