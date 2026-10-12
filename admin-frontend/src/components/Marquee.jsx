import { motion } from 'framer-motion'

/**
 * Infinite horizontal marquee. Pass any React nodes as items[].
 * Duplicates content twice for a seamless loop.
 */
export function Marquee({ items, speed = 40, direction = 'left', className = '', itemClassName = '' }) {
  const dx = direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%']
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div
        className="inline-flex whitespace-nowrap"
        animate={{ x: dx }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {[...(items || []), ...(items || [])].map((it, i) => (
          <span key={i} className={`inline-flex items-center ${itemClassName}`}>
            {it}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
