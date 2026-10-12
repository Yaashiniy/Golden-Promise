import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'

/**
 * Wraps any inline element with a spring-based magnetic hover — the element
 * subtly follows the cursor when it gets close. Feels premium on CTAs.
 */
export function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { damping: 22, stiffness: 220, mass: 0.5 })
  const sy = useSpring(y, { damping: 22, stiffness: 220, mass: 0.5 })

  function onMove(e) {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const mx = e.clientX - (r.left + r.width / 2)
    const my = e.clientY - (r.top + r.height / 2)
    x.set(mx * strength)
    y.set(my * strength)
  }
  function onLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
