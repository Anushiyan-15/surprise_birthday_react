import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'
import styles from './AdminDashboard.module.css'

const TABS = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'letter', label: 'Birthday Letter', icon: '💌' },
  { id: 'memories', label: 'Memories & Photos', icon: '📸' },
  { id: 'design', label: 'Design & Theme', icon: '🎨' },
  { id: 'settings', label: 'Site Settings', icon: '⚙️' },
]

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      className={`${styles.toast} ${type === 'success' ? styles.toastSuccess : styles.toastError}`}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
    >
      {type === 'success' ? '✅' : '❌'} {message}
    </motion.div>
  )
}

// ===== Overview Tab =====
function OverviewTab({ settings, memories }) {
  const navigate = useNavigate()
  return (
    <div className={styles.overviewGrid}>
      <div className={styles.overviewCard}>
        <span className={styles.overviewIcon}>👤</span>
        <div>
          <p className={styles.overviewLabel}>Birthday Person</p>
          <p className={styles.overviewValue}>{settings.birthday_person_name || 'Not set'}</p>
        </div>
      </div>
      <div className={styles.overviewCard}>
        <span className={styles.overviewIcon}>💌</span>
        <div>
          <p className={styles.overviewLabel}>Letter Status</p>
          <p className={styles.overviewValue}>{settings.birthday_letter ? '✅ Written' : '❌ Not written'}</p>
        </div>
      </div>
      <div className={styles.overviewCard}>
        <span className={styles.overviewIcon}>📸</span>
        <div>
          <p className={styles.overviewLabel}>Total Memories</p>
          <p className={styles.overviewValue}>{memories.length} memories</p>
        </div>
      </div>
      <div className={styles.overviewCard}>
        <span className={styles.overviewIcon}>🎨</span>
        <div>
          <p className={styles.overviewLabel}>Theme</p>
          <p className={styles.overviewValue}>{settings.background_theme || 'Dark Purple'}</p>
        </div>
      </div>

      <div className={styles.previewLinks}>
        <h3 className={styles.previewTitle}>Preview Pages</h3>
        <div className={styles.previewBtns}>
          <button className={styles.previewBtn} onClick={() => window.open('/', '_blank')}>🏠 Landing Page</button>
          <button className={styles.previewBtn} onClick={() => window.open('/birthday', '_blank')}>🎂 Birthday Page</button>
          <button className={styles.previewBtn} onClick={() => window.open('/memories', '_blank')}>💌 Memories Page</button>
        </div>
      </div>
    </div>
  )
}

// ===== Letter Tab =====
function LetterTab({ settings, onSave, showToast }) {
  const [letter, setLetter] = useState(settings.birthday_letter || '')
  const [fromName, setFromName] = useState(settings.from_name || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLetter(settings.birthday_letter || '')
    setFromName(settings.from_name || '')
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ birthday_letter: letter, from_name: fromName })
      showToast('Letter saved! 💌', 'success')
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>💌 Birthday Letter</h2>
      <p className={styles.tabDescription}>Write a personal message that will appear in the envelope on the memories page.</p>

      <div className={styles.formGroup}>
        <label className={styles.label}>Your Name (From)</label>
        <input
          className={styles.input}
          value={fromName}
          onChange={e => setFromName(e.target.value)}
          placeholder="Your Partner"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Birthday Letter</label>
        <textarea
          className={styles.textarea}
          value={letter}
          onChange={e => setLetter(e.target.value)}
          placeholder="Write your heartfelt birthday message here..."
          rows={12}
        />
        <p className={styles.hint}>{letter.length} characters · Use new lines to create paragraphs</p>
      </div>

      <div className={styles.previewBox}>
        <p className={styles.previewLabel}>Preview:</p>
        <div className={styles.letterPreview}>
          <p className={styles.previewGreeting}>My Dearest {settings.birthday_person_name || 'Love'},</p>
          {letter.split('\n').map((p, i) => p && <p key={i} className={styles.previewText}>{p}</p>)}
          <p className={styles.previewSign}>Forever yours, <em>{fromName}</em> 💕</p>
        </div>
      </div>

      <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
        {saving ? '⏳ Saving...' : '💾 Save Letter'}
      </button>
    </div>
  )
}

// ===== Memory Form =====
function MemoryForm({ memory, onSave, onCancel, uploading, onUpload }) {
  const [title, setTitle] = useState(memory?.title || '')
  const [description, setDescription] = useState(memory?.description || '')
  const [photoUrl, setPhotoUrl] = useState(memory?.photo_url || '')
  const [date, setDate] = useState(memory?.date_of_memory || '')
  const [order, setOrder] = useState(memory?.display_order ?? 0)
  const [visible, setVisible] = useState(memory?.is_visible !== 0)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = await onUpload(file)
    if (url) setPhotoUrl(url)
  }

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        photo_url: photoUrl || null,
        date_of_memory: date || null,
        display_order: parseInt(order) || 0,
        is_visible: visible
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.memoryForm}>
      <h3 className={styles.formTitle}>{memory ? '✏️ Edit Memory' : '➕ Add New Memory'}</h3>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Title *</label>
          <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Our First Date" />
        </div>
        <div className={styles.formGroup} style={{ maxWidth: '140px' }}>
          <label className={styles.label}>Order</label>
          <input type="number" className={styles.input} value={order} onChange={e => setOrder(e.target.value)} min={0} />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Description</label>
        <textarea className={styles.textarea} value={description} onChange={e => setDescription(e.target.value)} placeholder="Write about this memory..." rows={3} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Date of Memory</label>
        <input type="date" className={styles.input} value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Photo</label>
        <div className={styles.photoUploadArea}>
          {photoUrl && (
            <div className={styles.photoPreviewWrapper}>
              <img src={photoUrl} alt="preview" className={styles.photoPreview} />
              <button className={styles.removePhoto} onClick={() => setPhotoUrl('')}>✕</button>
            </div>
          )}
          <div className={styles.uploadActions}>
            <button
              className={styles.uploadBtn}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? '⏳ Uploading...' : '📤 Upload Photo'}
            </button>
            <span className={styles.orDivider}>or</span>
            <input
              className={styles.input}
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="Paste photo URL"
            />
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
        </div>
      </div>

      <div className={styles.visibleToggle}>
        <label className={styles.toggleLabel}>
          <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} className={styles.checkbox} />
          <span>Visible to visitors</span>
        </label>
      </div>

      <div className={styles.formActions}>
        <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button className={styles.saveBtn} onClick={handleSubmit} disabled={saving || !title.trim()}>
          {saving ? '⏳ Saving...' : (memory ? '💾 Update Memory' : '✨ Add Memory')}
        </button>
      </div>
    </div>
  )
}

// ===== Memories Tab =====
function MemoriesTab({ memories, showToast }) {
  const createMemory = useStore(s => s.createMemory)
  const updateMemory = useStore(s => s.updateMemory)
  const deleteMemory = useStore(s => s.deleteMemory)
  const fetchMemories = useStore(s => s.fetchMemories)
  const uploadPhoto = useStore(s => s.uploadPhoto)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { fetchMemories(true) }, [])

  const handleUpload = async (file) => {
    setUploading(true)
    try {
      const data = await uploadPhoto(file)
      return data.url
    } catch {
      showToast('Photo upload failed', 'error')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleCreate = async (data) => {
    try {
      await createMemory(data)
      showToast('Memory added! 📸', 'success')
      setShowForm(false)
    } catch {
      showToast('Failed to create memory', 'error')
    }
  }

  const handleUpdate = async (data) => {
    try {
      await updateMemory(editing.id, data)
      showToast('Memory updated! ✨', 'success')
      setEditing(null)
    } catch {
      showToast('Failed to update', 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteMemory(id)
      showToast('Memory deleted', 'success')
      setConfirmDelete(null)
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>📸 Memories & Photos</h2>
          <p className={styles.tabDescription}>Add and manage the couple memories shown on the memories page.</p>
        </div>
        {!showForm && !editing && (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            ➕ Add Memory
          </button>
        )}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <MemoryForm
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
              uploading={uploading}
              onUpload={handleUpload}
            />
          </motion.div>
        )}

        {editing && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <MemoryForm
              memory={editing}
              onSave={handleUpdate}
              onCancel={() => setEditing(null)}
              uploading={uploading}
              onUpload={handleUpload}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory list */}
      {!showForm && !editing && (
        <div className={styles.memoryList}>
          {memories.length === 0 ? (
            <div className={styles.emptyState}>
              <span>📸</span>
              <p>No memories yet. Add your first one!</p>
            </div>
          ) : (
            memories.map(memory => (
              <div key={memory.id} className={styles.memoryItem}>
                <div className={styles.memoryThumb}>
                  {memory.photo_url ? (
                    <img src={memory.photo_url} alt={memory.title} className={styles.thumbImg} />
                  ) : (
                    <span className={styles.thumbPlaceholder}>📷</span>
                  )}
                </div>
                <div className={styles.memoryItemInfo}>
                  <div className={styles.memoryItemRow}>
                    <h4 className={styles.memoryItemTitle}>{memory.title}</h4>
                    <span className={`${styles.visibilityBadge} ${memory.is_visible ? styles.badgeVisible : styles.badgeHidden}`}>
                      {memory.is_visible ? '👁 Visible' : '🚫 Hidden'}
                    </span>
                  </div>
                  <p className={styles.memoryItemDesc}>{memory.description}</p>
                  {memory.date_of_memory && (
                    <p className={styles.memoryItemDate}>📅 {new Date(memory.date_of_memory).toLocaleDateString()}</p>
                  )}
                </div>
                <div className={styles.memoryItemActions}>
                  <button className={styles.editBtn} onClick={() => setEditing(memory)}>✏️ Edit</button>
                  <button className={styles.deleteBtn} onClick={() => setConfirmDelete(memory.id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              className={styles.modalCard}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <span className={styles.modalIcon}>⚠️</span>
              <h3 className={styles.modalTitle}>Delete Memory?</h3>
              <p className={styles.modalText}>This action cannot be undone.</p>
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className={styles.deleteConfirmBtn} onClick={() => handleDelete(confirmDelete)}>Yes, Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ===== Design Tab =====
function DesignTab({ settings, onSave, showToast }) {
  const [primaryColor, setPrimaryColor] = useState(settings.primary_color || '#ff6b9d')
  const [secondaryColor, setSecondaryColor] = useState(settings.secondary_color || '#c44569')
  const [accentColor, setAccentColor] = useState(settings.accent_color || '#f8a5c2')
  const [fontFamily, setFontFamily] = useState(settings.font_family || 'Playfair Display')
  const [bgTheme, setBgTheme] = useState(settings.background_theme || 'dark-purple')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setPrimaryColor(settings.primary_color || '#ff6b9d')
    setSecondaryColor(settings.secondary_color || '#c44569')
    setAccentColor(settings.accent_color || '#f8a5c2')
    setFontFamily(settings.font_family || 'Playfair Display')
    setBgTheme(settings.background_theme || 'dark-purple')
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ primary_color: primaryColor, secondary_color: secondaryColor, accent_color: accentColor, font_family: fontFamily, background_theme: bgTheme })
      showToast('Design saved! 🎨', 'success')
    } catch {
      showToast('Failed to save design', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>🎨 Design & Theme</h2>
      <p className={styles.tabDescription}>Customize the look and feel of the birthday website.</p>

      <div className={styles.colorGrid}>
        {[
          { label: 'Primary Color', value: primaryColor, set: setPrimaryColor },
          { label: 'Secondary Color', value: secondaryColor, set: setSecondaryColor },
          { label: 'Accent Color', value: accentColor, set: setAccentColor },
        ].map(({ label, value, set }) => (
          <div key={label} className={styles.colorPicker}>
            <label className={styles.label}>{label}</label>
            <div className={styles.colorInputRow}>
              <input type="color" value={value} onChange={e => set(e.target.value)} className={styles.colorSwatch} />
              <input type="text" value={value} onChange={e => set(e.target.value)} className={styles.colorText} placeholder="#ff6b9d" />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Font Family</label>
        <select className={styles.input} value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
          <option>Playfair Display</option>
          <option>Dancing Script</option>
          <option>Georgia</option>
          <option>Times New Roman</option>
          <option>Lato</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Background Theme</label>
        <div className={styles.themeGrid}>
          {['dark-purple', 'midnight-blue', 'deep-rose', 'forest-night'].map(theme => (
            <div
              key={theme}
              className={`${styles.themeOption} ${bgTheme === theme ? styles.themeActive : ''}`}
              onClick={() => setBgTheme(theme)}
            >
              <div className={`${styles.themePreview} ${styles[theme.replace('-', '_')]}`} />
              <span>{theme.replace('-', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
        {saving ? '⏳ Saving...' : '💾 Save Design'}
      </button>
    </div>
  )
}

// ===== Settings Tab =====
function SettingsTab({ settings, onSave, showToast }) {
  const [name, setName] = useState(settings.birthday_person_name || '')
  const [siteTitle, setSiteTitle] = useState(settings.site_title || '')
  const [subtitle, setSubtitle] = useState(settings.landing_subtitle || '')
  const [candleCount, setCandleCount] = useState(settings.candle_count || '24')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPwd, setChangingPwd] = useState(false)
  const { API } = useStore.getState ? {} : {}

  useEffect(() => {
    setName(settings.birthday_person_name || '')
    setSiteTitle(settings.site_title || '')
    setSubtitle(settings.landing_subtitle || '')
    setCandleCount(settings.candle_count || '24')
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ birthday_person_name: name, site_title: siteTitle, landing_subtitle: subtitle, candle_count: candleCount })
      showToast('Settings saved! ⚙️', 'success')
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      showToast('Fill in both password fields', 'error')
      return
    }
    setChangingPwd(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      if (!res.ok) throw new Error()
      showToast('Password changed! 🔐', 'success')
      setCurrentPassword('')
      setNewPassword('')
    } catch {
      showToast('Failed to change password', 'error')
    } finally {
      setChangingPwd(false)
    }
  }

  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>⚙️ Site Settings</h2>
      <p className={styles.tabDescription}>Update personalization details and site configuration.</p>

      <div className={styles.settingsSection}>
        <h3 className={styles.sectionTitle}>Personalization</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Birthday Person's Name</label>
          <input className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="My Love" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Site Title (browser tab)</label>
          <input className={styles.input} value={siteTitle} onChange={e => setSiteTitle(e.target.value)} placeholder="Happy Birthday! 🎂" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Landing Page Subtitle</label>
          <input className={styles.input} value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="A special surprise just for you ✨" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Number of Candles on Cake</label>
          <input type="number" className={styles.input} value={candleCount} onChange={e => setCandleCount(e.target.value)} min={1} max={30} />
        </div>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? '⏳ Saving...' : '💾 Save Settings'}
        </button>
      </div>

      <div className={styles.settingsSection}>
        <h3 className={styles.sectionTitle}>Security</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Current Password</label>
          <input type="password" className={styles.input} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>New Password</label>
          <input type="password" className={styles.input} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" />
        </div>
        <button className={`${styles.saveBtn} ${styles.pwdBtn}`} onClick={handleChangePassword} disabled={changingPwd}>
          {changingPwd ? '⏳ Changing...' : '🔐 Change Password'}
        </button>
      </div>
    </div>
  )
}

// ===== Main Dashboard =====
export default function AdminDashboard() {
  const navigate = useNavigate()
  const admin = useStore(s => s.admin)
  const logout = useStore(s => s.logout)
  const settings = useStore(s => s.settings)
  const memories = useStore(s => s.memories)
  const updateSettings = useStore(s => s.updateSettings)
  const fetchSettings = useStore(s => s.fetchSettings)
  const fetchMemories = useStore(s => s.fetchMemories)

  const [activeTab, setActiveTab] = useState('overview')
  const [toasts, setToasts] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchMemories(true)
  }, [])

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
  }

  const removeToast = (id) => setToasts(t => t.filter(x => x.id !== id))

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className={styles.dashboard}>
      {/* Mobile Hamburger Button */}
      <button 
        className={styles.menuToggle} 
        onClick={() => setSidebarOpen(prev => !prev)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>🎂</span>
          <div>
            <p className={styles.sidebarTitle}>Birthday Admin</p>
            <p className={styles.sidebarUser}>@{admin?.username}</p>
          </div>
        </div>

        <nav className={styles.nav}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.navBtn} ${activeTab === tab.id ? styles.navBtnActive : ''}`}
              onClick={() => {
                setActiveTab(tab.id)
                setSidebarOpen(false)
              }}
            >
              <span className={styles.navIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.viewSiteBtn} onClick={() => window.open('/', '_blank')}>
            🌐 View Site
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.mainContent}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'overview' && <OverviewTab settings={settings} memories={memories} />}
              {activeTab === 'letter' && <LetterTab settings={settings} onSave={updateSettings} showToast={showToast} />}
              {activeTab === 'memories' && <MemoriesTab memories={memories} showToast={showToast} />}
              {activeTab === 'design' && <DesignTab settings={settings} onSave={updateSettings} showToast={showToast} />}
              {activeTab === 'settings' && <SettingsTab settings={settings} onSave={updateSettings} showToast={showToast} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Toast notifications */}
      <div className={styles.toastContainer}>
        <AnimatePresence>
          {toasts.map(t => (
            <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
