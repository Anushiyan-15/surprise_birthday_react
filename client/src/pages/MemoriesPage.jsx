import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../store/useStore'
import { ThreeMotion, ThreeAnimatePresence } from '../components/ThreeAnimationSystem'
import styles from './MemoriesPage.module.css'

const SERVER_URL = ''  // Vite proxy handles /uploads

function makeHeartGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(0, -0.28)
  shape.bezierCurveTo(-0.08, -0.12, -0.42, 0.08, -0.42, 0.32)
  shape.bezierCurveTo(-0.42, 0.62, -0.04, 0.68, 0, 0.38)
  shape.bezierCurveTo(0.04, 0.68, 0.42, 0.62, 0.42, 0.32)
  shape.bezierCurveTo(0.42, 0.08, 0.08, -0.12, 0, -0.28)
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.035, bevelThickness: 0.035, curveSegments: 12 })
  geometry.center()
  return geometry
}

function SparkParticles({ count }) {
  const points = useRef()
  const data = useMemo(() => Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 1.1 + Math.random() * 3.8
    return { x: 0, y: 0, z: (Math.random() - 0.5) * 0.7, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, vz: (Math.random() - 0.5) * 2.4, life: 0.65 + Math.random() * 1.35, delay: Math.random() * 0.34 }
  }), [count])
  const positions = useMemo(() => new Float32Array(count * 3), [count])
  const colors = useMemo(() => {
    const palette = ['#ffe7a3', '#ffd166', '#ff79a9', '#fff8f0', '#ff9c91']
    const values = new Float32Array(count * 3)
    const color = new THREE.Color()
    for (let i = 0; i < count; i++) {
      color.set(palette[i % palette.length])
      color.toArray(values, i * 3)
    }
    return values
  }, [count])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    data.forEach((p, i) => {
      const age = Math.max(0, t - p.delay)
      const alive = age < p.life
      const drag = Math.min(age, 1)
      positions[i * 3] = alive ? p.x + p.vx * drag : 0
      positions[i * 3 + 1] = alive ? p.y + p.vy * drag - age * age * 0.7 : 0
      positions[i * 3 + 2] = alive ? p.z + p.vz * drag : -100
    })
    if (points.current) points.current.geometry.attributes.position.needsUpdate = true
  })

  return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /><bufferAttribute attach="attributes-color" args={[colors, 3]} /></bufferGeometry><pointsMaterial size={0.055} vertexColors transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation /></points>
}

function BurstFlash() {
  const core = useRef()
  const halo = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const expansion = 0.08 + Math.min(t, 0.22) * 8
    if (core.current) {
      core.current.scale.setScalar(expansion)
      core.current.material.opacity = Math.max(0, 1 - t * 2.2)
    }
    if (halo.current) {
      halo.current.scale.setScalar(expansion * 2.5)
      halo.current.material.opacity = Math.max(0, 0.55 - t * 1.45)
    }
  })
  return <group><mesh ref={halo}><sphereGeometry args={[0.24, 16, 12]} /><meshBasicMaterial color="#ff8db8" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh><mesh ref={core}><sphereGeometry args={[0.18, 16, 12]} /><meshBasicMaterial color="#fff5d6" transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh></group>
}

function FloatingHearts({ count }) {
  const group = useRef()
  const geometry = useMemo(makeHeartGeometry, [])
  const hearts = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: (Math.random() - 0.5) * 4.8, y: (Math.random() - 0.4) * 2.8, z: (Math.random() - 0.5) * 3,
    scale: 0.09 + Math.random() * 0.19, speed: 0.25 + Math.random() * 0.45, phase: Math.random() * Math.PI * 2,
    color: ['#ff6b9d', '#f8a5c2', '#fff3f7', '#ffd166', '#e94b78'][i % 5],
  })), [count])
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    group.current.children.forEach((heart, i) => {
      const p = hearts[i]
      heart.position.y = p.y + Math.sin(t * p.speed + p.phase) * 0.22 + (t * p.speed * 0.18) % 0.7
      heart.position.x = p.x + Math.sin(t * 0.45 + p.phase) * 0.16
      heart.rotation.set(Math.sin(t * 0.8 + p.phase) * 0.32, t * p.speed + p.phase, Math.cos(t * 0.6 + p.phase) * 0.3)
      heart.material.opacity = Math.min(1, Math.max(0, (8 - t) / 1.4))
    })
  })
  return <group ref={group}>{hearts.map((heart, i) => <mesh key={i} geometry={geometry} position={[heart.x, heart.y, heart.z]} scale={heart.scale}><meshStandardMaterial color={heart.color} emissive={heart.color} emissiveIntensity={0.55} metalness={0.18} roughness={0.28} transparent opacity={0.95} /></mesh>)}</group>
}

function LetterMagicScene() {
  const count = typeof window !== 'undefined' && window.innerWidth < 600 ? 90 : 170
  return <Canvas camera={{ position: [0, 0, 8], fov: 48 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: false }}><ambientLight intensity={1.6} /><pointLight position={[0, 0, 3]} intensity={18} color="#ffd6e5" /><BurstFlash /><SparkParticles count={count} /><FloatingHearts count={18} /></Canvas>
}

function SlideshowDustPoints() {
  const points = useRef()
  const count = 24
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2
    }
    return arr
  }, [])
  useFrame(state => {
    const t = state.clock.getElapsedTime()
    if (!points.current) return
    const pos = points.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.003
      pos[i * 3] += Math.cos(t * 0.3 + i) * 0.002
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })
  return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry><pointsMaterial size={0.08} color="#ffd9a0" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} /></points>
}

function SlideshowDust() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true }}>
        <SlideshowDustPoints />
      </Canvas>
    </div>
  )
}

function BirthdayLetter({ settings, isOpen, onToggle }) {
  const [showMagic, setShowMagic] = useState(false)
  const [opening, setOpening] = useState(false)
  const busy = useRef(false)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const handleToggle = () => {
    if (isOpen || busy.current) return
    busy.current = true
    setOpening(true)
    setShowMagic(true)
    const revealTimer = window.setTimeout(() => {
      onToggle()
      setOpening(false)
      window.setTimeout(() => { busy.current = false }, 500)
    }, 1050)
    const magicTimer = window.setTimeout(() => setShowMagic(false), 8200)
    timers.current.push(revealTimer, magicTimer)
  }

  return (
    <ThreeMotion.div className={styles.letterWrapper} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
      {showMagic && <div className={styles.letterMagicLayer} aria-hidden="true"><LetterMagicScene /></div>}
      <ThreeMotion.div className={`${styles.letterEnvelope} ${opening ? styles.envelopeOpening : ''} ${isOpen ? styles.letterOpen : ''}`} onClick={handleToggle} whileHover={{ scale: isOpen || opening ? 1 : 1.02 }} whileTap={{ scale: isOpen || opening ? 1 : 0.98 }}>
        {!isOpen ? (
          <div className={styles.envelopeContent}>
            <div className={styles.envelopeFlap} />
            <div className={styles.envelopeBody}>
              <ThreeMotion.span className={styles.envelopeIcon} bounce={{ frequency: 3, amplitude: 6 }}>💌</ThreeMotion.span>
              <p className={styles.envelopeHint}>Click to open your letter</p>
              <p className={styles.envelopeFrom}>From: {settings.from_name || 'Your Partner'} with ❤️</p>
            </div>
          </div>
        ) : (
          <ThreeMotion.div className={styles.letterContent} initial={{ opacity: 0, y: 38, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.85 }}>
            <div className={styles.letterHeader}>
              <span className={styles.letterIcon}>💌</span>
              <h2 className={styles.letterTitle}>My Dearest {settings.birthday_person_name || 'Love'},</h2>
            </div>
            <div className={styles.letterBody}>{(settings.birthday_letter || '').split('\n').map((para, i) => <p key={i} className={styles.letterParagraph}>{para}</p>)}</div>
            <div className={styles.letterSignature}><p>Forever yours,</p><p className={styles.signatureName}>{settings.from_name || 'Your Partner'} 💕</p></div>
          </ThreeMotion.div>
        )}
      </ThreeMotion.div>
    </ThreeMotion.div>
  )
}

function MemoryCard({ memory, index, isActive, onClick }) {
  const hasPhoto = memory.photo_url && memory.photo_url.trim()

  return (
    <ThreeMotion.div
      className={`${styles.memoryCard} ${isActive ? styles.memoryCardActive : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: isActive ? 1 : 1.03 }}
    >
      <div className={styles.memoryPhotoWrapper}>
        {hasPhoto ? (
          <img
            src={`${SERVER_URL}${memory.photo_url}`}
            alt={memory.title}
            className={styles.memoryPhoto}
            loading="lazy"
          />
        ) : (
          <div className={styles.memoryPhotoPlaceholder}>
            <span className={styles.placeholderEmoji}>📸</span>
            <span className={styles.placeholderText}>Our Memory</span>
          </div>
        )}
        <div className={styles.memoryOverlay} />
      </div>

      <div className={styles.memoryInfo}>
        <span className={styles.memoryNumber}>#{index + 1}</span>
        <h3 className={styles.memoryTitle}>{memory.title}</h3>
        {memory.date_of_memory && (
          <p className={styles.memoryDate}>
            📅 {new Date(memory.date_of_memory).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        )}
      </div>
    </ThreeMotion.div>
  )
}

function MemoryDetail({ memory }) {
  const hasPhoto = memory.photo_url && memory.photo_url.trim()

  return (
    <ThreeMotion.div
      className={styles.memoryDetail}
      key={memory.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4 }}
    >
      {hasPhoto ? (
        <div className={styles.detailPhotoWrapper}>
          <img
            src={`${SERVER_URL}${memory.photo_url}`}
            alt={memory.title}
            className={styles.detailPhoto}
          />
          <div className={styles.detailPhotoGlow} />
        </div>
      ) : (
        <div className={styles.detailPhotoPlaceholder}>
          <span>📷</span>
          <span>No photo yet</span>
        </div>
      )}
      <div className={styles.detailContent}>
        <h3 className={styles.detailTitle}>{memory.title}</h3>
        {memory.date_of_memory && (
          <p className={styles.detailDate}>
            📅 {new Date(memory.date_of_memory).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        )}
        <p className={styles.detailDescription}>{memory.description}</p>
      </div>
    </ThreeMotion.div>
  )
}

const SLIDESHOW_DURATION = 8500

function CinematicSlideshow({ memories, onClose }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [ending, setEnding] = useState(false)
  const [failedImages, setFailedImages] = useState(() => new Set())
  const [progressWidth, setProgressWidth] = useState(0)
  const touchStart = useRef(null)
  const slideStartTime = useRef(Date.now())
  const elapsedBeforePause = useRef(0)

  const memory = memories[index]
  const photoUrl = memory?.photo_url ? `${SERVER_URL}${memory.photo_url}` : ''
  const sceneStyle = index % 4

  const next = () => {
    if (ending) return
    if (index >= memories.length - 1) {
      setPlaying(false)
      setEnding(true)
      setProgressWidth(100)
    } else {
      setIndex(value => value + 1)
      slideStartTime.current = Date.now()
      elapsedBeforePause.current = 0
      setProgressWidth(0)
    }
  }

  const previous = () => {
    if (ending) {
      const lastIndex = Math.max(0, memories.length - 1)
      setEnding(false)
      setIndex(lastIndex)
      setPlaying(true)
      slideStartTime.current = Date.now()
      elapsedBeforePause.current = 0
      setProgressWidth(0)
    } else {
      setIndex(value => Math.max(0, value - 1))
      slideStartTime.current = Date.now()
      elapsedBeforePause.current = 0
      setProgressWidth(0)
    }
  }

  const replay = () => {
    setFailedImages(new Set())
    setIndex(0)
    setEnding(false)
    setPlaying(true)
    slideStartTime.current = Date.now()
    elapsedBeforePause.current = 0
    setProgressWidth(0)
  }

  const togglePlayback = () => {
    if (playing) elapsedBeforePause.current = Date.now() - slideStartTime.current
    else slideStartTime.current = Date.now() - elapsedBeforePause.current
    setPlaying(value => !value)
  }

  useEffect(() => {
    if (!playing || ending || !memories.length) return undefined
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - slideStartTime.current
      setProgressWidth(Math.min(100, (elapsed / SLIDESHOW_DURATION) * 100))
      if (elapsed < SLIDESHOW_DURATION) return
      if (index >= memories.length - 1) {
        setPlaying(false)
        setEnding(true)
        setProgressWidth(100)
      } else {
        slideStartTime.current = Date.now()
        elapsedBeforePause.current = 0
        setProgressWidth(0)
        setIndex(value => value + 1)
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [index, playing, ending, memories.length])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowRight') { event.preventDefault(); next() }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); previous() }
      else if (event.code === 'Space' && !['BUTTON', 'INPUT', 'TEXTAREA'].includes(event.target?.tagName)) {
        event.preventDefault()
        togglePlayback()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [index, ending, memories.length, onClose, playing])

  const onTouchStart = event => { touchStart.current = event.changedTouches[0].clientX }
  const onTouchEnd = event => {
    if (touchStart.current === null) return
    const movement = event.changedTouches[0].clientX - touchStart.current
    touchStart.current = null
    if (Math.abs(movement) > 55) (movement < 0 ? next : previous)()
  }

  const overlay = (
    <ThreeMotion.div className={styles.slideshowOverlay} role="dialog" aria-modal="true" aria-label="Cinematic memories slideshow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <header className={styles.slideshowHeader}>
        <span>{ending ? 'THE END' : `${index + 1} / ${memories.length}`}</span>
        <button className={styles.slideshowClose} onClick={onClose} aria-label="Close slideshow" title="Close (Esc)">×</button>
      </header>

      {!ending && memory && (
        <div className={styles.slideshowStage}>
          <SlideshowDust />
          <ThreeMotion.article key={memory.id} className={`${styles.slideshowScene} ${styles[`sceneStyle${sceneStyle}`]}`} initial={[
              { opacity: 0, y: 22, rotateX: 2 },
              { opacity: 0, x: 54, rotateY: -4 },
              { opacity: 0, y: -28, scale: 0.97, rotateX: -4 },
              { opacity: 0, scale: 0.985, rotateY: 3 },
            ][sceneStyle]} animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0 }} transition={{ duration: 0.9 }}>
              {photoUrl && !failedImages.has(memory.id) ? (
                <div className={styles.slideshowFrame}>
                  <div className={styles.slideshowBlurBackdrop} style={{ backgroundImage: `url("${photoUrl}")` }} aria-hidden="true" />
                  <img className={styles.slideshowImage} src={photoUrl} alt={memory.title || ''} onError={() => setFailedImages(current => new Set(current).add(memory.id))} />
                </div>
              ) : (
                <div className={styles.slideshowImageFallback}><span aria-hidden="true">♡</span><strong>{memory.title}</strong>{memory.photo_url && <small>The original photo could not be loaded.</small>}</div>
              )}
              <div className={styles.slideshowCaption}>
                {memory.date_of_memory && <p className={styles.slideshowDate}>{new Date(memory.date_of_memory).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                <h2>{memory.title}</h2>
                {memory.description && <p>{memory.description}</p>}
              </div>
          </ThreeMotion.article>
        </div>
      )}

      {ending && (
        <ThreeMotion.div className={styles.slideshowEnding} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          {memories[memories.length - 1]?.photo_url && !failedImages.has(memories[memories.length - 1].id) && <div className={styles.slideshowEndPhoto} style={{ backgroundImage: `url("${SERVER_URL}${memories[memories.length - 1].photo_url}")` }} aria-hidden="true" />}
          <ThreeMotion.span aria-hidden="true" pulse={{ frequency: 3, amplitude: 0.14 }}>✦</ThreeMotion.span>
          <p>Every Memory Tells a Story ❤️</p>
          <div className={styles.slideshowEndingActions}><button className={styles.slideshowReplay} onClick={replay}>↻ Replay Slideshow</button><button className={styles.slideshowReturn} onClick={onClose}>Close</button></div>
        </ThreeMotion.div>
      )}

      {!ending && memory && (
        <footer className={styles.slideshowFooter}>
          <div className={styles.slideshowProgress} aria-label={`Memory ${index + 1} of ${memories.length}`}>
            {memories.map((item, i) => (
              <span key={item.id}>
                <i
                  className={i < index ? styles.progressDone : ''}
                  style={{
                    width: i < index ? '100%' : (i === index ? `${progressWidth}%` : '0%'),
                    transition: i === index ? 'none' : 'width 0.2s'
                  }}
                />
              </span>
            ))}
          </div>
          <div className={styles.slideshowControls}>
            <button onClick={previous} disabled={index === 0} aria-label="Previous memory">‹ <span>Previous</span></button>
            <button className={styles.slideshowToggle} onClick={togglePlayback} aria-label={playing ? 'Pause slideshow' : 'Resume slideshow'}>{playing ? 'Ⅱ' : '▶'} <span>{playing ? 'Pause' : 'Resume'}</span></button>
            <button onClick={next} aria-label="Next memory"><span>Next</span> ›</button>
          </div>
        </footer>
      )}
    </ThreeMotion.div>
  )

  return createPortal(overlay, document.body)
}

export default function MemoriesPage() {
  const navigate = useNavigate()
  const settings = useStore(s => s.settings)
  const memories = useStore(s => s.memories)
  const fetchMemories = useStore(s => s.fetchMemories)
  const [letterOpen, setLetterOpen] = useState(false)
  const [activeMemory, setActiveMemory] = useState(null)
  const [showGallery, setShowGallery] = useState(false)
  const [showSlideshow, setShowSlideshow] = useState(false)

  useEffect(() => {
    fetchMemories()
  }, [])

  useEffect(() => {
    if (memories.length > 0 && !activeMemory) {
      setActiveMemory(memories[0])
    }
  }, [memories])

  const handleMemoryClick = (memory) => {
    setActiveMemory(memory)
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} />

      {/* Back button */}
      <ThreeMotion.button
        className={styles.backBtn}
        onClick={() => navigate('/birthday')}
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={styles.title}>Our Story 📖</h1>
          <p className={styles.subtitle}>
            Every moment with you is a treasure
          </p>
        </ThreeMotion.div>

        {/* Birthday Letter */}
        <BirthdayLetter
          settings={settings}
          isOpen={letterOpen}
          onToggle={() => setLetterOpen(v => !v)}
        />

        {/* Memories Gallery toggle */}
        {!showGallery && (
          <ThreeMotion.div
            className={styles.galleryToggle}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <ThreeMotion.button
              className={styles.galleryBtn}
              onClick={() => setShowGallery(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              <span>📸</span> View Our Memories ({memories.length})
            </ThreeMotion.button>
          </ThreeMotion.div>
        )}

        {/* Gallery section */}
        <ThreeAnimatePresence>
          {showGallery && memories.length > 0 && (
            <ThreeMotion.div
              className={styles.gallerySection}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={styles.galleryHeading}>
                <h2 className={styles.galleryTitle}>💕 Our Memories Together</h2>
                <ThreeMotion.button className={styles.slideshowLaunch} onClick={() => setShowSlideshow(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}><span aria-hidden="true">▶</span> Play Slideshow</ThreeMotion.button>
              </div>
              <div className={styles.galleryGrid}>
                <div className={styles.memoryList}>
                  {memories.map((memory, index) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      index={index}
                      isActive={activeMemory?.id === memory.id}
                      onClick={() => handleMemoryClick(memory)}
                    />
                  ))}
                </div>
                <div className={styles.memoryDetailPanel}>
                  <ThreeAnimatePresence mode="wait">
                    {activeMemory && <MemoryDetail key={activeMemory.id} memory={activeMemory} />}
                  </ThreeAnimatePresence>
                </div>
              </div>
            </ThreeMotion.div>
          )}

          {showGallery && memories.length === 0 && (
            <ThreeMotion.div
              className={styles.emptyMemories}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className={styles.emptyIcon}>🌹</span>
              <p>Our memories are being added soon...</p>
              <p className={styles.emptyHint}>Ask the creator to add your photos!</p>
              <button className={styles.slideshowLaunch} disabled>▶ Play Slideshow</button>
            </ThreeMotion.div>
          )}
        </ThreeAnimatePresence>

        {/* Footer */}
        <ThreeMotion.div
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className={styles.footerText}>
            ❤️ Made with love, just for you ❤️
          </p>
          <button
            className={styles.homeBtn}
            onClick={() => navigate('/')}
          >
            🏠 Back to Home
          </button>
        </ThreeMotion.div>
      </div>
      {showSlideshow && <CinematicSlideshow memories={memories} onClose={() => setShowSlideshow(false)} />}
    </div>
  )
}
