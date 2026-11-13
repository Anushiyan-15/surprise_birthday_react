import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CANDLE_POSITIONS } from './BirthdayCake3D'

function createSkinTexture() {
  const width = 128
  const height = 128
  const data = new Uint8Array(width * height * 4)
  let seed = 90421
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4
      const grain = (random() - 0.5) * 12
      const warmVariation = Math.sin(x * 0.12) * 2 + Math.cos(y * 0.17) * 2
      data[index] = Math.max(0, Math.min(255, 190 + grain + warmVariation))
      data[index + 1] = Math.max(0, Math.min(255, 133 + grain * 0.72 + warmVariation))
      data[index + 2] = Math.max(0, Math.min(255, 105 + grain * 0.55))
      data[index + 3] = 255
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

const skinTexture = createSkinTexture()

// Optimized materials: MeshStandardMaterial provides rich PBR shading without the heavy clearcoat fragment shader penalty on mobile
const skinMaterial = new THREE.MeshStandardMaterial({
  map: skinTexture,
  bumpMap: skinTexture,
  bumpScale: 0.006,
  roughness: 0.62,
  metalness: 0
})
const handSkinMaterial = new THREE.MeshStandardMaterial({
  map: skinTexture,
  bumpMap: skinTexture,
  bumpScale: 0.008,
  roughness: 0.58,
  metalness: 0
})
const hairMaterial = new THREE.MeshStandardMaterial({ color: '#30201d', roughness: 0.48, metalness: 0 })
const hairHighlightMaterial = new THREE.MeshStandardMaterial({ color: '#56362d', roughness: 0.55 })
const dressMaterial = new THREE.MeshStandardMaterial({ color: '#783f60', roughness: 0.75 })
const dressTrimMaterial = new THREE.MeshStandardMaterial({ color: '#d5a15e', metalness: 0.55, roughness: 0.35 })
const shoeMaterial = new THREE.MeshStandardMaterial({ color: '#342632', roughness: 0.46 })
const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: '#f4eee9', roughness: 0.2 })
const irisMaterial = new THREE.MeshStandardMaterial({ color: '#65422f', roughness: 0.24 })
const pupilMaterial = new THREE.MeshBasicMaterial({ color: '#171216' })
const eyeGlintMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff' })
const lipMaterial = new THREE.MeshStandardMaterial({ color: '#9a4e55', roughness: 0.52 })
const mouthInteriorMaterial = new THREE.MeshStandardMaterial({ color: '#52212c', roughness: 0.7 })
const nostrilMaterial = new THREE.MeshStandardMaterial({ color: '#774a43', roughness: 0.7 })
const matchWoodMaterial = new THREE.MeshStandardMaterial({ color: '#d69a55', roughness: 0.76 })
const matchHeadMaterial = new THREE.MeshStandardMaterial({ color: '#d94f25', emissive: '#ff6a20', emissiveIntensity: 1.35, roughness: 0.35 })

const breathMaterials = Array.from({ length: 6 }, () =>
  new THREE.MeshBasicMaterial({ color: '#e5f5ff', transparent: true, opacity: 0, depthWrite: false })
)

const torsoProfile = [
  new THREE.Vector2(0, -0.18), new THREE.Vector2(0.15, -0.18), new THREE.Vector2(0.19, -0.06),
  new THREE.Vector2(0.18, 0.08), new THREE.Vector2(0.22, 0.2), new THREE.Vector2(0.205, 0.36),
  new THREE.Vector2(0.14, 0.48), new THREE.Vector2(0.075, 0.53), new THREE.Vector2(0, 0.53)
]
const shirtProfile = [
  new THREE.Vector2(0, -0.1), new THREE.Vector2(0.19, -0.1), new THREE.Vector2(0.2, 0.04),
  new THREE.Vector2(0.225, 0.2), new THREE.Vector2(0.2, 0.36), new THREE.Vector2(0.145, 0.48),
  new THREE.Vector2(0.075, 0.53), new THREE.Vector2(0, 0.53)
]
const skirtProfile = [
  new THREE.Vector2(0, -0.96), new THREE.Vector2(0.39, -0.96), new THREE.Vector2(0.42, -0.89),
  new THREE.Vector2(0.35, -0.63), new THREE.Vector2(0.28, -0.35), new THREE.Vector2(0.225, -0.13),
  new THREE.Vector2(0.19, -0.1), new THREE.Vector2(0, -0.1)
]
const headProfile = [
  new THREE.Vector2(0, -0.25), new THREE.Vector2(0.09, -0.245), new THREE.Vector2(0.15, -0.19),
  new THREE.Vector2(0.185, -0.08), new THREE.Vector2(0.19, 0.04), new THREE.Vector2(0.17, 0.16),
  new THREE.Vector2(0.12, 0.26), new THREE.Vector2(0.06, 0.305), new THREE.Vector2(0, 0.31)
]

const fingerLengths = [0.145, 0.16, 0.15, 0.125]
const fingerWidths = [0.017, 0.018, 0.016, 0.014]

// Static geometry cache: pre-instantiated ONCE to eliminate all CPU-bound geometry allocation spikes during animations
const geoCache = {
  // Hand
  forearm: new THREE.CapsuleGeometry(0.061, 0.54, 5, 12),
  wrist: new THREE.CapsuleGeometry(0.067, 0.09, 5, 10),
  palm: new THREE.SphereGeometry(1, 16, 12),
  thumbWeb: new THREE.CapsuleGeometry(0.021, 0.09, 5, 10),
  thumbSeg1: new THREE.CapsuleGeometry(0.019, 0.072, 5, 10),
  thumbJoint: new THREE.SphereGeometry(0.018, 10, 8),
  thumbSeg2: new THREE.CapsuleGeometry(0.015, 0.054, 5, 10),
  matchStick: new THREE.CylinderGeometry(0.008, 0.009, 0.26, 8),
  matchHead: new THREE.ConeGeometry(0.027, 0.075, 10),

  // Girl body & dress
  torso: new THREE.LatheGeometry(torsoProfile, 28),
  shirt: new THREE.LatheGeometry(shirtProfile, 28),
  skirt: new THREE.LatheGeometry(skirtProfile, 28),
  waistTrim: new THREE.TorusGeometry(0.198, 0.012, 6, 24),
  neck: new THREE.SphereGeometry(1, 14, 12),
  neckTrim: new THREE.TorusGeometry(0.095, 0.012, 6, 20),

  // Limbs
  armUpper: new THREE.CapsuleGeometry(0.064, 0.22, 5, 10),
  elbow: new THREE.SphereGeometry(0.064, 12, 10),
  forearmG: new THREE.CapsuleGeometry(0.052, 0.22, 5, 10),
  wristG: new THREE.SphereGeometry(1, 12, 10),
  handFinger: [
    new THREE.CapsuleGeometry(0.009, 0.055, 4, 6),
    new THREE.CapsuleGeometry(0.009, 0.051, 4, 6),
    new THREE.CapsuleGeometry(0.009, 0.047, 4, 6),
    new THREE.CapsuleGeometry(0.009, 0.043, 4, 6)
  ],
  thigh: new THREE.CapsuleGeometry(0.07, 0.09, 5, 10),
  shin: new THREE.CapsuleGeometry(0.052, 0.16, 5, 10),
  shoe: new THREE.SphereGeometry(1, 14, 10),

  // Head & face
  head: new THREE.LatheGeometry(headProfile, 28),
  ear: new THREE.SphereGeometry(1, 12, 10),
  hairCap: new THREE.SphereGeometry(0.205, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.58),
  hairBack: new THREE.SphereGeometry(1, 18, 14),
  hairLockL: new THREE.CapsuleGeometry(0.055, 0.36, 5, 10),
  hairLockR: new THREE.CapsuleGeometry(0.055, 0.36, 5, 10),
  hairPuffL: new THREE.SphereGeometry(1, 14, 10),
  hairPuffR: new THREE.SphereGeometry(1, 14, 10),
  eyeWhite: new THREE.SphereGeometry(1, 14, 10),
  iris: new THREE.SphereGeometry(1, 12, 10),
  pupil: new THREE.SphereGeometry(1, 10, 8),
  glint: new THREE.SphereGeometry(1, 8, 6),
  brow: new THREE.SphereGeometry(1, 10, 8),
  nose: new THREE.SphereGeometry(1, 12, 10),
  nostril: new THREE.SphereGeometry(1, 6, 6),
  mouthInterior: new THREE.SphereGeometry(0.045, 14, 10),
  lip: new THREE.TorusGeometry(0.047, 0.006, 5, 20, Math.PI),
  earring: new THREE.TorusGeometry(0.026, 0.006, 5, 14),
  breathPuff: Array.from({ length: 6 }, (_, i) => new THREE.SphereGeometry(0.052 + (i % 3) * 0.009, 8, 8))
}

// Finger geometries pre-allocated
const fingerGeos = fingerLengths.map((length, i) => ({
  seg1: new THREE.CapsuleGeometry(fingerWidths[i], length * 0.43, 4, 8),
  joint1: new THREE.SphereGeometry(fingerWidths[i] * 1.02, 8, 8),
  seg2: new THREE.CapsuleGeometry(fingerWidths[i] * 0.88, length * 0.38, 4, 8),
  joint2: new THREE.SphereGeometry(fingerWidths[i] * 0.84, 8, 8)
}))

// Pre-create hair strands
const hairStrandGeometries = Array.from({ length: 9 }, (_, i) => {
  const x = -0.16 + i * 0.04
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x * 0.35, 0.285, -0.005),
    new THREE.Vector3(x * 0.85, 0.22, 0.13),
    new THREE.Vector3(x, 0.02, 0.16),
    new THREE.Vector3(x * 1.08, -0.22, 0.04),
    new THREE.Vector3(x * 0.8, -0.3, -0.1)
  ])
  return new THREE.TubeGeometry(curve, 14, 0.004 + (i % 3) * 0.001, 4, false)
})

function smooth01(value) {
  const t = THREE.MathUtils.clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}

function Finger({ x, index, length, fingerRef }) {
  const geos = fingerGeos[index]
  return (
    <group ref={fingerRef} position={[x, 0.03, 0.215]}>
      <mesh position={[0, 0, length * 0.23]} rotation={[Math.PI / 2, 0, 0]} geometry={geos.seg1} material={handSkinMaterial} />
      <mesh position={[0, 0, length * 0.48]} geometry={geos.joint1} material={handSkinMaterial} />
      <mesh position={[0, 0, length * 0.72]} rotation={[Math.PI / 2, 0, 0]} geometry={geos.seg2} material={handSkinMaterial} />
      <mesh position={[0, 0, length * 0.94]} geometry={geos.joint2} material={handSkinMaterial} />
    </group>
  )
}

function LightingHand({ litCount, lighting }) {
  const handRef = useRef()
  const fingerRefs = useRef([])
  const lastKeyRef = useRef('')
  const segmentStartRef = useRef(0)
  const segmentOriginRef = useRef(new THREE.Vector3())
  const targetRef = useRef(new THREE.Vector3())
  const approachOffset = useRef(new THREE.Vector3(1.05, 0.58, 0.88))

  useFrame((state) => {
    const hand = handRef.current
    if (!hand) return
    const elapsed = state.clock.elapsedTime
    if (!hand.visible && (!lighting || litCount >= CANDLE_POSITIONS.length)) {
      hand.visible = false
      lastKeyRef.current = ''
      return
    }

    if (!lighting || litCount >= CANDLE_POSITIONS.length) {
      if (lastKeyRef.current !== 'exit') {
        segmentOriginRef.current.copy(hand.position)
        targetRef.current.copy(hand.position).add(approachOffset.current)
        segmentStartRef.current = elapsed
        lastKeyRef.current = 'exit'
      }
      const exitProgress = smooth01((elapsed - segmentStartRef.current) / 0.42)
      hand.position.lerpVectors(segmentOriginRef.current, targetRef.current, exitProgress)
      if (exitProgress >= 1) {
        hand.visible = false
        lastKeyRef.current = ''
      }
      return
    }

    hand.visible = true
    const key = `${lighting}-${litCount}`
    const index = Math.min(litCount, CANDLE_POSITIONS.length - 1)
    const local = CANDLE_POSITIONS[index]
    const cakeRotation = elapsed * 0.15
    const cosine = Math.cos(cakeRotation)
    const sine = Math.sin(cakeRotation)
    const candleX = local.x * cosine + local.z * sine
    const candleZ = -local.x * sine + local.z * cosine
    const cakeFloat = Math.sin(elapsed * 0.8) * 0.3
    const candleY = 1.35 + 0.39 + cakeFloat
    const directionX = -0.92
    const directionZ = 0.39
    const directionLength = Math.hypot(directionX, directionZ)
    const dirX = directionX / directionLength
    const dirZ = directionZ / directionLength
    const reach = 0.43

    targetRef.current.set(candleX - dirX * reach, candleY - 0.045, candleZ - dirZ * reach)
    if (lastKeyRef.current !== key) {
      if (litCount === 0) segmentOriginRef.current.copy(targetRef.current).add(approachOffset.current)
      else segmentOriginRef.current.copy(hand.position)
      segmentStartRef.current = elapsed
      lastKeyRef.current = key
    }

    const travel = smooth01((elapsed - segmentStartRef.current) / (litCount === 0 ? 0.48 : 0.34))
    hand.position.lerpVectors(segmentOriginRef.current, targetRef.current, travel)
    hand.rotation.set(0.13 + Math.sin(elapsed * 3.2) * 0.025, Math.atan2(dirX, dirZ), Math.sin(elapsed * 2.4) * 0.035)

    fingerRefs.current.forEach((finger, fingerIndex) => {
      if (!finger) return
      const curl = travel * (0.14 + fingerIndex * 0.025) + Math.sin(elapsed * 2.1 + fingerIndex) * 0.018
      finger.rotation.x = curl
    })
  })

  return (
    <group ref={handRef} visible={false} scale={0.88}>
      {/* Forearm tapers into the wrist */}
      <mesh position={[0, 0, -0.34]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCache.forearm} material={handSkinMaterial} />
      <mesh position={[0, 0.005, -0.045]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCache.wrist} material={handSkinMaterial} />
      {/* Palm, heel of the hand and thumb web */}
      <mesh position={[0, 0.025, 0.115]} scale={[0.105, 0.047, 0.15]} geometry={geoCache.palm} material={handSkinMaterial} />
      <mesh position={[-0.073, 0.02, 0.13]} rotation={[0.2, -0.22, -0.58]} geometry={geoCache.thumbWeb} material={handSkinMaterial} />
      <group ref={el => { fingerRefs.current[4] = el }} position={[-0.084, 0.025, 0.14]} rotation={[0, -0.35, -0.58]}>
        <mesh position={[0, 0, 0.055]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCache.thumbSeg1} material={handSkinMaterial} />
        <mesh position={[0, 0, 0.108]} geometry={geoCache.thumbJoint} material={handSkinMaterial} />
        <mesh position={[0, 0, 0.145]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCache.thumbSeg2} material={handSkinMaterial} />
      </group>
      {fingerLengths.map((length, i) => (
        <Finger
          key={i}
          index={i}
          x={-0.064 + i * 0.043}
          length={length}
          fingerRef={el => { fingerRefs.current[i] = el }}
        />
      ))}
      {/* Wooden match pinched between thumb and index finger */}
      <group position={[0.005, 0.057, 0.23]}>
        <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCache.matchStick} material={matchWoodMaterial} />
        <mesh position={[0, 0.004, 0.278]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCache.matchHead} material={matchHeadMaterial} />
      </group>
    </group>
  )
}

function HairStrands() {
  return (
    <group>
      {hairStrandGeometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={i % 3 === 0 ? hairHighlightMaterial : hairMaterial} />
      ))}
    </group>
  )
}

function ArmRig({ side, armRef, forearmRef }) {
  const x = side * 0.205
  return (
    <group ref={armRef} position={[x, 0.32, 0]}>
      <mesh position={[0, -0.17, 0]} geometry={geoCache.armUpper} material={skinMaterial} />
      <mesh position={[0, -0.34, 0]} geometry={geoCache.elbow} material={skinMaterial} />
      <group ref={forearmRef} position={[0, -0.34, 0]}>
        <mesh position={[0, -0.17, 0]} geometry={geoCache.forearmG} material={skinMaterial} />
        <mesh position={[0, -0.345, 0]} scale={[0.07, 0.045, 0.095]} geometry={geoCache.wristG} material={skinMaterial} />
        {[0, 1, 2, 3].map(i => (
          <mesh key={i} position={[-0.045 + i * 0.03, -0.38, 0.045]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCache.handFinger[i]} material={skinMaterial} />
        ))}
      </group>
    </group>
  )
}

function LegRig({ legRef, x }) {
  const kneeRef = useRef()
  return (
    <group ref={legRef} position={[x, -0.5, 0]}>
      <mesh position={[0, -0.08, 0]} geometry={geoCache.thigh} material={skinMaterial} />
      <group ref={kneeRef} position={[0, -0.17, 0]}>
        <mesh position={[0, -0.13, 0]} geometry={geoCache.shin} material={skinMaterial} />
        <mesh position={[0, -0.29, 0.055]} scale={[0.09, 0.042, 0.13]} geometry={geoCache.shoe} material={shoeMaterial} />
      </group>
    </group>
  )
}

function GirlRig({ visible, blowing }) {
  const rootRef = useRef()
  const bodyRef = useRef()
  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftForearmRef = useRef()
  const rightForearmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const mouthRef = useRef()
  const mouthOpenRef = useRef()
  const breathRefs = useRef([])
  const startedAtRef = useRef(null)
  const wasVisibleRef = useRef(false)

  useFrame((state, delta) => {
    const root = rootRef.current
    if (!root) return
    if (!visible) {
      root.visible = false
      wasVisibleRef.current = false
      startedAtRef.current = null
      return
    }

    root.visible = true
    const now = state.clock.elapsedTime
    if (!wasVisibleRef.current) {
      startedAtRef.current = now
      wasVisibleRef.current = true
    }
    const age = now - startedAtRef.current
    const arrival = smooth01(age / 0.9)
    const walk = 1 - smooth01(age / 0.9)
    root.position.set(THREE.MathUtils.lerp(2.55, 1.27, arrival), 0.015 + Math.sin(age * 11) * 0.018 * walk, -0.34)
    root.rotation.y = -1.28 + Math.sin(age * 1.8) * 0.018

    if (bodyRef.current) {
      const bendTarget = blowing ? 0.42 * smooth01((age - 0.28) / 0.72) : 0.015
      bodyRef.current.rotation.x = THREE.MathUtils.damp(bodyRef.current.rotation.x, bendTarget, 6.5, delta)
      bodyRef.current.rotation.z = Math.sin(age * 2.3) * 0.018 * (1 - walk)
    }
    if (headRef.current) {
      const bend = bodyRef.current?.rotation.x || 0
      headRef.current.rotation.x = -bend * 0.26 + (blowing ? 0.045 * Math.sin(age * 9) : 0)
      headRef.current.rotation.y = Math.sin(age * 1.3) * 0.035
    }
    if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(age * 10) * 0.22 * walk + (blowing ? -0.13 : 0)
    if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(age * 10) * 0.22 * walk + (blowing ? -0.08 : 0)
    if (leftForearmRef.current) leftForearmRef.current.rotation.x = blowing ? -0.22 : 0.04 * Math.sin(age * 8) * walk
    if (rightForearmRef.current) rightForearmRef.current.rotation.x = blowing ? -0.18 : -0.04 * Math.sin(age * 8) * walk
    if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(age * 12) * 0.36 * walk
    if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(age * 12 + Math.PI) * 0.36 * walk

    const blink = Math.max(0, 1 - Math.abs((age % 3.8) - 3.62) / 0.11)
    if (leftEyeRef.current) leftEyeRef.current.scale.y = 0.05 * (1 - blink * 0.82)
    if (rightEyeRef.current) rightEyeRef.current.scale.y = 0.05 * (1 - blink * 0.82)
    if (mouthRef.current) mouthRef.current.scale.y = blowing ? 0.7 : 0.22
    if (mouthOpenRef.current) mouthOpenRef.current.scale.set(1, blowing ? 0.8 : 0.16, 0.7)

    breathRefs.current.forEach((puff, i) => {
      if (!puff) return
      const phase = (age - 0.95 - i * 0.1) / 0.46
      const active = blowing && phase >= 0 && phase <= 1
      puff.visible = active
      if (active) {
        puff.position.z = 0.04 + phase * 0.48
        puff.position.x = (i - 2.5) * 0.045 + Math.sin(age * 13 + i) * 0.012
        puff.position.y = Math.sin(age * 10 + i) * 0.022
        puff.scale.setScalar(0.55 + phase * 0.9 + (i % 2) * 0.12)
        breathMaterials[i].opacity = (1 - phase) * 0.22
      }
    })
  })

  return (
    <group ref={rootRef} visible={false} scale={0.82}>
      {/* Natural body proportions, layered fabric, and articulated limbs */}
      <group ref={bodyRef} position={[0, 1.04, 0]}>
        <mesh geometry={geoCache.torso} material={skinMaterial} />
        <mesh geometry={geoCache.shirt} material={dressMaterial} />
        <mesh geometry={geoCache.skirt} material={dressMaterial} />
        <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCache.waistTrim} material={dressTrimMaterial} />
        <mesh position={[0, 0.55, 0]} scale={[0.075, 0.12, 0.072]} geometry={geoCache.neck} material={skinMaterial} />
        <mesh position={[0, 0.64, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCache.neckTrim} material={dressTrimMaterial} />
        <ArmRig side={-1} armRef={leftArmRef} forearmRef={leftForearmRef} />
        <ArmRig side={1} armRef={rightArmRef} forearmRef={rightForearmRef} />
        <LegRig legRef={leftLegRef} x={-0.105} />
        <LegRig legRef={rightLegRef} x={0.105} />

        {/* Head, ears, eyelids, irises, brows, nose, and a changing mouth pose */}
        <group ref={headRef} position={[0, 0.83, 0]}>
          <mesh geometry={geoCache.head} material={skinMaterial} />
          <mesh position={[-0.19, -0.015, 0]} scale={[0.04, 0.065, 0.035]} geometry={geoCache.ear} material={skinMaterial} />
          <mesh position={[0.19, -0.015, 0]} scale={[0.04, 0.065, 0.035]} geometry={geoCache.ear} material={skinMaterial} />
          {/* Long hair cap and side locks */}
          <mesh position={[0, 0.045, -0.055]} scale={[1.08, 1.08, 1.02]} geometry={geoCache.hairCap} material={hairMaterial} />
          <mesh position={[0, -0.04, -0.12]} scale={[0.215, 0.29, 0.12]} geometry={geoCache.hairBack} material={hairMaterial} />
          <mesh position={[-0.17, -0.19, -0.075]} rotation={[0.05, 0, -0.06]} geometry={geoCache.hairLockL} material={hairMaterial} />
          <mesh position={[0.17, -0.19, -0.075]} rotation={[-0.05, 0, 0.06]} geometry={geoCache.hairLockR} material={hairMaterial} />
          <mesh position={[-0.075, 0.205, 0.135]} scale={[0.076, 0.09, 0.065]} rotation={[0.18, -0.18, -0.1]} geometry={geoCache.hairPuffL} material={hairMaterial} />
          <mesh position={[0.015, 0.225, 0.14]} scale={[0.07, 0.08, 0.06]} rotation={[0.1, 0.05, 0.06]} geometry={geoCache.hairPuffR} material={hairMaterial} />
          <HairStrands />

          {[-1, 1].map(side => (
            <group key={side} position={[side * 0.076, 0.055, 0.171]}>
              <mesh ref={side < 0 ? leftEyeRef : rightEyeRef} scale={[0.043, 0.05, 0.018]} geometry={geoCache.eyeWhite} material={eyeWhiteMaterial} />
              <mesh position={[0, -0.001, 0.019]} scale={[0.02, 0.03, 0.012]} geometry={geoCache.iris} material={irisMaterial} />
              <mesh position={[0, -0.001, 0.028]} scale={[0.01, 0.019, 0.006]} geometry={geoCache.pupil} material={pupilMaterial} />
              <mesh position={[-0.008, 0.014, 0.037]} scale={[0.004, 0.006, 0.003]} geometry={geoCache.glint} material={eyeGlintMaterial} />
            </group>
          ))}
          <mesh position={[-0.076, 0.124, 0.166]} rotation={[0, 0, -0.1]} scale={[0.052, 0.012, 0.01]} geometry={geoCache.brow} material={hairMaterial} />
          <mesh position={[0.076, 0.124, 0.166]} rotation={[0, 0, 0.1]} scale={[0.052, 0.012, 0.01]} geometry={geoCache.brow} material={hairMaterial} />
          <mesh position={[0, -0.005, 0.192]} scale={[0.026, 0.042, 0.034]} geometry={geoCache.nose} material={skinMaterial} />
          <mesh position={[-0.012, -0.033, 0.218]} scale={[0.006, 0.004, 0.004]} geometry={geoCache.nostril} material={nostrilMaterial} />
          <mesh position={[0.012, -0.033, 0.218]} scale={[0.006, 0.004, 0.004]} geometry={geoCache.nostril} material={nostrilMaterial} />
          <mesh ref={mouthOpenRef} position={[0, -0.126, 0.202]} scale={[1, 0.16, 0.7]} geometry={geoCache.mouthInterior} material={mouthInteriorMaterial} />
          <mesh ref={mouthRef} position={[0, -0.126, 0.218]} geometry={geoCache.lip} material={lipMaterial} />
          <mesh position={[-0.198, -0.02, 0.006]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCache.earring} material={dressTrimMaterial} />
          <mesh position={[0.198, -0.02, 0.006]} rotation={[Math.PI / 2, 0, 0]} geometry={geoCache.earring} material={dressTrimMaterial} />
        </group>
      </group>

      {/* Breath puffs */}
      <group position={[0, 1.91, 0.2]}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh
            key={i}
            ref={el => { breathRefs.current[i] = el }}
            visible={false}
            geometry={geoCache.breathPuff[i]}
            material={breathMaterials[i]}
          />
        ))}
      </group>
    </group>
  )
}

export default function BirthdayHumanAnimations({ litCount, lighting, showGirl, blowing }) {
  return (
    <group>
      <LightingHand litCount={litCount} lighting={lighting} />
      <GirlRig visible={showGirl} blowing={blowing} />
    </group>
  )
}
