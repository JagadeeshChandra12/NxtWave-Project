import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { competitionService } from '../services/competitionService'
import { registrationService } from '../services/registrationService'
import { getConfig } from '../lib/config'
import { useAuth } from '../lib/auth'
import Button from '../components/ui/Button'

const regSchema = z.object({
  name: z.string().min(2), email: z.string().email(), projectTitle: z.string().min(2),
  description: z.string().min(10), participation: z.enum(['solo','team']), teamMembers: z.string().optional(),
  rulesAgreed: z.boolean().refine(v=>v===true,'You must agree to the rules'),
})
const subSchema = z.object({
  title: z.string().min(2), problem: z.string().min(5), description: z.string().min(10),
  features: z.string().min(5), technologies: z.string().min(2), aiComponent: z.string().min(5),
  githubUrl: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  declaration: z.boolean().refine(v=>v===true,'Declaration required'),
})

type RegV = z.infer<typeof regSchema>
type SubV = z.infer<typeof subSchema>

export default function BuildBattlePage() {
  const cfg = getConfig()
  const { user } = useAuth()
  const [params] = useSearchParams()
  const [tab, setTab] = useState<'info'|'register'|'submit'|'status'>('info')
  const [reg, setReg] = useState<any>(null)
  const [error, setError] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState<any>(null)

  const regForm = useForm<RegV>({ resolver: zodResolver(regSchema), defaultValues: { participation: 'solo', rulesAgreed: false } })
  const subForm = useForm<SubV>({ resolver: zodResolver(subSchema), defaultValues: { declaration: false } })

  useEffect(() => {
    if (user?.email) regForm.setValue('email', user.email)
    if (user?.name) regForm.setValue('name', user.name)
  }, [user, regForm])

  const onRegister = async (v: RegV) => {
    setLoading(true); setError(null)
    try {
      const r = await competitionService.regs.create({
        registrationId: undefined,
        name: v.name, email: v.email, projectTitle: v.projectTitle, description: v.description,
        participation: v.participation, teamMembers: v.teamMembers ? v.teamMembers.split(',').map(s=>s.trim()) : [],
        rulesAgreed: v.rulesAgreed, status: 'registered',
      })
      setReg(r)
      setTab('submit')
    } catch (e:any) { setError(e?.message || 'Failed') } finally { setLoading(false) }
  }

  const onSubmit = async (v: SubV) => {
    if (!reg) { setError('Register for the competition first.'); return }
    setLoading(true); setError(null)
    try {
      const deadline = cfg.submissionDeadline ? new Date(cfg.submissionDeadline) : null
      if (deadline && new Date() > deadline) throw new Error('Submission deadline has passed')
      const s = await competitionService.submissions.create({
        competitionRegId: reg.id, title: v.title, problem: v.problem, description: v.description,
        features: v.features.split(',').map(s=>s.trim()), technologies: v.technologies.split(',').map(s=>s.trim()),
        aiComponent: v.aiComponent, githubUrl: v.githubUrl || undefined, demoUrl: v.demoUrl || undefined,
        videoUrl: v.videoUrl || undefined, declaration: v.declaration, locked: false,
      })
      setSubmitted(s)
      await competitionService.regs.update(reg.id, { status: 'submitted' })
    } catch (e:any) { setError(e?.message || 'Failed') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="label-mono mb-2">Build Battle</div>
      <h1 className="font-display text-4xl md:text-5xl font-bold">Build Battle: Take Your AI Idea Further</h1>
      <p className="text-ink/70 mt-2">Your first AI project is only the beginning. Develop it further, submit your work, and compete to have your project recognised.</p>

      <div className="flex gap-2 mt-6 flex-wrap">
        {(['info','register','submit','status'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 border-2 border-ink text-sm font-mono ${tab===t?'bg-cobalt text-white':'bg-white'}`}>{t.toUpperCase()}</button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="mt-8 space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-2xl font-bold mb-3">What is the Build Battle?</h2>
            <p className="text-sm text-ink/80">A follow-up competition to the free workshop. Participants develop their starter projects further and submit for judging.</p>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-2xl font-bold mb-3">Who can participate</h2>
            <p className="text-sm text-ink/80">Students who attended or registered for the workshop. Express interest before the workshop if submissions open later.</p>
          </div>
            <div className="card p-6">
              <h2 className="font-display text-2xl font-bold mb-3">Judging criteria — 100 points</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Functionality & demo', pts: 35 },
                  { label: 'Problem clarity & usefulness', pts: 25 },
                  { label: 'Originality & AI usage', pts: 20 },
                  { label: 'Presentation & docs', pts: 20 },
                ].map(c => (
                  <div key={c.label} className="border-2 border-ink p-3">
                    <div className="font-display text-2xl font-bold text-cobalt">{c.pts}</div>
                    <div className="text-xs text-ink/70 mt-1">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h2 className="font-display text-2xl font-bold mb-3">Prizes</h2>
              {cfg.prizesApproved ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>1st place</span><span className="font-mono font-bold">₹{cfg.prizes.first}</span></div>
                  <div className="flex justify-between text-sm"><span>2nd place</span><span className="font-mono font-bold">₹{cfg.prizes.second}</span></div>
                  <div className="flex justify-between text-sm"><span>3rd place</span><span className="font-mono font-bold">₹{cfg.prizes.third}</span></div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-ink/70">Proposed prizes, awaiting organizer approval:</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between"><span>1st place</span><span className="font-mono">₹{cfg.prizes.first}</span></div>
                    <div className="flex justify-between"><span>2nd place</span><span className="font-mono">₹{cfg.prizes.second}</span></div>
                    <div className="flex justify-between"><span>3rd place</span><span className="font-mono">₹{cfg.prizes.third}</span></div>
                  </div>
                  <p className="text-xs font-mono text-ink/50 mt-3">Not yet approved.</p>
                </div>
              )}
            </div>
            <div className="text-center"><Link to="/leaderboard" className="btn-ghost">View Leaderboard</Link></div>
            <div className="card p-6 text-sm font-mono text-ink/60">
              Submission deadline: {cfg.submissionDeadline || 'To be announced (unconfirmed)'} · Results: {cfg.resultsPublished ? 'Published' : 'Not yet published'}
            </div>
          </div>
      )}

      {tab === 'register' && (
        <form onSubmit={regForm.handleSubmit(onRegister)} className="card p-6 mt-8 space-y-4">
          <h2 className="font-display text-2xl font-bold">Competition registration</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label-mono block mb-1">Name *</label><input {...regForm.register('name')} className="w-full border-2 border-ink p-3" />{regForm.formState.errors.name && <p className="text-coral text-sm">{regForm.formState.errors.name.message}</p>}</div>
            <div><label className="label-mono block mb-1">Email *</label><input type="email" {...regForm.register('email')} className="w-full border-2 border-ink p-3" />{regForm.formState.errors.email && <p className="text-coral text-sm">{regForm.formState.errors.email.message}</p>}</div>
          </div>
          <div><label className="label-mono block mb-1">Project title / proposed idea *</label><input {...regForm.register('projectTitle')} className="w-full border-2 border-ink p-3" />{regForm.formState.errors.projectTitle && <p className="text-coral text-sm">{regForm.formState.errors.projectTitle.message}</p>}</div>
          <div><label className="label-mono block mb-1">Short description *</label><textarea {...regForm.register('description')} rows={3} className="w-full border-2 border-ink p-3" />{regForm.formState.errors.description && <p className="text-coral text-sm">{regForm.formState.errors.description.message}</p>}</div>
          <div>
            <label className="label-mono block mb-1">Participation *</label>
            <select {...regForm.register('participation')} className="w-full border-2 border-ink p-3 bg-white">
              <option value="solo">Solo</option>
              <option value="team">Team</option>
            </select>
          </div>
          <div><label className="label-mono block mb-1">Team members (comma-separated, optional)</label><input {...regForm.register('teamMembers')} className="w-full border-2 border-ink p-3" /></div>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" {...regForm.register('rulesAgreed')} className="mt-1" /> I agree to the competition rules.</label>
          {regForm.formState.errors.rulesAgreed && <p className="text-coral text-sm">{regForm.formState.errors.rulesAgreed.message}</p>}
          {error && <p className="text-coral text-sm">{error}</p>}
          <Button type="submit" loading={loading}>Register interest</Button>
        </form>
      )}

      {tab === 'submit' && (
        <div className="mt-8">
          {!reg && <p className="text-sm text-ink/70">Register for the competition first (Register tab).</p>}
          {reg && (
            <form onSubmit={subForm.handleSubmit(onSubmit)} className="card p-6 space-y-4">
              <h2 className="font-display text-2xl font-bold">Project submission</h2>
              <div><label className="label-mono block mb-1">Final project title *</label><input {...subForm.register('title')} className="w-full border-2 border-ink p-3" />{subForm.formState.errors.title && <p className="text-coral text-sm">{subForm.formState.errors.title.message}</p>}</div>
              <div><label className="label-mono block mb-1">Problem statement *</label><input {...subForm.register('problem')} className="w-full border-2 border-ink p-3" />{subForm.formState.errors.problem && <p className="text-coral text-sm">{subForm.formState.errors.problem.message}</p>}</div>
              <div><label className="label-mono block mb-1">Project description *</label><textarea {...subForm.register('description')} rows={3} className="w-full border-2 border-ink p-3" />{subForm.formState.errors.description && <p className="text-coral text-sm">{subForm.formState.errors.description.message}</p>}</div>
              <div><label className="label-mono block mb-1">Features implemented (comma-separated) *</label><input {...subForm.register('features')} className="w-full border-2 border-ink p-3" />{subForm.formState.errors.features && <p className="text-coral text-sm">{subForm.formState.errors.features.message}</p>}</div>
              <div><label className="label-mono block mb-1">Technologies used (comma-separated) *</label><input {...subForm.register('technologies')} className="w-full border-2 border-ink p-3" />{subForm.formState.errors.technologies && <p className="text-coral text-sm">{subForm.formState.errors.technologies.message}</p>}</div>
              <div><label className="label-mono block mb-1">AI component and purpose *</label><input {...subForm.register('aiComponent')} className="w-full border-2 border-ink p-3" />{subForm.formState.errors.aiComponent && <p className="text-coral text-sm">{subForm.formState.errors.aiComponent.message}</p>}</div>
              <div className="grid md:grid-cols-3 gap-4">
                <div><label className="label-mono block mb-1">GitHub URL</label><input {...subForm.register('githubUrl')} className="w-full border-2 border-ink p-3" /></div>
                <div><label className="label-mono block mb-1">Live demo URL</label><input {...subForm.register('demoUrl')} className="w-full border-2 border-ink p-3" /></div>
                <div><label className="label-mono block mb-1">Demo video URL</label><input {...subForm.register('videoUrl')} className="w-full border-2 border-ink p-3" /></div>
              </div>
              <label className="flex items-start gap-2 text-sm"><input type="checkbox" {...subForm.register('declaration')} className="mt-1" /> This project is my own work (or all contributions are acknowledged).</label>
              {subForm.formState.errors.declaration && <p className="text-coral text-sm">{subForm.formState.errors.declaration.message}</p>}
              {error && <p className="text-coral text-sm">{error}</p>}
              {submitted && <p className="text-green-700 text-sm">Submitted! ID: {submitted.id}</p>}
              <Button type="submit" loading={loading}>Submit project</Button>
            </form>
          )}
        </div>
      )}

      {tab === 'status' && (
        <div className="mt-8 card p-6 text-sm">
          <p>Registration: {reg ? reg.id : 'not registered'}</p>
          <p>Submission: {submitted ? submitted.id : 'not submitted'}</p>
          <p>Results: {cfg.resultsPublished ? 'Published (see admin/public results)' : 'Not yet published'}</p>
        </div>
      )}
    </div>
  )
}



