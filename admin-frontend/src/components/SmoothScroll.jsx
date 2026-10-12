import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis smooth scroll tuned for editorial feel — long momentum, no hard stops.
 * ScrollTrigger is wired to Lenis so scroll-linked animations work correctly.
 */
export function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      lerp: 0.08,
    })

    window.__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)

    let reqId
    function raf(time) {
      lenis.raf(time)
      reqId = requestAnimationFrame(raf)
    }
    reqId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(reqId)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])

  return children
}
