import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function ParallaxImage({
  src,
  alt = '',
  className = '',
  imageClassName = '',
  range = 80,
  scale = 1.15,
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [-range, range])
  const s = useTransform(scrollYProgress, [0, 0.5, 1], [scale, 1, scale])

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ y, scale: s }}
        className={`w-full h-full object-cover ${imageClassName}`}
      />
    </div>
  )
}
