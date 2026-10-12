import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Editorial word-by-word reveal. Words rise from below with a soft mask.
 * Use for big display headlines.
 *
 * Triggered via GSAP ScrollTrigger rather than framer-motion's whileInView —
 * whileInView's IntersectionObserver-based trigger proved unreliable for these
 * nested inline-block word spans in real-world testing, while ScrollTrigger
 * (already used everywhere else in this app for scroll reveals) is not.
 */
export function SplitText({
  children,
  className = '',
  style = {},
  delay = 0,
  stagger = 0.055,
  y = 60,
  once = true,
  as: Comp = 'span',
}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 90%',
      onEnter: () => setInView(true),
      onEnterBack: () => setInView(true),
      onLeaveBack: () => {
        if (!once) setInView(false)
      },
    })
    return () => trigger.kill()
  }, [once])

  // Only strings can be split; if a non-string ReactNode slips in, animate it as a single unit.
  const words = typeof children === 'string' ? children.split(' ') : [children]
  return (
    <Comp ref={ref} className={`inline-block ${className}`} style={style}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block">
          <span className="inline-block overflow-hidden align-baseline pb-[0.15em]">
            <motion.span
              className="inline-block will-change-transform"
              initial={{ y, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : { y, opacity: 0 }}
              transition={{
                duration: 1,
                delay: delay + i * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Comp>
  )
}
