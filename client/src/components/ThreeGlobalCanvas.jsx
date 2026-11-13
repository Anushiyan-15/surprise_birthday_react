import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { threeAnimationBus } from './ThreeAnimationSystem'

// Generate texture for emojis on offscreen canvas
function createEmojiTexture(char) {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 64, 64)
  ctx.font = '42px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(char, 32, 34)
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

const EMOJI_CHARS = ['❤️', '🌹', '✨', '💫', '🌸', '💕', '🎀', '⭐', '🌙', '💖', '🦋', '🌺', '♥', '✦']

// 1. Floating 3D Emojis and Hearts Particle System
function Floating3DParticles({ count = 18 }) {
  const groupRef = useRef()

  const textures = useMemo(() => {
    if (typeof window === 'undefined') return []
    return EMOJI_CHARS.map(char => createEmojiTexture(char))
  }, [])

  const materials = useMemo(() => {
    return textures.map(tex => new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.75, depthWrite: false }))
  }, [textures])

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 14,
      y: (Math.random() - 0.5) * 12,
      z: (Math.random() - 0.5) * 4,
      speed: 0.4 + Math.random() * 0.7,
      scale: 0.35 + Math.random() * 0.35,
      driftFreq: 0.5 + Math.random() * 0.8,
      driftPhase: Math.random() * Math.PI * 2,
      materialIndex: i % materials.length
    }))
  }, [count, materials])

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime()
    if (!groupRef.current) return

    groupRef.current.children.forEach((sprite, i) => {
      const p = particles[i]
      sprite.position.y += p.speed * delta
      sprite.position.x = p.x + Math.sin(elapsed * p.driftFreq + p.driftPhase) * 0.6

      // Reset to bottom when floating out of top view
      if (sprite.position.y > 7) {
        sprite.position.y = -7
        sprite.position.x = (Math.random() - 0.5) * 14
      }
    })
  })

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <sprite
          key={i}
          position={[p.x, p.y, p.z]}
          scale={[p.scale, p.scale, 1]}
          material={materials[p.materialIndex]}
        />
      ))}
    </group>
  )
}

// 2. Interactive 3D Touch/Pointer Spark System
function Interactive3DSparks({ maxSparks = 60 }) {
  const pointsRef = useRef()
  const data = useRef([])

  const positions = useMemo(() => new Float32Array(maxSparks * 3), [maxSparks])
  const colors = useMemo(() => new Float32Array(maxSparks * 3), [maxSparks])

  const colorPalette = useMemo(() => [
    new THREE.Color('#ffd700'),
    new THREE.Color('#ff6b9d'),
    new THREE.Color('#ffffff'),
    new THREE.Color('#f8a5c2')
  ], [])

  useEffect(() => {
    const unbind = threeAnimationBus.on('sparks', ({ x, y, count = 8 }) => {
      // Map screen coordinates (px) to 3D camera coordinates
      const ndcX = (x / window.innerWidth) * 2 - 1
      const ndcY = -(y / window.innerHeight) * 2 + 1
      const posX = ndcX * 7
      const posY = ndcY * 5

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1.2 + Math.random() * 3.5
        const c = colorPalette[Math.floor(Math.random() * colorPalette.length)]
        data.current.push({
          x: posX,
          y: posY,
          z: (Math.random() - 0.5) * 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          vz: (Math.random() - 0.5) * 2,
          life: 0.8 + Math.random() * 0.6,
          age: 0,
          color: c
        })
      }
      if (data.current.length > maxSparks) {
        data.current = data.current.slice(-maxSparks)
      }
    })
    return unbind
  }, [maxSparks, colorPalette])

  useFrame((_, delta) => {
    const alive = []
    for (let i = 0; i < maxSparks; i++) {
      if (i < data.current.length) {
        const p = data.current[i]
        p.age += delta
        p.x += p.vx * delta
        p.y += (p.vy - 3.5 * p.age) * delta
        p.z += p.vz * delta
        positions[i * 3] = p.x
        positions[i * 3 + 1] = p.y
        positions[i * 3 + 2] = p.z

        const alpha = Math.max(0, 1 - p.age / p.life)
        colors[i * 3] = p.color.r * alpha
        colors[i * 3 + 1] = p.color.g * alpha
        colors[i * 3 + 2] = p.color.b * alpha

        if (p.age < p.life) alive.push(p)
      } else {
        positions[i * 3] = 0
        positions[i * 3 + 1] = -100
        positions[i * 3 + 2] = 0
      }
    }
    data.current = alive
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true
      pointsRef.current.geometry.attributes.color.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={maxSparks} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={maxSparks} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.09} vertexColors transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  )
}

// 3. 3D Confetti Cannon Explosion
function Confetti3DScene({ maxConfetti = 70 }) {
  const groupRef = useRef()
  const activeConfetti = useRef([])

  const colors = useMemo(() => [
    '#ff6b9d', '#ffd700', '#f8a5c2', '#00d2d3', '#ff9f43', '#54a0ff', '#5f27cd'
  ], [])

  const geometry = useMemo(() => new THREE.PlaneGeometry(0.18, 0.18), [])
  const materials = useMemo(() => {
    return colors.map(c => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }))
  }, [colors])

  useEffect(() => {
    const unbind = threeAnimationBus.on('confetti', () => {
      activeConfetti.current = Array.from({ length: maxConfetti }, () => {
        const angle = Math.random() * Math.PI * 2
        return {
          x: (Math.random() - 0.5) * 8,
          y: 6 + Math.random() * 2,
          z: (Math.random() - 0.5) * 4,
          vx: Math.cos(angle) * (1.5 + Math.random() * 3),
          vy: -(2.5 + Math.random() * 3.5),
          vz: (Math.random() - 0.5) * 2,
          rotX: Math.random() * Math.PI,
          rotY: Math.random() * Math.PI,
          rotZ: Math.random() * Math.PI,
          rotSpeedX: 2 + Math.random() * 6,
          rotSpeedY: 2 + Math.random() * 6,
          matIndex: Math.floor(Math.random() * materials.length)
        }
      })
    })
    return unbind
  }, [maxConfetti, materials])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((mesh, i) => {
      const p = activeConfetti.current[i]
      if (!p) {
        mesh.visible = false
        return
      }
      mesh.visible = true
      p.x += p.vx * delta
      p.y += p.vy * delta
      p.z += p.vz * delta
      p.rotX += p.rotSpeedX * delta
      p.rotY += p.rotSpeedY * delta
      p.vx *= 0.98

      mesh.position.set(p.x, p.y, p.z)
      mesh.rotation.set(p.rotX, p.rotY, p.rotZ)

      if (p.y < -7) {
        mesh.visible = false
      }
    })
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: maxConfetti }).map((_, i) => (
        <mesh key={i} geometry={geometry} material={materials[i % materials.length]} visible={false} />
      ))}
    </group>
  )
}

// 4. Subtle Liquid Ambient Glow Orbs for Admin pages
function AmbientLiquidOrbs() {
  const orb1Ref = useRef()
  const orb2Ref = useRef()

  useFrame(state => {
    const t = state.clock.getElapsedTime()
    if (orb1Ref.current) {
      orb1Ref.current.position.x = Math.sin(t * 0.35) * 3
      orb1Ref.current.position.y = Math.cos(t * 0.42) * 2
      orb1Ref.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.15)
    }
    if (orb2Ref.current) {
      orb2Ref.current.position.x = -Math.cos(t * 0.28) * 3.5
      orb2Ref.current.position.y = -Math.sin(t * 0.38) * 2.2
      orb2Ref.current.scale.setScalar(1 + Math.cos(t * 0.6) * 0.12)
    }
  })

  return (
    <group position={[0, 0, -5]}>
      <mesh ref={orb1Ref} position={[-2, 1, 0]}>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshBasicMaterial color="#ff6b9d" transparent opacity={0.06} depthWrite={false} />
      </mesh>
      <mesh ref={orb2Ref} position={[2, -1, 0]}>
        <sphereGeometry args={[2.8, 16, 16]} />
        <meshBasicMaterial color="#54a0ff" transparent opacity={0.05} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function ThreeGlobalCanvas() {
  useEffect(() => {
    // Listen to touch/pointer on window and pass to 3D spark system
    let lastTime = 0
    const onPointerMove = e => {
      const now = performance.now()
      if (now - lastTime < 90) return
      lastTime = now
      threeAnimationBus.triggerSparks(e.clientX, e.clientY, 2)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <AmbientLiquidOrbs />
        <Floating3DParticles count={18} />
        <Interactive3DSparks maxSparks={60} />
        <Confetti3DScene maxConfetti={70} />
      </Canvas>
    </div>
  )
}
