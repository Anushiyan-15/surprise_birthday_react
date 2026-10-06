import { useEffect, useRef } from 'react'

const EMOJIS = ['❤️', '🌹', '✨', '💫', '🌸', '💕', '🎀', '⭐', '🌙', '💖', '🦋', '🌺']

export default function FloatingParticles() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const particles = []

    function createParticle() {
      const el = document.createElement('div')
      el.className = 'particle'
      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        font-size: ${Math.random() * 16 + 10}px;
        animation-duration: ${Math.random() * 8 + 6}s;
        animation-delay: ${Math.random() * 4}s;
        opacity: ${Math.random() * 0.5 + 0.3};
      `
      container.appendChild(el)
      particles.push(el)

      setTimeout(() => {
        if (container.contains(el)) container.removeChild(el)
        const idx = particles.indexOf(el)
        if (idx > -1) particles.splice(idx, 1)
      }, 14000)
    }

    // Create initial burst
    for (let i = 0; i < 12; i++) {
      setTimeout(() => createParticle(), i * 200)
    }

    // Keep creating particles
    const interval = setInterval(createParticle, 1500)

    return () => {
      clearInterval(interval)
      particles.forEach(p => {
        if (container.contains(p)) container.removeChild(p)
      })
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    />
  )
}
