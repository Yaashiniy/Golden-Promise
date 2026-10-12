export function Logo({ className = 'h-12', dark = false, logoOnly = false, compact = false }) {
  const text = dark ? '#380a10' : '#7b1f2a'
  return (
    <div className={`flex items-center gap-3 min-w-0 ${className}`}>
      <img
        src="/logo-hands.png"
        alt="Golden Promise Logo"
        className={`h-full w-auto object-contain shrink-0 ${dark ? 'invert' : ''}`}
      />
      {!logoOnly && (
        <span
          style={{ fontFamily: 'var(--font-script)', fontSize: compact ? 'clamp(18px, 5vw, 28px)' : 'clamp(26px, 7vw, 40px)' }}
          className="leading-none whitespace-nowrap gold-text-effect font-normal tracking-wide pb-1 min-w-0"
        >
          Golden Promise
        </span>
      )}
    </div>
  )
}
