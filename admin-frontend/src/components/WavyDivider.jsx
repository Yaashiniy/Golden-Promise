/**
 * Liquid morph section divider — a soft wave/curve that transitions one
 * section colour into the next. `from` = colour above the wave (top section),
 * `to` = colour below (next section). Height controls the wave's height.
 *
 *   `flip` mirrors the wave for the opposite direction.
 *   `variant` picks a shape: 'wave' | 'curve' | 'blob'.
 */
export function WavyDivider({
  from = '#ffffff',
  to = '#4E1218',
  height = 100,
  flip = false,
  variant = 'wave',
  className = '',
}) {
  // Fill the top area with `from`, the SVG shape carves into `to` below.
  const paths = {
    wave: 'M 0 60 C 240 100, 480 20, 720 60 C 960 100, 1200 20, 1440 60 L 1440 100 L 0 100 Z',
    curve: 'M 0 0 Q 720 100, 1440 0 L 1440 100 L 0 100 Z',
    blob:  'M 0 40 C 200 20, 320 90, 520 60 C 720 30, 900 100, 1100 65 C 1250 40, 1350 80, 1440 55 L 1440 100 L 0 100 Z',
  }

  return (
    <div
      className={`relative w-full pointer-events-none ${className}`}
      style={{
        height,
        background: from,
        transform: flip ? 'scaleY(-1)' : undefined,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full block"
      >
        <path d={paths[variant] ?? paths.wave} fill={to} />
      </svg>
    </div>
  )
}
