import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

// 1. Unified Three.js Clock and RAF Ticker
export const threeClock = new THREE.Clock()
const tickerListeners = new Set()
let globalRafId = null

function runTicker() {
  const delta = Math.min(threeClock.getDelta(), 0.1)
  const elapsed = threeClock.getElapsedTime()
  tickerListeners.forEach(fn => {
    try {
      fn(elapsed, delta)
    } catch (e) {
      console.error('ThreeTicker error:', e)
    }
  })
  globalRafId = requestAnimationFrame(runTicker)
}

export const threeTicker = {
  add(fn) {
    tickerListeners.add(fn)
    if (!globalRafId && typeof window !== 'undefined') {
      threeClock.start()
      globalRafId = requestAnimationFrame(runTicker)
    }
  },
  remove(fn) {
    tickerListeners.delete(fn)
    if (tickerListeners.size === 0 && globalRafId) {
      cancelAnimationFrame(globalRafId)
      globalRafId = null
    }
  },
  getElapsedTime() {
    return threeClock.getElapsedTime()
  }
}

// 2. Global Event Bus for Particle and Effect Triggers
class ThreeAnimationBus {
  constructor() {
    this.events = new Map()
  }
  on(event, handler) {
    if (!this.events.has(event)) this.events.set(event, new Set())
    this.events.get(event).add(handler)
    return () => this.off(event, handler)
  }
  off(event, handler) {
    if (this.events.has(event)) {
      this.events.get(event).delete(handler)
    }
  }
  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(handler => handler(data))
    }
  }
  triggerConfetti(options = {}) {
    this.emit('confetti', options)
  }
  triggerSparks(x, y, count = 15, glyph = '✦') {
    this.emit('sparks', { x, y, count, glyph })
  }
  setMode(mode) {
    this.emit('mode', mode)
  }
}

export const threeAnimationBus = new ThreeAnimationBus()

// 3. Three.js Interpolation and Math Helpers
function interpolateKeyframes(values, progress) {
  if (!Array.isArray(values)) return values
  if (values.length === 1) return values[0]
  const n = values.length - 1
  const segment = progress * n
  const index = Math.min(Math.floor(segment), n - 1)
  const t = segment - index
  return THREE.MathUtils.lerp(values[index], values[index + 1], t)
}

// 4. ThreeMotion: Three.js-Driven Motion Component Factory
function createMotionComponent(tagName) {
  const Component = React.forwardRef(function ThreeMotionComponent(props, forwardedRef) {
    const {
      initial,
      animate,
      exit,
      transition = {},
      whileHover,
      whileTap,
      pulse = false,
      bounce = false,
      spin = false,
      style = {},
      children,
      onAnimationComplete,
      ...domProps
    } = props

    const domRef = useRef(null)
    const isHovered = useRef(false)
    const isPressed = useRef(false)
    const startTimeRef = useRef(null)
    const currentValues = useRef({})

    // Initialize values from `initial`
    useEffect(() => {
      const initVals = initial || animate || {}
      Object.keys(initVals).forEach(key => {
        const val = initVals[key]
        currentValues.current[key] = Array.isArray(val) ? val[0] : val
      })
      applyStyles(currentValues.current, 0)
    }, [])

    const applyStyles = (vals, elapsed) => {
      const el = domRef.current
      if (!el) return

      let tx = vals.x !== undefined ? vals.x : 0
      let ty = vals.y !== undefined ? vals.y : 0
      let scale = vals.scale !== undefined ? vals.scale : 1
      let rot = vals.rotate !== undefined ? vals.rotate : 0
      let rotX = vals.rotateX !== undefined ? vals.rotateX : 0
      let rotY = vals.rotateY !== undefined ? vals.rotateY : 0

      // Three.js visual animation modifiers (replacing CSS animations)
      if (bounce) {
        const bounceFreq = typeof bounce === 'object' && bounce.frequency ? bounce.frequency : 4
        const bounceAmp = typeof bounce === 'object' && bounce.amplitude ? bounce.amplitude : 6
        ty += Math.sin(elapsed * bounceFreq) * bounceAmp
      }

      if (pulse) {
        const pulseFreq = typeof pulse === 'object' && pulse.frequency ? pulse.frequency : 3
        const pulseAmp = typeof pulse === 'object' && pulse.amplitude ? pulse.amplitude : 0.03
        scale *= 1 + Math.sin(elapsed * pulseFreq) * pulseAmp
      }

      if (spin) {
        const spinSpeed = typeof spin === 'object' && spin.speed ? spin.speed : 360
        rot += (elapsed * spinSpeed) % 360
      }

      // Format translate values
      const xStr = typeof tx === 'number' ? `${tx}px` : tx
      const yStr = typeof ty === 'number' ? `${ty}px` : ty

      el.style.transform = `translate3d(${xStr}, ${yStr}, 0) scale(${scale}) rotate(${rot}deg) rotateX(${rotX}deg) rotateY(${rotY}deg)`

      if (vals.opacity !== undefined) {
        el.style.opacity = Math.max(0, Math.min(1, vals.opacity))
      }
      if (vals.filter !== undefined) {
        el.style.filter = vals.filter
      }
    }

    useEffect(() => {
      startTimeRef.current = threeClock.getElapsedTime()

      const onFrame = (elapsed, delta) => {
        if (!domRef.current) return

        let target = { ...(animate || {}) }
        if (isHovered.current && whileHover) {
          target = { ...target, ...whileHover }
        }
        if (isPressed.current && whileTap) {
          target = { ...target, ...whileTap }
        }

        const duration = transition.duration || 0.6
        const delay = transition.delay || 0
        const repeat = transition.repeat === Infinity
        const timeSinceStart = Math.max(0, elapsed - startTimeRef.current - delay)

        let progress = 1
        if (duration > 0) {
          if (repeat) {
            progress = (timeSinceStart % duration) / duration
          } else {
            progress = Math.min(1, timeSinceStart / duration)
          }
        }

        // Smooth easing with Three.js MathUtils
        const eased = THREE.MathUtils.smoothstep(progress, 0, 1)

        // Interpolate all active keys
        Object.keys(target).forEach(key => {
          const targetVal = target[key]
          if (Array.isArray(targetVal)) {
            currentValues.current[key] = interpolateKeyframes(targetVal, progress)
          } else if (typeof targetVal === 'number') {
            const current = currentValues.current[key] !== undefined ? currentValues.current[key] : targetVal
            // Damping convergence via Three.js
            const dampFactor = repeat ? 1 : 12
            currentValues.current[key] = THREE.MathUtils.damp(current, targetVal, dampFactor, delta)
          } else {
            currentValues.current[key] = targetVal
          }
        })

        applyStyles(currentValues.current, elapsed)

        if (progress >= 1 && !repeat && onAnimationComplete) {
          onAnimationComplete()
        }
      }

      threeTicker.add(onFrame)
      return () => threeTicker.remove(onFrame)
    }, [animate, whileHover, whileTap, transition, pulse, bounce, spin])

    const handleMouseEnter = e => {
      isHovered.current = true
      if (props.onMouseEnter) props.onMouseEnter(e)
    }
    const handleMouseLeave = e => {
      isHovered.current = false
      isPressed.current = false
      if (props.onMouseLeave) props.onMouseLeave(e)
    }
    const handleMouseDown = e => {
      isPressed.current = true
      if (props.onMouseDown) props.onMouseDown(e)
    }
    const handleMouseUp = e => {
      isPressed.current = false
      if (props.onMouseUp) props.onMouseUp(e)
    }

    const mergedRef = el => {
      domRef.current = el
      if (typeof forwardedRef === 'function') forwardedRef(el)
      else if (forwardedRef) forwardedRef.current = el
    }

    return React.createElement(tagName, {
      ...domProps,
      ref: mergedRef,
      style: {
        ...style,
        willChange: 'transform, opacity'
      },
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp
    }, children)
  })

  Component.displayName = `ThreeMotion.${tagName}`
  return Component
}

export const ThreeMotion = {
  div: createMotionComponent('div'),
  button: createMotionComponent('button'),
  p: createMotionComponent('p'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  span: createMotionComponent('span'),
  article: createMotionComponent('article'),
  section: createMotionComponent('section'),
  main: createMotionComponent('main'),
  header: createMotionComponent('header'),
  footer: createMotionComponent('footer'),
  nav: createMotionComponent('nav')
}

// 5. ThreeAnimatePresence: Unified presence manager for conditional mount/unmount animations
export function ThreeAnimatePresence({ children, mode = 'sync' }) {
  const [currentChild, setCurrentChild] = useState(children)

  useEffect(() => {
    setCurrentChild(children)
  }, [children])

  return currentChild || null
}

// 6. Hook for individual elements to attach to Three.js clock animation
export function useThreeTicker(callback, deps = []) {
  useEffect(() => {
    threeTicker.add(callback)
    return () => threeTicker.remove(callback)
  }, deps)
}
