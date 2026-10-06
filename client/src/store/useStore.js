import { create } from 'zustand'
import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

// Attach token to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const useStore = create((set, get) => ({
  // ===== Settings =====
  settings: {},
  settingsLoaded: false,
  fetchSettings: async () => {
    try {
      const res = await API.get('/settings')
      set({ settings: res.data, settingsLoaded: true })
    } catch (err) {
      console.error('Failed to fetch settings', err)
    }
  },

  // ===== Memories =====
  memories: [],
  memoriesLoaded: false,
  fetchMemories: async (adminMode = false) => {
    try {
      const url = adminMode ? '/memories/all' : '/memories'
      const res = await API.get(url)
      set({ memories: res.data, memoriesLoaded: true })
    } catch (err) {
      console.error('Failed to fetch memories', err)
    }
  },

  createMemory: async (data) => {
    const res = await API.post('/memories', data)
    set(state => ({ memories: [...state.memories, res.data] }))
    return res.data
  },

  updateMemory: async (id, data) => {
    const res = await API.put(`/memories/${id}`, data)
    set(state => ({
      memories: state.memories.map(m => m.id === id ? res.data : m)
    }))
    return res.data
  },

  deleteMemory: async (id) => {
    await API.delete(`/memories/${id}`)
    set(state => ({
      memories: state.memories.filter(m => m.id !== id)
    }))
  },

  // ===== Auth =====
  admin: null,
  isAuthenticated: false,
  loginError: null,

  login: async (username, password) => {
    try {
      set({ loginError: null })
      const res = await API.post('/auth/login', { username, password })
      localStorage.setItem('adminToken', res.data.token)
      set({ admin: res.data.admin, isAuthenticated: true })
      return true
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed'
      set({ loginError: msg })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken')
    set({ admin: null, isAuthenticated: false })
  },

  verifyAuth: async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return false
      const res = await API.get('/auth/verify')
      set({ admin: res.data.admin, isAuthenticated: true })
      return true
    } catch {
      localStorage.removeItem('adminToken')
      set({ admin: null, isAuthenticated: false })
      return false
    }
  },

  updateSettings: async (newSettings) => {
    const res = await API.put('/settings', { settings: newSettings })
    set({ settings: res.data })
    return res.data
  },

  uploadPhoto: async (file) => {
    const formData = new FormData()
    formData.append('photo', file)
    const res = await API.post('/upload/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },
}))

export default useStore
export { API }
