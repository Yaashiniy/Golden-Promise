import { motion } from 'framer-motion'

/**
 * Cheap "liquid" blob — animated border-radius on a rotating gradient div.
 * GPU-accelerated (only transform + border-radius), no SVG path animation,
 * no blur filter re-render each frame. Screenshot-safe.
 */
export function LiquidBlob({
  color = '#C08E3F',
  size = 500,
  opacity = 0.18,
  duration = 22,
  className = '',
  style = {},
}) {
  return (
    <motion.div
      className={`pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
        opacity,
        filter: 'blur(60px)',
        ...style,
      }}
      animate={{
        borderRadius: [
          '60% 40% 55% 45% / 45% 55% 45% 55%',
          '45% 55% 40% 60% / 55% 45% 60% 40%',
          '50% 50% 60% 40% / 45% 60% 40% 55%',
          '60% 40% 55% 45% / 45% 55% 45% 55%',
        ],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
      aria-hidden="true"
    />
  )
}
