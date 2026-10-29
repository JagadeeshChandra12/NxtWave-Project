import { getConfig } from './config'

export function workshopStart(): Date | null {
  const cfg = getConfig()
  if (!cfg.workshopDate) return null
  const time = cfg.workshopStartTime || '00:00'
  const tz = cfg.workshopTimezone || 'Asia/Kolkata'
  try {
    // Build an ISO string with offset by using Intl is complex; use local interpretation then adjust.
    // We'll treat the configured date+time in the configured timezone by constructing a date string
    // and using Date.parse with the timezone via a formatter approach.
    const iso = `${cfg.workshopDate}T${time}:00`
    // Interpret in configured tz by computing offset
    const d = new Date(iso + 'Z') // treat as UTC first
    // Adjust: find offset of tz at that date
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' })
    const parts = fmt.formatToParts(d)
    const off = parts.find(p => p.type === 'timeZoneName')?.value || ''
    // off like GMT+5:30
    const m = off.match(/GMT([+-])(\d{1,2}):?(\d{2})?/)
    if (m) {
      const sign = m[1] === '+' ? 1 : -1
      const hh = parseInt(m[2], 10)
      const mm = parseInt(m[3] || '0', 10)
      const offsetMs = sign * (hh * 60 + mm) * 60000
      // local wall time in tz = UTC + offset; we want the wall time to be iso, so UTC = iso - offset
      return new Date(new Date(iso + 'Z').getTime() - offsetMs)
    }
    return new Date(iso)
  } catch {
    return null
  }
}

export function workshopEnd(): Date | null {
  const cfg = getConfig()
  if (!cfg.workshopDate) return null
  const time = cfg.workshopEndTime || cfg.workshopStartTime || '00:00'
  const tz = cfg.workshopTimezone || 'Asia/Kolkata'
  // reuse logic by temporarily overriding? Simpler: compute start offset then apply end time
  const base = cfg.workshopDate + 'T' + time + ':00'
  try {
    const d = new Date(base + 'Z')
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' })
    const parts = fmt.formatToParts(d)
    const off = parts.find(p => p.type === 'timeZoneName')?.value || ''
    const m = off.match(/GMT([+-])(\d{1,2}):?(\d{2})?/)
    if (m) {
      const sign = m[1] === '+' ? 1 : -1
      const hh = parseInt(m[2], 10)
      const mm = parseInt(m[3] || '0', 10)
      const offsetMs = sign * (hh * 60 + mm) * 60000
      return new Date(new Date(base + 'Z').getTime() - offsetMs)
    }
    return new Date(base)
  } catch {
    return null
  }
}

export function formatWorkshopDateTime(): string {
  const cfg = getConfig()
  const s = workshopStart()
  if (!s) return 'Date and time to be announced'
  const tz = cfg.workshopTimezone || 'Asia/Kolkata'
  const dateStr = new Intl.DateTimeFormat('en-IN', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(s)
  const startStr = new Intl.DateTimeFormat('en-IN', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true }).format(s)
  const e = workshopEnd()
  const endStr = e ? new Intl.DateTimeFormat('en-IN', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true }).format(e) : ''
  return `${dateStr}, ${startStr}${endStr ? ' – ' + endStr : ''} (${tz})`
}
