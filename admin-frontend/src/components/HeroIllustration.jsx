import { motion } from 'framer-motion'

/**
 * A hand-drawn wedding arch illustration: two curving posts, a rising arch,
 * intertwined rings dangling at centre, floral vines with leaves and petals,
 * scattered stars. Every stroke draws itself in with staggered pathLength.
 *
 * Palette locked to burgundy (#7B1F2A / #4E1218) + gold (#C08E3F).
 */
export function HeroIllustration({ className = '' }) {
  const draw = (delay) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { duration: 2.4, delay, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.4, delay },
    },
  })
  const fade = (delay) => ({
    initial: { opacity: 0, scale: 0.6 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.8, delay, ease: 'easeOut' },
  })

  return (
    <svg
      viewBox="0 0 520 640"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Soft gold halo behind arch — small, subtle, sits behind the rings */}
      <motion.circle
        cx="262" cy="245" r="90"
        fill="#C08E3F"
        opacity="0.13"
        {...fade(0)}
      />
      <motion.circle
        cx="262" cy="245" r="60"
        fill="#C08E3F"
        opacity="0.08"
        {...fade(0.2)}
      />

      {/* Arch — right post */}
      <motion.path
        d="M 400 610 C 400 500, 400 330, 400 180 C 400 130, 380 100, 330 80"
        stroke="#7B1F2A" strokeWidth="2.5"
        {...draw(0.1)}
      />
      {/* Arch — left post */}
      <motion.path
        d="M 120 610 C 120 500, 120 330, 120 180 C 120 130, 140 100, 190 80"
        stroke="#7B1F2A" strokeWidth="2.5"
        {...draw(0.1)}
      />
      {/* Arch — the crowning curve */}
      <motion.path
        d="M 190 80 C 220 60, 300 60, 330 80"
        stroke="#7B1F2A" strokeWidth="2.5"
        {...draw(0.9)}
      />

      {/* Vines on left post — swirling upward */}
      <motion.path
        d="M 120 560 C 105 540, 95 510, 110 490 C 130 470, 100 440, 115 420 C 130 400, 105 370, 120 350 C 140 330, 110 300, 125 280 C 140 260, 115 235, 130 215 C 145 195, 125 170, 140 155"
        stroke="#7B1F2A" strokeWidth="1.5"
        {...draw(1.4)}
      />
      {/* Vines on right post */}
      <motion.path
        d="M 400 560 C 415 540, 425 510, 410 490 C 390 470, 420 440, 405 420 C 390 400, 415 370, 400 350 C 380 330, 410 300, 395 280 C 380 260, 405 235, 390 215 C 375 195, 395 170, 380 155"
        stroke="#7B1F2A" strokeWidth="1.5"
        {...draw(1.5)}
      />

      {/* Leaves along left vine */}
      {[
        { cx: 100, cy: 500, r: 8, delay: 1.7 },
        { cx: 118, cy: 440, r: 7, delay: 1.85 },
        { cx: 105, cy: 380, r: 8, delay: 2.0 },
        { cx: 122, cy: 315, r: 7, delay: 2.15 },
        { cx: 108, cy: 250, r: 8, delay: 2.3 },
        { cx: 128, cy: 190, r: 7, delay: 2.45 },
      ].map((l, i) => (
        <motion.ellipse
          key={`ll-${i}`}
          cx={l.cx} cy={l.cy} rx={l.r * 1.6} ry={l.r * 0.6}
          transform={`rotate(-30 ${l.cx} ${l.cy})`}
          stroke="#7B1F2A" strokeWidth="1.5"
          {...draw(l.delay)}
        />
      ))}
      {/* Leaves along right vine */}
      {[
        { cx: 420, cy: 500, r: 8, delay: 1.75 },
        { cx: 402, cy: 440, r: 7, delay: 1.9 },
        { cx: 415, cy: 380, r: 8, delay: 2.05 },
        { cx: 398, cy: 315, r: 7, delay: 2.2 },
        { cx: 412, cy: 250, r: 8, delay: 2.35 },
        { cx: 392, cy: 190, r: 7, delay: 2.5 },
      ].map((l, i) => (
        <motion.ellipse
          key={`lr-${i}`}
          cx={l.cx} cy={l.cy} rx={l.r * 1.6} ry={l.r * 0.6}
          transform={`rotate(30 ${l.cx} ${l.cy})`}
          stroke="#7B1F2A" strokeWidth="1.5"
          {...draw(l.delay)}
        />
      ))}

      {/* Small blossoms — 5-petal flowers */}
      {[
        { cx: 130, cy: 470, delay: 2.6 },
        { cx: 108, cy: 350, delay: 2.7 },
        { cx: 135, cy: 220, delay: 2.8 },
        { cx: 390, cy: 470, delay: 2.65 },
        { cx: 412, cy: 350, delay: 2.75 },
        { cx: 385, cy: 220, delay: 2.85 },
      ].map((f, i) => (
        <motion.g key={`fl-${i}`} {...fade(f.delay)}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx={f.cx}
              cy={f.cy - 6}
              rx="3.5" ry="6"
              transform={`rotate(${deg} ${f.cx} ${f.cy})`}
              fill="#C08E3F"
              opacity="0.55"
            />
          ))}
          <circle cx={f.cx} cy={f.cy} r="2" fill="#7B1F2A" />
        </motion.g>
      ))}

      {/* Ribbon hanging from arch centre */}
      <motion.path
        d="M 260 90 L 260 200"
        stroke="#C08E3F" strokeWidth="1.5"
        {...draw(1.3)}
      />

      {/* Two intertwined rings */}
      <motion.g {...fade(1.9)}>
        <ellipse
          cx="240" cy="240"
          rx="42" ry="42"
          stroke="#C08E3F" strokeWidth="3.5"
          fill="none"
        />
        <ellipse
          cx="285" cy="255"
          rx="42" ry="42"
          stroke="#7B1F2A" strokeWidth="3.5"
          fill="none"
        />
        {/* Tiny gold facets to suggest gemstones */}
        <circle cx="240" cy="198" r="3" fill="#C08E3F" />
        <circle cx="285" cy="297" r="3" fill="#7B1F2A" />
      </motion.g>

      {/* Sparkles scattered */}
      {[
        { x: 175, y: 130, s: 5, delay: 2.9 },
        { x: 345, y: 140, s: 6, delay: 3.0 },
        { x: 260, y: 155, s: 4, delay: 3.1 },
        { x: 200, y: 320, s: 4, delay: 3.2 },
        { x: 330, y: 340, s: 5, delay: 3.3 },
      ].map((s, i) => (
        <motion.g key={`sp-${i}`} {...fade(s.delay)}>
          <path
            d={`M ${s.x} ${s.y - s.s} L ${s.x} ${s.y + s.s} M ${s.x - s.s} ${s.y} L ${s.x + s.s} ${s.y}`}
            stroke="#C08E3F" strokeWidth="1.2"
          />
        </motion.g>
      ))}

      {/* Ground line - soft */}
      <motion.path
        d="M 60 610 L 460 610"
        stroke="#7B1F2A" strokeWidth="1"
        opacity="0.35"
        {...draw(0.6)}
      />

      {/* Grass sprigs on the ground */}
      {[80, 130, 190, 250, 310, 370, 430].map((x, i) => (
        <motion.g key={`g-${i}`} {...fade(0.8 + i * 0.05)}>
          <path
            d={`M ${x} 610 Q ${x - 4} 598, ${x - 2} 588`}
            stroke="#7B1F2A" strokeWidth="1" opacity="0.5"
          />
          <path
            d={`M ${x + 4} 610 Q ${x + 8} 598, ${x + 6} 588`}
            stroke="#7B1F2A" strokeWidth="1" opacity="0.5"
          />
        </motion.g>
      ))}
    </svg>
  )
}
