import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import styles from './MemoriesPage.module.css'

const SERVER_URL = ''  // Vite proxy handles /uploads

function BirthdayLetter({ settings, isOpen, onToggle }) {
  return (
    <motion.div
      className={styles.letterWrapper}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className={`${styles.letterEnvelope} ${isOpen ? styles.letterOpen : ''}`}
        onClick={onToggle}
        whileHover={{ scale: isOpen ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {!isOpen ? (
          <div className={styles.envelopeContent}>
            <div className={styles.envelopeFlap} />
            <div className={styles.envelopeBody}>
              <span className={styles.envelopeIcon}>💌</span>
              <p className={styles.envelopeHint}>Click to open your letter</p>
              <p className={styles.envelopeFrom}>
                From: {settings.from_name || 'Your Partner'} with ❤️
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            className={styles.letterContent}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.letterHeader}>
              <span className={styles.letterIcon}>💌</span>
              <h2 className={styles.letterTitle}>
                My Dearest {settings.birthday_person_name || 'Love'},
              </h2>
            </div>
            <div className={styles.letterBody}>
              {(settings.birthday_letter || '').split('\n').map((para, i) => (
                <p key={i} className={styles.letterParagraph}>{para}</p>
              ))}
            </div>
            <div className={styles.letterSignature}>
              <p>Forever yours,</p>
              <p className={styles.signatureName}>{settings.from_name || 'Your Partner'} 💕</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

function MemoryCard({ memory, index, isActive, onClick }) {
  const hasPhoto = memory.photo_url && memory.photo_url.trim()

  return (
    <motion.div
      className={`${styles.memoryCard} ${isActive ? styles.memoryCardActive : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: isActive ? 1 : 1.03 }}
      layout
    >
      {/* Photo or placeholder */}
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

      {/* Info */}
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
    </motion.div>
  )
}

function MemoryDetail({ memory }) {
  const hasPhoto = memory.photo_url && memory.photo_url.trim()

  return (
    <motion.div
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
    </motion.div>
  )
}

export default function MemoriesPage() {
  const navigate = useNavigate()
  const settings = useStore(s => s.settings)
  const memories = useStore(s => s.memories)
  const fetchMemories = useStore(s => s.fetchMemories)
  const [letterOpen, setLetterOpen] = useState(false)
  const [activeMemory, setActiveMemory] = useState(null)
  const [showGallery, setShowGallery] = useState(false)

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
      <motion.button
        className={styles.backBtn}
        onClick={() => navigate('/birthday')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        ← Back
      </motion.button>

      <div className={styles.content}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={styles.title}>Our Story 📖</h1>
          <p className={styles.subtitle}>
            Every moment with you is a treasure
          </p>
        </motion.div>

        {/* Birthday Letter */}
        <BirthdayLetter
          settings={settings}
          isOpen={letterOpen}
          onToggle={() => setLetterOpen(v => !v)}
        />

        {/* Memories Gallery toggle */}
        {!showGallery && (
          <motion.div
            className={styles.galleryToggle}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              className={styles.galleryBtn}
              onClick={() => setShowGallery(true)}
              whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(255,215,0,0.5)' }}
              whileTap={{ scale: 0.96 }}
            >
              <span>📸</span> View Our Memories ({memories.length})
            </motion.button>
          </motion.div>
        )}

        {/* Gallery section */}
        <AnimatePresence>
          {showGallery && memories.length > 0 && (
            <motion.div
              className={styles.gallerySection}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={styles.galleryTitle}>💕 Our Memories Together</h2>
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
                  <AnimatePresence mode="wait">
                    {activeMemory && <MemoryDetail key={activeMemory.id} memory={activeMemory} />}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {showGallery && memories.length === 0 && (
            <motion.div
              className={styles.emptyMemories}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className={styles.emptyIcon}>🌹</span>
              <p>Our memories are being added soon...</p>
              <p className={styles.emptyHint}>Ask the creator to add your photos!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
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
        </motion.div>
      </div>
    </div>
  )
}
