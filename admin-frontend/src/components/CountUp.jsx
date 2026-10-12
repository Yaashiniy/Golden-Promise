import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

/**
 * Counts from 0 to `to` when scrolled into view. Uses plain IntersectionObserver
 * so it's not affected by parent motion state.
 */
export function CountUp({ to = 100, duration = 2.2, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const [n, setN] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function check() {
      const rect = el.getBoundingClientRect()
      const inView = rect.top < window.innerHeight && rect.bottom >= 0
      if (inView && !started.current) {
        started.current = true
        window.removeEventListener('scroll', check)
        animate(0, to, {
          duration,
          ease: [0.16, 1, 0.3, 1], // Luxury decelerating ease
          onUpdate: (v) => setN(Math.round(v)),
        })
      }
    }

    window.addEventListener('scroll', check, { passive: true })
    // Tiny delay check to avoid initial render triggers
    const t = setTimeout(check, 150)

    return () => {
      window.removeEventListener('scroll', check)
      clearTimeout(t)
    }
  }, [to, duration])

  return (
    <span ref={ref}>
      {prefix}{n.toLocaleString()}{suffix}
    </span>
  )
}
