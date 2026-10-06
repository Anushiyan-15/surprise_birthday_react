import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Stars background
function Stars({ count = 1000 }) {
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
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02 })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#ffffff" transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

// Single cake layer
function CakeLayer({ y, radius, height, color, emissive }) {
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius + 0.05, height, 32]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.2} metalness={0.1} roughness={0.6} />
      </mesh>
      {/* Frosting ring */}
      <mesh position={[0, height / 2, 0]}>
        <torusGeometry args={[radius + 0.02, 0.06, 8, 32]} />
        <meshStandardMaterial color="white" emissive="#ffccdd" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

// Pearl decorations around a layer
function Decorations({ radius, y }) {
  const count = 10
  return (
    <group position={[0, y, 0]}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * (radius - 0.1), 0, Math.sin(angle) * (radius - 0.1)]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#ffd700' : '#ff6b9d'}
              emissive={i % 2 === 0 ? '#ff8800' : '#c44569'}
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Individual candle with flame
function Candle({ x, z, delay, isLit }) {
  const flameRef = useRef()
  const lightRef = useRef()
  useFrame((state) => {
    if (!isLit) return
    const t = state.clock.elapsedTime + delay
    if (flameRef.current) {
      flameRef.current.scale.x = 0.8 + Math.sin(t * 8) * 0.3
      flameRef.current.scale.y = 0.9 + Math.sin(t * 6 + 1) * 0.2
      flameRef.current.position.y = 0.28 + Math.sin(t * 9) * 0.03
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(t * 7) * 0.8
    }
  })

  return (
    <group position={[x, 0, z]}>
      {/* Body */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 12]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* Wick */}
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.04, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {isLit && (
        <>
          {/* Outer flame */}
          <mesh ref={flameRef} position={[0, 0.38, 0]}>
            <coneGeometry args={[0.06, 0.2, 8]} />
            <meshStandardMaterial color="#ff9500" emissive="#ff6600" emissiveIntensity={2} transparent opacity={0.9} />
          </mesh>
          {/* Inner flame */}
          <mesh position={[0, 0.38, 0]}>
            <coneGeometry args={[0.03, 0.14, 8]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffffff" emissiveIntensity={3} transparent opacity={0.95} />
          </mesh>
          <pointLight ref={lightRef} position={[0, 0.45, 0]} intensity={1.5} distance={2} color="#ff8800" />
        </>
      )}
    </group>
  )
}

// Full cake scene
function CakeScene({ candlesLit }) {
  const groupRef = useRef()
  const floatRef = useRef()

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.15
    if (floatRef.current) floatRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3
  })

  const candles = useMemo(() => {
    const positions = []
    const count = 5
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      positions.push({ x: Math.cos(angle) * 0.45, z: Math.sin(angle) * 0.45, delay: i * 0.3 })
    }
    positions.push({ x: 0, z: 0, delay: 0 })
    return positions
  }, [])

  return (
    <group ref={floatRef}>
      <group ref={groupRef}>
        {/* Bottom tier */}
        <CakeLayer y={0} radius={1.2} height={0.55} color="#c44569" emissive="#8b1a42" />
        <Decorations radius={1.2} y={0.28} />
        {/* Middle tier */}
        <CakeLayer y={0.6} radius={0.9} height={0.45} color="#ff6b9d" emissive="#c44569" />
        <Decorations radius={0.9} y={0.85} />
        {/* Top tier */}
        <CakeLayer y={1.12} radius={0.6} height={0.38} color="#f8a5c2" emissive="#ff6b9d" />
        {/* Candles */}
        {candles.map((c, i) => (
          <group key={i} position={[0, 1.35, 0]}>
            <Candle x={c.x} z={c.z} delay={c.delay} isLit={candlesLit} />
          </group>
        ))}
        {/* Plate */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[1.4, 1.4, 0.06, 32]} />
          <meshStandardMaterial color="#fff" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

// Fireworks particles
function Fireworks({ active }) {
  const count = 200
  const meshRef = useRef()

  const initialPos = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) { pos[i * 3] = 0; pos[i * 3 + 1] = 2; pos[i * 3 + 2] = 0 }
    return pos
  }, [])

  const velocities = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 4,
    y: Math.random() * 4 + 1,
    z: (Math.random() - 0.5) * 4,
    gravity: -2
  })), [])

  const currentPos = useRef(new Float32Array(initialPos))
  const timeRef = useRef(0)

  useFrame((state, delta) => {
    if (!active || !meshRef.current) return
    timeRef.current += delta
    for (let i = 0; i < count; i++) {
      const v = velocities[i]
      currentPos.current[i * 3] += v.x * delta
      currentPos.current[i * 3 + 1] += (v.y + v.gravity * timeRef.current) * delta
      currentPos.current[i * 3 + 2] += v.z * delta
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
    meshRef.current.geometry.attributes.position.array.set(currentPos.current)
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

export default function BirthdayCake3D({ candlesLit = false, showFireworks = false }) {
  return (
    <div style={{ width: '100%', height: 'clamp(280px, 48vw, 460px)', maxHeight: '55vh', cursor: 'grab' }}>
      <Canvas
        camera={{ position: [0, 2, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        shadows
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 8, 5]} intensity={1.5} castShadow color="#fff5f0" />
        <pointLight position={[-5, 5, -3]} intensity={0.8} color="#ff6b9d" />
        <pointLight position={[0, -2, 4]} intensity={0.5} color="#ffd700" />
        {candlesLit && <pointLight position={[0, 3.5, 0]} intensity={2} distance={6} color="#ff8800" />}
        <Stars count={1000} />
        <CakeScene candlesLit={candlesLit} />
        <Fireworks active={showFireworks} />
      </Canvas>
    </div>
  )
}
