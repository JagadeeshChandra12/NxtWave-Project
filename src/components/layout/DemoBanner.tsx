import { getConfig } from '../../lib/config'

export default function DemoBanner() {
  const cfg = getConfig()
  if (!cfg.demoMode) return null
  return (
    <div className="bg-lime border-b-2 border-ink text-ink text-xs font-mono px-4 py-2 text-center">
      DEMO MODE — sample data may be present. No real registrations, attendance, or winners are claimed.
    </div>
  )
}
