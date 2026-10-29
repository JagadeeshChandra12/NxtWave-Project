import { useEffect, useState } from 'react'
import { workshopStart } from '../lib/datetime'

export default function Countdown() {
  const [now, setNow] = useState(() => Date.now())
  const [start, setStart] = useState<Date | null>(() => workshopStart())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    // refresh start in case config changed
    setStart(workshopStart())
    return () => clearInterval(t)
  }, [])

  if (!start) {
    return <div className="text-center font-display text-2xl font-bold">Workshop date coming soon</div>
  }
  const diff = start.getTime() - now
  if (diff <= 0 && diff > -1000 * 60 * 60 * 4) {
    // within 4 hours after start -> started
    return <div className="text-center font-display text-2xl font-bold text-cobalt">Workshop is live now</div>
  }
  if (diff < -1000 * 60 * 60 * 4) {
    return <div className="text-center font-display text-2xl font-bold">Workshop completed</div>
  }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="flex justify-center gap-3 md:gap-6">
      {[
        { v: days, l: 'Days' },
        { v: hours, l: 'Hours' },
        { v: mins, l: 'Minutes' },
        { v: secs, l: 'Seconds' },
      ].map(x => (
        <div key={x.l} className="card p-4 md:p-6 text-center min-w-[70px]">
          <div className="font-display text-3xl md:text-5xl font-bold text-cobalt">{pad(x.v)}</div>
          <div className="label-mono mt-1">{x.l}</div>
        </div>
      ))}
    </div>
  )
}
