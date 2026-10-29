import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { generatePlan } from '../services/planService'
import { planStore } from '../services/planStore'
import { useAuth } from '../lib/auth'
import type { ProjectPlan, Experience, Category } from '../types'
import Button from '../components/ui/Button'

const schema = z.object({
  idea: z.string().min(5, 'Tell us a bit more about your idea'),
  problem: z.string().min(5, 'Describe the problem it solves'),
  experience: z.enum(['beginner','intermediate','advanced']),
  category: z.enum(['web','ai','education','healthcare','productivity','fintech','sustainability','open']),
  techPref: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const EXAMPLES = [
  'An app that helps students prepare for technical interviews',
  'A chatbot that answers questions about my college',
  'A dashboard showing parking availability on campus',
]

export default function PlannerPage() {
  const [params] = useSearchParams()
  const { user } = useAuth()
  const [plan, setPlan] = useState<ProjectPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { experience: 'beginner', category: 'ai', idea: params.get('idea') || '', problem: params.get('problem') || '' },
  })

  useEffect(() => {
    const idea = params.get('idea')
    const problem = params.get('problem')
    if (idea) setValue('idea', idea)
    if (problem) setValue('problem', problem)
  }, [params, setValue])

  const onSubmit = async (values: FormValues) => {
    setLoading(true); setError(null)
    try {
      await new Promise(r => setTimeout(r, 600))
      const p = generatePlan({ idea: values.idea, problem: values.problem, experience: values.experience as Experience, category: values.category as Category, techPref: values.techPref, ownerId: user?.id })
      setPlan(p)
      planStore.save(p)
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const planText = (p: ProjectPlan) => [
    `# ${p.title}`, p.description, '', `Problem: ${p.problemStatement}`, `User: ${p.intendedUser}`, '',
    `Starter scope: ${p.starterScope}`, '', 'Core features:', ...p.coreFeatures.map(f=>`- ${f}`), '',
    'Tech stack:', ...p.techStack.map(t=>`- ${t}`), '', '60-minute schedule:', ...p.schedule.map(s=>`${s.time} - ${s.task}`), '',
    'Architecture: ' + p.architecture, '', 'Build steps:', ...p.buildSteps.map((b,i)=>`${i+1}. ${b}`), '',
    'Excluded from v1:', ...p.excluded.map(e=>`- ${e}`), '', 'Next steps:', ...p.nextSteps.map(n=>`- ${n}`),
  ].join('\n')

  const copy = async () => {
    if (!plan) return
    await navigator.clipboard.writeText(planText(plan))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    if (!plan) return
    const blob = new Blob([planText(plan)], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${plan.title}.txt`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="label-mono mb-2">AI Project Planner</div>
      <h1 className="font-display text-4xl md:text-5xl font-bold">Make your idea buildable.</h1>
      <p className="text-ink/70 mt-2 max-w-2xl">Answer a few questions. Get a scoped 60-minute starter plan you can actually ship.</p>

      {!plan ? (
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 card p-6 space-y-5">
            <div>
              <label className="label-mono block mb-2">What is your project idea?</label>
              <textarea {...register('idea')} rows={3} className="w-full border-2 border-ink p-3 font-body" placeholder="e.g. An app that helps students prepare for technical interviews" />
              {errors.idea && <p className="text-coral text-sm mt-1">{errors.idea.message}</p>}
            </div>
            <div>
              <label className="label-mono block mb-2">What problem should it solve?</label>
              <textarea {...register('problem')} rows={2} className="w-full border-2 border-ink p-3" placeholder="e.g. Students don't know what to study" />
              {errors.problem && <p className="text-coral text-sm mt-1">{errors.problem.message}</p>}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-mono block mb-2">Programming experience</label>
                <select {...register('experience')} className="w-full border-2 border-ink p-3 bg-white">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="label-mono block mb-2">Area of interest</label>
                <select {...register('category')} className="w-full border-2 border-ink p-3 bg-white">
                  <option value="web">Web development</option>
                  <option value="ai">AI and machine learning</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="productivity">Productivity</option>
                  <option value="fintech">Fintech</option>
                  <option value="sustainability">Sustainability</option>
                  <option value="open">Open category</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label-mono block mb-2">Preferred technology (optional)</label>
              <input {...register('techPref')} className="w-full border-2 border-ink p-3" placeholder="e.g. React, Python, Supabase" />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" loading={loading}>Make My Idea Buildable</Button>
              <button type="button" onClick={() => { setValue('idea', EXAMPLES[0]); setValue('problem', 'Students struggle to prepare'); }} className="btn-ghost text-sm py-2 px-4">Try an example</button>
            </div>
            {error && <p className="text-coral text-sm">{error}</p>}
          </form>
          <div className="card p-6">
            <div className="label-mono mb-3">Example prompts</div>
            <ul className="space-y-3 text-sm">
              {EXAMPLES.map(e => (
                <li key={e}>
                  <button onClick={() => setValue('idea', e)} className="text-left hover:text-cobalt underline">{e}</button>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-xs font-mono text-ink/50">No AI API key? This planner uses a built-in rules engine with templates. Outputs vary by your inputs.</div>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          <div className="card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="label-mono">Generated plan</span>
              <span className="text-xs font-mono bg-lime px-2 py-1 border border-ink">{plan.difficulty}</span>
            </div>
            <h2 className="font-display text-3xl font-bold">{plan.title}</h2>
            <p className="text-ink/80">{plan.description}</p>
            <div><div className="label-mono mb-1">Problem</div><p className="text-sm">{plan.problemStatement}</p></div>
            <div><div className="label-mono mb-1">Intended user</div><p className="text-sm">{plan.intendedUser}</p></div>
            <div><div className="label-mono mb-1">Starter scope</div><p className="text-sm">{plan.starterScope}</p></div>
            <div>
              <div className="label-mono mb-1">Three core features</div>
              <ul className="text-sm space-y-1">{plan.coreFeatures.map(f => <li key={f}>- {f}</li>)}</ul>
            </div>
            <div>
              <div className="label-mono mb-1">Tech stack</div>
              <div className="flex flex-wrap gap-2">{plan.techStack.map(t => <span key={t} className="text-xs font-mono px-2 py-1 border border-ink">{t}</span>)}</div>
            </div>
            <div>
              <div className="label-mono mb-1">60-minute schedule</div>
              <ul className="text-sm space-y-1">{plan.schedule.map(s => <li key={s.time}><span className="font-mono text-cobalt">{s.time}</span> — {s.task}</li>)}</ul>
            </div>
            <div><div className="label-mono mb-1">Architecture</div><p className="text-sm">{plan.architecture}</p></div>
            <div>
              <div className="label-mono mb-1">Build steps</div>
              <ol className="text-sm space-y-1 list-decimal list-inside">{plan.buildSteps.map(b => <li key={b}>{b}</li>)}</ol>
            </div>
            <div>
              <div className="label-mono mb-1">Excluded from v1</div>
              <ul className="text-sm space-y-1">{plan.excluded.map(e => <li key={e}>- {e}</li>)}</ul>
            </div>
            <div>
              <div className="label-mono mb-1">Next steps</div>
              <ul className="text-sm space-y-1">{plan.nextSteps.map(n => <li key={n}>- {n}</li>)}</ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card p-6">
              <div className="label-mono mb-3">Actions</div>
              <div className="flex flex-col gap-3">
                <Button onClick={() => { setPlan(null) }}>Edit idea</Button>
                <Button variant="ghost" onClick={() => { setPlan(null); setTimeout(()=>document.querySelector('form')?.requestSubmit(),50) }}>Generate another</Button>
                <Button variant="outline" onClick={copy}>{copied ? 'Copied!' : 'Copy plan'}</Button>
                <Button variant="outline" onClick={download}>Download plan</Button>
                <Button variant="lime" onClick={() => { if (user) { const p = { ...plan, ownerId: user.id }; planStore.save(p) } else { window.location.href = '/login?next=/passport' } }}>Save project to passport</Button>
                <Link to="/workshop" className="btn-primary text-center">Register for the workshop</Link>
              </div>
            </div>
            <div className="card p-6 text-xs font-mono text-ink/60">
              The 60-minute estimate is a suggested starter plan, not a guarantee. Adjust scope to your level.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

