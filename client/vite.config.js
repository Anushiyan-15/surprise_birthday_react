import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @mediapipe/tasks-vision only ships a .cjs bundle in this version
      '@mediapipe/tasks-vision': path.resolve(
        __dirname,
        'node_modules/@mediapipe/tasks-vision/vision_bundle.cjs'
      ),
    }
  },
  // Exclude problematic packages from pre-bundling
  optimizeDeps: {
    exclude: ['@react-spring/three', '@react-spring/core', '@react-spring/web'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
