export type Experience = 'beginner' | 'intermediate' | 'advanced'
export type Category = 'web' | 'ai' | 'education' | 'healthcare' | 'productivity' | 'fintech' | 'sustainability' | 'open'

export interface ProjectPlan {
  id: string
  idea: string
  problem: string
  experience: Experience
  category: Category
  techPref?: string
  title: string
  description: string
  problemStatement: string
  intendedUser: string
  starterScope: string
  coreFeatures: string[]
  techStack: string[]
  schedule: { time: string; task: string }[]
  architecture: string
  buildSteps: string[]
  excluded: string[]
  nextSteps: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  createdAt: string
  ownerId?: string
}

export interface Registration {
  id: string
  fullName: string
  email: string
  college: string
  branch: string
  graduationYear: number
  phone?: string
  projectIdea?: string
  referralCode?: string
  consent: boolean
  source?: string
  medium?: string
  campaign?: string
  referringPage?: string
  referredBy?: string
  createdAt: string
  attendanceVerified?: boolean
  certificateId?: string
}

export interface Passport {
  id: string
  ownerId: string
  displayName: string
  projectTitle: string
  problem: string
  description: string
  technologies: string[]
  aiCapability: string
  learned: string
  githubUrl?: string
  demoUrl?: string
  screenshotUrl?: string
  status: 'idea' | 'in-progress' | 'completed' | 'showcased'
  workshopParticipated?: boolean
  public: boolean
  shareToken?: string
  createdAt: string
  updatedAt: string
}

export interface CompetitionRegistration {
  id: string
  registrationId?: string
  name: string
  email: string
  projectTitle: string
  description: string
  participation: 'solo' | 'team'
  teamMembers?: string[]
  rulesAgreed: boolean
  status: 'interest' | 'registered' | 'submitted' | 'under-review' | 'results-announced'
  createdAt: string
}

export interface Submission {
  id: string
  competitionRegId: string
  title: string
  problem: string
  description: string
  features: string[]
  technologies: string[]
  aiComponent: string
  githubUrl?: string
  demoUrl?: string
  videoUrl?: string
  screenshots?: string[]
  declaration: boolean
  submittedAt: string
  locked: boolean
}

export interface Score {
  id: string
  submissionId: string
  judgeId: string
  functionality: number
  usefulness: number
  originality: number
  presentation: number
  comments: string
  total: number
  state: 'draft' | 'submitted'
  createdAt: string
  updatedAt: string
}

export interface Certificate {
  id: string
  registrationId: string
  participantName: string
  workshopTitle: string
  date: string
  certificateId: string
  issuedAt: string
  issuedBy: string
}

export interface AppConfig {
  workshopTitle: string
  workshopDescription: string
  workshopDate?: string
  workshopStartTime?: string
  workshopEndTime?: string
  workshopTimezone?: string
  trainer?: string
  registrationDeadline?: string
  competitionOpen: boolean
  submissionDeadline?: string
  resultsPublished: boolean
  prizesApproved: boolean
  prizes: { first: number; second: number; third: number }
  features: { passport: boolean; competition: boolean; certificates: boolean; referral: boolean }
  adminEmails: string[]
  judgeEmails: string[]
  demoMode: boolean
}

export interface User {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin' | 'judge'
}
