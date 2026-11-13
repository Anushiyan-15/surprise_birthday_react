import { useState, useEffect, useRef, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import BirthdayCake3D, { TOTAL_CANDLES } from '../components/BirthdayCake3D'
import { ThreeMotion, ThreeAnimatePresence, threeAnimationBus } from '../components/ThreeAnimationSystem'
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

export default function BirthdayPage() {
  const navigate = useNavigate()
  const settings = useStore(s => s.settings)
  const [step, setStep] = useState(STEPS.INTRO)
  const [litCount, setLitCount] = useState(0)
  const [message, setMessage] = useState('Click to reveal the cake! 🎂')

  const activeTimers = useRef([])
  const clearAllTimers = () => {
    activeTimers.current.forEach(t => clearTimeout(t))
    activeTimers.current = []
  }

  useEffect(() => {
    return () => clearAllTimers()
  }, [])

  const name = settings.birthday_person_name || 'My Love'

  const handleRevealCake = () => {
    clearAllTimers()
    setStep(STEPS.APPEARING)
    setMessage('✨ Your cake is appearing...')
    const timer = setTimeout(() => {
      setStep(STEPS.CAKE_READY)
      setMessage('🕯️ Now light the candles!')
    }, 1500)
    activeTimers.current.push(timer)
  }

  const handleLightCandles = () => {
    clearAllTimers()
    setLitCount(0)
    setStep(STEPS.LIGHTING)
    setMessage('🕯️ Lighting each candle with love...')

    for (let i = 1; i <= TOTAL_CANDLES; i++) {
      const timer = setTimeout(() => {
        setLitCount(i)
        if (i === TOTAL_CANDLES) {
          const finishTimer = setTimeout(() => {
            setStep(STEPS.LIT)
            setMessage('Make a wish and blow! 🌬️')
          }, 450)
          activeTimers.current.push(finishTimer)
        }
      }, i * 550)
      activeTimers.current.push(timer)
    }
  }

  const handleBlowCandles = () => {
    clearAllTimers()
    setStep(STEPS.BLOWN)
    setMessage('💨 She is blowing out your candles...')

    // Trigger 3D celebration confetti across the global Three.js canvas
    threeAnimationBus.triggerConfetti()

    // Detect all currently lit candles on the cake
    const countToExtinguish = litCount > 0 ? litCount : TOTAL_CANDLES

    // Synchronized blow extinguishing
    const blowStart = 1000
    const interval = Math.min(130, 650 / Math.max(1, countToExtinguish))

    for (let i = 1; i <= countToExtinguish; i++) {
      const remaining = countToExtinguish - i
      const timer = setTimeout(() => {
        setLitCount(remaining)
      }, blowStart + i * interval)
      activeTimers.current.push(timer)
    }

    const totalTime = blowStart + countToExtinguish * interval
    const doneTimer = setTimeout(() => {
      setLitCount(0) // GUARANTEED: all candles turn off completely
      setStep(STEPS.DONE)
      setMessage('🌟 Now see our memories together...')
      threeAnimationBus.triggerConfetti()
    }, totalTime + 350)
    activeTimers.current.push(doneTimer)
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} />

      {/* Back button */}
      <ThreeMotion.button
        className={styles.backBtn}
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        ← Back
      </ThreeMotion.button>

      <div className={styles.content}>
        {/* Header */}
        <ThreeMotion.div
          className={styles.header}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className={styles.nameLabel}>Happy Birthday,</p>
          <h1 className={styles.bigName}>{name}</h1>
          <div className={styles.divider}>
            {['❤️', '✨', '🌟', '✨', '❤️'].map((e, i) => (
              <ThreeMotion.span key={i} pulse={{ frequency: 2 + i * 0.4, amplitude: 0.08 }}>{e}</ThreeMotion.span>
            ))}
          </div>
        </ThreeMotion.div>

        {/* Status message */}
        <ThreeAnimatePresence mode="wait">
          <ThreeMotion.p
            key={message}
            className={styles.statusMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {message}
          </ThreeMotion.p>
        </ThreeAnimatePresence>

        {/* Cake area */}
        <div className={styles.cakeArea}>
          <ThreeAnimatePresence>
            {step === STEPS.INTRO && (
              <ThreeMotion.button
                className={styles.revealBtn}
                onClick={handleRevealCake}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                pulse={{ frequency: 3, amplitude: 0.03 }}
                transition={{ duration: 0.6 }}
              >
                <ThreeMotion.span className={styles.btnEmoji} bounce={{ frequency: 4.5, amplitude: 7 }}>🎂</ThreeMotion.span>
                <span>Click to Reveal Your Cake</span>
              </ThreeMotion.button>
            )}

            {step !== STEPS.INTRO && (
              <ThreeMotion.div
                className={styles.cakeWrapper}
                initial={{ opacity: 0, scale: 0.3, rotateX: -30 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ duration: 1 }}
              >
                <Suspense fallback={
                  <div className={styles.cakeLoading}>
                    <ThreeMotion.div className={styles.spinner} spin={{ speed: 450 }} />
                    <p>Baking your cake...</p>
                  </div>
                }>
                  <BirthdayCake3D
                    litCount={litCount}
                    blowing={step === STEPS.BLOWN}
                    showFireworks={[STEPS.BLOWN, STEPS.DONE].includes(step)}
                    lighting={step === STEPS.LIGHTING}
                    showGirl={[STEPS.BLOWN, STEPS.DONE].includes(step)}
                    step={step}
                  />
                </Suspense>
              </ThreeMotion.div>
            )}
          </ThreeAnimatePresence>
        </div>

        {/* Action buttons */}
        <div className={styles.actionArea}>
          <ThreeAnimatePresence mode="wait">
            {step === STEPS.CAKE_READY && (
              <ThreeMotion.button
                key="light"
                className={`${styles.actionBtn} ${styles.lightBtn}`}
                onClick={handleLightCandles}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <span>🕯️</span> Light the Candles
              </ThreeMotion.button>
            )}

            {step === STEPS.LIT && (
              <ThreeMotion.button
                key="blow"
                className={`${styles.actionBtn} ${styles.blowBtn}`}
                onClick={handleBlowCandles}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <span>🌬️</span> Make a Wish & Blow!
              </ThreeMotion.button>
            )}

            {step === STEPS.DONE && (
              <ThreeMotion.div
                key="done"
                className={styles.doneSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p className={styles.wishText}>
                  🌟 May all your wishes come true! 🌟
                </p>
                <ThreeMotion.button
                  className={`${styles.actionBtn} ${styles.nextBtn}`}
                  onClick={() => navigate('/memories')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>💌</span> See Our Memories
                </ThreeMotion.button>
              </ThreeMotion.div>
            )}
          </ThreeAnimatePresence>
        </div>
      </div>
    </div>
  )
}
