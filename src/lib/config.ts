import type { AppConfig } from '../types'

const DEFAULT_CONFIG: AppConfig = {
  workshopTitle: 'Build Your First AI Project in 60 Minutes',
  workshopDescription:
    'A free, beginner-friendly 60-minute session for final-year engineering students. Learn how to take a rough AI project idea and turn it into a realistic, buildable starter project.',
  workshopDate: '2026-10-30',
  workshopStartTime: '10:00',
  workshopEndTime: '11:00',
  workshopTimezone: 'Asia/Kolkata',
  trainer: '',
  registrationDeadline: '',
  competitionOpen: true,
  submissionDeadline: '',
  resultsPublished: false,
  prizesApproved: false,
  prizes: { first: 1000, second: 600, third: 400 },
  features: { passport: true, competition: true, certificates: true, referral: true },
  adminEmails: [],
  judgeEmails: [],
  demoMode: true,
}

const KEY = 'bl60_config'

export function getConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULT_CONFIG }
}

export function setConfig(patch: Partial<AppConfig>) {
  const next = { ...getConfig(), ...patch }
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function resetConfig() {
  localStorage.removeItem(KEY)
  return getConfig()
}
