import { Award } from 'lucide-react'

export function GoldProBadge({ className = '' }) {
  return (
    <span className={`golpro-badge ${className}`.trim()} aria-label="GoldPro Elite vendor">
      <Award aria-hidden="true" />
      <span>GoldPro</span>
    </span>
  )
}
