import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Floating / bobbing animation hook
function useFloat(speed = 1.5, intensity = 0.5) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * speed) * intensity
    }
  })
  return ref
}

// Star field background
function Stars({ count = 1500 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 80
      arr[i * 3 + 1] = (Math.random() - 0.5) * 80
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return arr
  }, [count])

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const col1 = new THREE.Color('#ff6b9d')
    const col2 = new THREE.Color('#ffd700')
    const white = new THREE.Color('#ffffff')
    for (let i = 0; i < count; i++) {
      const pick = Math.random()
      const c = pick < 0.5 ? white : pick < 0.75 ? col1 : col2
      arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b
    }
    return arr
  }, [count])

  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

// Ambient particles
function Particles({ count = 80 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return arr
  }, [count])

  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#ff6b9d" transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

// Heart mesh using ExtrudeGeometry
function HeartMesh() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const x = 0, y = 0
    shape.moveTo(x + 0.5, y + 0.5)
    shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y)
    shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7)
    shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9)
    shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7)
    shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y)
    shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5)

    const extrudeSettings = {
      steps: 2, depth: 0.35, bevelEnabled: true,
      bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 6
    }
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geo.computeBoundingBox()
    const bb = geo.boundingBox
    const cx = -(bb.max.x + bb.min.x) / 2
    const cy = -(bb.max.y + bb.min.y) / 2
    const cz = -(bb.max.z + bb.min.z) / 2
    geo.translate(cx, cy, cz)
    return geo
  }, [])

  const meshRef = useRef()
  const floatRef = useFloat(1.5, 0.5)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.4
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04
      meshRef.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={floatRef}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#ff6b9d"
          emissive="#c44569"
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

export default function Heart3D({ height = 'clamp(250px, 42vw, 420px)' }) {
  return (
    <div style={{ width: '100%', height, maxHeight: '55vh', cursor: 'grab' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#ff6b9d" />
        <pointLight position={[-5, -5, 5]} intensity={0.8} color="#ffd700" />
        <pointLight position={[0, -5, 3]} intensity={0.6} color="#c44569" />
        <spotLight position={[0, 10, 5]} angle={0.3} penumbra={0.8} intensity={2} color="#f8a5c2" />
        <Stars count={1500} />
        <Particles count={80} />
        <HeartMesh />
      </Canvas>
    </div>
  )
}
