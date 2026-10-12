import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Run a GSAP timeline setup inside a scoped ref, cleaned up on unmount.
 * Callback receives (gsap, ScrollTrigger, containerEl).
 * Wraps everything in gsap.context() so all tweens can be reverted at once.
 */
export function useGsapScroll(setup, deps = []) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => setup(gsap, ScrollTrigger, ref.current), ref)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
