import type { ProjectPlan, Experience, Category } from '../types'
import { uid } from '../lib/storage'

interface PlanInput {
  idea: string; problem: string; experience: Experience; category: Category; techPref?: string; ownerId?: string
}

const TITLES: Record<Category, string[]> = {
  web: ['Web App','Dashboard','Portal'], ai: ['AI Assistant','AI Tutor','Smart Classifier'],
  education: ['Learning Companion','Study Helper','Quiz Generator'], healthcare: ['Health Tracker','Symptom Guide','Wellness Coach'],
  productivity: ['Task Automator','Focus Assistant','Workflow Helper'], fintech: ['Expense Tracker','Budget Coach','Savings Assistant'],
  sustainability: ['Carbon Tracker','Waste Reducer','Green Insights'], open: ['Idea Prototype','Mini Tool','Smart Helper'],
}

const TECH: Record<string, string[]> = {
  web: ['React','Vite','Tailwind CSS','Supabase'], ai: ['Python','FastAPI','OpenAI API','React'],
  education: ['React','Node.js','OpenAI API','PostgreSQL'], healthcare: ['React','Node.js','PostgreSQL','Chart.js'],
  productivity: ['React','Vite','LocalStorage','Tailwind'], fintech: ['React','Node.js','PostgreSQL','Chart.js'],
  sustainability: ['React','Python','PostgreSQL','Chart.js'], open: ['React','Vite','Tailwind CSS'],
}

function normalizeIdea(idea: string){ return idea.trim().replace(/\s+/g,' ') }
function deriveTitle(idea: string, category: Category): string {
  const words = idea.split(/\s+/).filter(w=>w.length>3).slice(0,3)
  const base = words.map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ')
  const suffix = TITLES[category][Math.floor(Math.random()*TITLES[category].length)]
  return base ? `${base} ${suffix}` : `${suffix}`
}
function difficulty(exp: Experience): ProjectPlan['difficulty'] {
  return exp==='beginner'?'Beginner':exp==='intermediate'?'Intermediate':'Advanced'
}
const SCOPE: Record<Experience,string> = {
  beginner: 'A single working screen with one core action, sample data, no auth. Demonstrate the idea, not production quality.',
  intermediate: 'A small multi-screen app with basic state and one real data flow. Skip auth, payments, admin for v1.',
  advanced: 'A focused MVP with one complete user journey, basic persistence, simple API. Defer scaling and multi-tenancy.',
}
const SCHED_BEGINNER = [
  {time:'0-10 min',task:'Define the single user action; sketch the screen on paper.'},
  {time:'10-25 min',task:'Build the input form and basic layout with React + Tailwind.'},
  {time:'25-40 min',task:'Add core logic (rules or simple API) and render result.'},
  {time:'40-50 min',task:'Handle empty, loading, and error states.'},
  {time:'50-60 min',task:'Polish styling, test once, write a short README.'},
]
const SCHED_OTHER = [
  {time:'0-10 min',task:'Scope the MVP; list 3 must-have features.'},
  {time:'10-25 min',task:'Scaffold routes, layout, and data model.'},
  {time:'25-40 min',task:'Implement core feature end-to-end with persistence.'},
  {time:'40-50 min',task:'Add secondary feature and validation.'},
  {time:'50-60 min',task:'Test, refine UX, document next steps.'},
]
const BUILD_STEPS = [
  'Write one sentence describing who this is for and what success looks like.',
  'List the three features you will actually build in v1.',
  'Create a new Vite + React + TypeScript project and add Tailwind.',
  'Build the input form and validate it with Zod.',
  'Implement the core transformation (rules or API) and render the output.',
  'Add loading, empty, and error states.',
  'Persist results in localStorage (or Supabase later).',
  'Style with the design system and test on mobile.',
  'Write a short README with setup steps and known limitations.',
]
const EXCLUDED = ['User authentication and accounts','Payment or monetization flows','Admin dashboards','Multi-language support','Production-grade security hardening']
const NEXT = ['Replace rule-based logic with a real AI API behind a server endpoint.','Add Supabase for auth and persistent storage.','Improve result quality with better prompts and validation.','Add a shareable link and basic analytics.','Collect feedback from 3 real users and iterate.']
function intendedUser(cat: Category): string {
  return cat==='education'?'Students preparing for exams':cat==='healthcare'?'Individuals tracking personal health':cat==='fintech'?'Young professionals managing money':cat==='productivity'?'Busy students and early professionals':cat==='sustainability'?'Environmentally conscious users':'Users with the stated problem'
}
export function generatePlan(input: PlanInput): ProjectPlan {
  const idea = normalizeIdea(input.idea)
  const problem = normalizeIdea(input.problem) || `People struggle with ${idea.toLowerCase()}`
  const category = input.category
  const exp = input.experience
  const techPref = input.techPref?.trim()
  const techStack = techPref ? [techPref, ...TECH[category].filter(t => t.toLowerCase() !== techPref.toLowerCase())] : [...TECH[category]]
  const title = deriveTitle(idea, category)
  const iu = intendedUser(category)
  const coreFeatures = [
    `Capture the user's input for: ${idea.slice(0, 60)}`,
    'Process and return a useful, readable result',
    'Save or revisit the result locally',
  ]
  const schedule = exp === 'beginner' ? SCHED_BEGINNER : SCHED_OTHER
  const architecture = `User enters input -> client validates -> ${exp === 'beginner' ? 'local rule engine' : 'API endpoint'} processes -> result rendered in a card -> optionally saved to localStorage. No backend required for v1.`
  const plan: ProjectPlan = {
    id: uid('plan'), idea, problem, experience: exp, category, techPref: techPref || undefined,
    title, description: `A ${difficulty(exp).toLowerCase()}-level starter project that helps ${iu.toLowerCase()} with ${idea.toLowerCase()}.`,
    problemStatement: problem, intendedUser: iu, starterScope: SCOPE[exp], coreFeatures, techStack, schedule, architecture,
    buildSteps: BUILD_STEPS, excluded: EXCLUDED, nextSteps: NEXT, difficulty: difficulty(exp),
    createdAt: new Date().toISOString(), ownerId: input.ownerId,
  }
  return plan
}

