import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import BirthdayHumanAnimations from './BirthdayHumanAnimations'

// Export canonical candle positions and total count so all components stay perfectly synchronized
export const CANDLE_POSITIONS = (() => {
  const positions = []
  const count = 5
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    positions.push({ x: Math.cos(angle) * 0.45, z: Math.sin(angle) * 0.45, delay: i * 0.3 })
  }
  positions.push({ x: 0, z: 0, delay: 0 })
  return positions
})()
export const TOTAL_CANDLES = CANDLE_POSITIONS.length

// Device capability and performance profile detector tailored for low-end mobile devices (Samsung Galaxy M02s priority)
export function getDeviceCapabilities() {
  if (typeof window === 'undefined') {
    return {
      isLowEnd: false,
      isMobile: false,
      targetDpr: 1.5,
      enableShadows: true,
      starCount: 800,
      fireworkCount: 160,
      antialias: true,
      precision: 'highp'
    }
  }

  const ua = navigator.userAgent || ''
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)
  const isSamsungM02s = /SM-M022|SM-A022|M02s|Galaxy M02/i.test(ua)
  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory || 4

  let isLowEndGpu = false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
        if (/PowerVR|GE8100|GE8300|GE8320|Adreno (30|40|50[456]|505)|Mali-T|Mali-G31|Mali-G51/i.test(renderer)) {
          isLowEndGpu = true
        }
      }
    }
  } catch (e) {}

  const isLowEnd = isSamsungM02s || isLowEndGpu || (isMobile && (cores <= 4 || memory <= 3))

  return {
    isLowEnd,
    isMobile,
    isSamsungM02s,
    targetDpr: isLowEnd ? 1.0 : (isMobile ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 1.5)),
    enableShadows: !isLowEnd && !isMobile,
    starCount: isLowEnd ? 300 : (isMobile ? 500 : 800),
    fireworkCount: isLowEnd ? 60 : (isMobile ? 100 : 160),
    antialias: !isLowEnd,
    precision: isLowEnd ? 'mediump' : 'highp'
  }
}

// Adaptive DPR helper
function AdaptiveDpr({ targetDpr, setDpr }) {
  const sampleRef = useRef({ elapsed: 0, frames: 0, lowSamples: 0 })

  useFrame((_, delta) => {
    const sample = sampleRef.current
    if (delta > 0.5) {
      sample.elapsed = 0
      sample.frames = 0
      return
    }
    sample.elapsed += delta
    sample.frames += 1
    if (sample.elapsed < 1.2) return

    const fps = sample.frames / sample.elapsed
    sample.elapsed = 0
    sample.frames = 0
    if (fps < 42) {
      sample.lowSamples += 1
      if (sample.lowSamples >= 1) {
        setDpr(current => Math.max(0.75, current - 0.15))
        sample.lowSamples = 0
      }
    } else {
      sample.lowSamples = 0
    }
  })

  return null
}

// Shared static geometries and materials for cake components to eliminate runtime allocations
const pearlGeometry = new THREE.SphereGeometry(0.05, 8, 8)
const goldPearlMaterial = new THREE.MeshStandardMaterial({
  color: '#ffd700',
  emissive: '#ff8800',
  emissiveIntensity: 0.5,
  metalness: 0.8,
  roughness: 0.2
})
const pinkPearlMaterial = new THREE.MeshStandardMaterial({
  color: '#ff6b9d',
  emissive: '#c44569',
  emissiveIntensity: 0.5,
  metalness: 0.8,
  roughness: 0.2
})

const candleBodyGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 10)
const candleWickGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.04, 6)
const outerFlameGeometry = new THREE.ConeGeometry(0.06, 0.2, 8)
const innerFlameGeometry = new THREE.ConeGeometry(0.03, 0.14, 8)

const candleBodyMaterial = new THREE.MeshStandardMaterial({ color: '#fff' })
const candleWickMaterial = new THREE.MeshStandardMaterial({ color: '#333' })
const outerFlameMaterial = new THREE.MeshStandardMaterial({
  color: '#ff9500',
  emissive: '#ff6600',
  emissiveIntensity: 2.2,
  transparent: true,
  opacity: 0.9
})
const innerFlameMaterial = new THREE.MeshStandardMaterial({
  color: '#ffff00',
  emissive: '#ffffff',
  emissiveIntensity: 3.2,
  transparent: true,
  opacity: 0.95
})

const plateGeometry = new THREE.CylinderGeometry(1.4, 1.4, 0.06, 28)
const plateMaterial = new THREE.MeshStandardMaterial({ color: '#fff', metalness: 0.3, roughness: 0.4 })

// Stars background
function Stars({ count = 800 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 80
      arr[i * 3 + 1] = (Math.random() - 0.5) * 80
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return arr
  }, [count])
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#ffffff" transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

// Single cake layer with memoized geometries
function CakeLayer({ y, radius, height, color, emissive, enableShadows }) {
  const cylinderGeo = useMemo(() => new THREE.CylinderGeometry(radius, radius + 0.05, height, 28), [radius, height])
  const torusGeo = useMemo(() => new THREE.TorusGeometry(radius + 0.02, 0.06, 8, 28), [radius])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 0.2, metalness: 0.1, roughness: 0.6 }), [color, emissive])
  const frostingMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 'white', emissive: '#ffccdd', emissiveIntensity: 0.3 }), [])

  return (
    <group position={[0, y, 0]}>
      <mesh castShadow={enableShadows} receiveShadow={enableShadows} geometry={cylinderGeo} material={mat} />
      <mesh position={[0, height / 2, 0]} geometry={torusGeo} material={frostingMat} />
    </group>
  )
}

// Pearl decorations around a layer using shared geometry and materials
function Decorations({ radius, y }) {
  const count = 10
  const pearls = useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      arr.push({
        position: [Math.cos(angle) * (radius - 0.1), 0, Math.sin(angle) * (radius - 0.1)],
        isGold: i % 2 === 0
      })
    }
    return arr
  }, [radius])

  return (
    <group position={[0, y, 0]}>
      {pearls.map((p, i) => (
        <mesh
          key={i}
          position={p.position}
          geometry={pearlGeometry}
          material={p.isGold ? goldPearlMaterial : pinkPearlMaterial}
        />
      ))}
    </group>
  )
}

// Individual candle with synchronized flame animation
function Candle({ x, z, delay, isLit, blowing }) {
  const flameGroupRef = useRef()

  useFrame((state) => {
    if (!isLit || !flameGroupRef.current) return
    const t = state.clock.elapsedTime + delay
    const fg = flameGroupRef.current
    fg.scale.x = blowing ? 0.62 + Math.sin(t * 25) * 0.18 : 0.8 + Math.sin(t * 8) * 0.3
    fg.scale.y = blowing ? 0.72 + Math.sin(t * 19) * 0.16 : 0.9 + Math.sin(t * 6 + 1) * 0.2
    fg.position.y = 0.38 + Math.sin(t * (blowing ? 24 : 9)) * (blowing ? 0.055 : 0.03)
    fg.rotation.z = blowing ? 0.72 + Math.sin(t * 17) * 0.2 : Math.sin(t * 3) * 0.07
  })

  return (
    <group position={[x, 0, z]}>
      {/* Body */}
      <mesh position={[0, 0.15, 0]} geometry={candleBodyGeometry} material={candleBodyMaterial} />
      {/* Wick */}
      <mesh position={[0, 0.31, 0]} geometry={candleWickGeometry} material={candleWickMaterial} />
      {isLit && (
        <group ref={flameGroupRef} position={[0, 0.38, 0]}>
          {/* Outer flame */}
          <mesh geometry={outerFlameGeometry} material={outerFlameMaterial} />
          {/* Inner flame */}
          <mesh geometry={innerFlameGeometry} material={innerFlameMaterial} />
        </group>
      )}
    </group>
  )
}

// Full cake scene
function CakeScene({ litCount, blowing, step, enableShadows }) {
  const groupRef = useRef()
  const floatRef = useRef()

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.15
    if (floatRef.current) floatRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3
  })

  return (
    <group ref={floatRef}>
      <group ref={groupRef} scale={0.9}>
        {/* Bottom tier */}
        <CakeLayer y={0} radius={1.2} height={0.55} color="#c44569" emissive="#8b1a42" enableShadows={enableShadows} />
        <Decorations radius={1.2} y={0.28} />
        {/* Middle tier */}
        <CakeLayer y={0.6} radius={0.9} height={0.45} color="#ff6b9d" emissive="#c44569" enableShadows={enableShadows} />
        <Decorations radius={0.9} y={0.85} />
        {/* Top tier */}
        <CakeLayer y={1.12} radius={0.6} height={0.38} color="#f8a5c2" emissive="#ff6b9d" enableShadows={enableShadows} />
        {/* All Candles: guaranteed extinguished when done or litCount is lower */}
        {CANDLE_POSITIONS.map((c, i) => (
          <group key={i} position={[0, 1.35, 0]}>
            <Candle
              x={c.x}
              z={c.z}
              delay={c.delay}
              isLit={step !== 'done' && i < litCount}
              blowing={blowing}
            />
          </group>
        ))}
        {/* Plate */}
        <mesh position={[0, -0.05, 0]} geometry={plateGeometry} material={plateMaterial} receiveShadow={enableShadows} />
      </group>
    </group>
  )
}

// Fireworks particles
function Fireworks({ active, count = 100 }) {
  const meshRef = useRef()

  const initialPos = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) { pos[i * 3] = 0; pos[i * 3 + 1] = 2; pos[i * 3 + 2] = 0 }
    return pos
  }, [count])

  const velocities = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 4,
    y: Math.random() * 4 + 1,
    z: (Math.random() - 0.5) * 4,
    gravity: -2
  })), [count])

  const currentPos = useRef(new Float32Array(initialPos))
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    if (!active || !meshRef.current) return
    timeRef.current += delta
    for (let i = 0; i < count; i++) {
      const v = velocities[i]
      currentPos.current[i * 3] += v.x * delta
      currentPos.current[i * 3 + 1] += (v.y + v.gravity * timeRef.current) * delta
      currentPos.current[i * 3 + 2] += v.z * delta
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  if (!active) return null

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={currentPos.current} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#ffd700" transparent opacity={0.9} />
    </points>
  )
}

export default function BirthdayCake3D({
  litCount = 0,
  blowing = false,
  showFireworks = false,
  lighting = false,
  showGirl = false,
  step = ''
}) {
  const devicePerf = useMemo(() => getDeviceCapabilities(), [])
  const [dpr, setDpr] = useState(devicePerf.targetDpr)

  return (
    <div style={{ width: '100%', maxWidth: '700px', height: 'clamp(200px, 48vh, 460px)', maxHeight: '50vh', margin: '0 auto', position: 'relative', cursor: 'grab' }}>
      <Canvas
        camera={{ position: [0, 2.15, 3.5], fov: 42 }}
        onCreated={({ camera }) => camera.lookAt(0, 0.7, 0)}
        gl={{
          antialias: devicePerf.antialias,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          precision: devicePerf.precision
        }}
        dpr={dpr}
        shadows={devicePerf.enableShadows}
        style={{ width: '100%', height: '100%', display: 'block', margin: '0 auto', background: 'transparent' }}
      >
        <AdaptiveDpr targetDpr={devicePerf.targetDpr} setDpr={setDpr} />
        <ambientLight intensity={0.5} />
        {/* Key light: Directional with shadow on desktop, performant point light without shadows on low-end mobile */}
        {devicePerf.enableShadows ? (
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[512, 512]}
            color="#fff5f0"
          />
        ) : (
          <pointLight position={[5, 8, 5]} intensity={1.2} color="#fff5f0" />
        )}
        <pointLight position={[-5, 5, -3]} intensity={0.6} color="#ff6b9d" />
        <pointLight position={[0, -2, 4]} intensity={0.4} color="#ffd700" />
        {/* Consolidated candle glow: illuminates cake top, hand, and girl realistically, scaling smoothly with litCount */}
        <pointLight
          position={[0, 1.85, 0]}
          intensity={litCount > 0 ? (blowing ? 1.6 : 2.2) * (litCount / TOTAL_CANDLES) : 0}
          distance={4.5}
          color="#ff8800"
        />
        <Stars count={devicePerf.starCount} />
        <CakeScene litCount={litCount} blowing={blowing} step={step} enableShadows={devicePerf.enableShadows} />
        <BirthdayHumanAnimations litCount={litCount} lighting={lighting} showGirl={showGirl} blowing={blowing} />
        <Fireworks active={showFireworks} count={devicePerf.fireworkCount} />
      </Canvas>
    </div>
  )
}
