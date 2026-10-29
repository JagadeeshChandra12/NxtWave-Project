import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../lib/auth'
import { passportService } from '../services/passportService'
import { generatePlan } from '../services/planService'
import { planStore } from '../services/planStore'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import Button from '../components/ui/Button'

const STATUSES = ['idea','in-progress','completed','showcased'] as const

const SAMPLES = [
  { title: 'Campus AI Assistant', owner: 'Sample Student', problem: 'New students ask the same campus questions repeatedly.', desc: 'Answers campus FAQs from a small knowledge base using keyword + AI matching.', ai: 'FAQ answering with retrieval over campus docs.', learned: 'Prompt design and scoping an MVP.', stack: ['React','Vite','Tailwind','OpenAI API'], status: 'completed' },
  { title: 'Smart Waste Segregation', owner: 'Sample Student', problem: 'Waste is not sorted correctly in college bins.', desc: 'Classifies waste type from a photo and shows disposal guidance.', ai: 'Image classification for waste categories.', learned: 'Model integration and UX for uncertain predictions.', stack: ['React','Python','FastAPI','TensorFlow'], status: 'in-progress' },
  { title: 'Student Expense Tracker', owner: 'Sample Student', problem: 'Students lose track of daily spending.', desc: 'Logs expenses, categorizes them, and shows monthly summaries.', ai: 'Auto-categorization of expense descriptions.', learned: 'Data modeling and charting.', stack: ['React','Vite','Supabase','Chart.js'], status: 'showcased' },
  { title: 'AI-Powered Study Planner', owner: 'Sample Student', problem: 'Students struggle to plan revision schedules.', desc: 'Generates a personalized study plan from subjects and exam dates.', ai: 'Schedule generation from constraints.', learned: 'Form design and algorithmic planning.', stack: ['React','Vite','Tailwind'], status: 'completed' },
]


export default function PassportPage() {
  const { user } = useAuth()
  const [passports, setPassports] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [qr, setQr] = useState<string>('')
  const [sampleIdx, setSampleIdx] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) { passportService.byOwner(user.id).then(setPassports) }
  }, [user])

  const newPassport = async () => {
    if (!user) { window.location.href = '/login?next=/passport'; return }
    const p = await passportService.create({
      ownerId: user.id, displayName: user.name || user.email, projectTitle: '', problem: '', description: '',
      technologies: [], aiCapability: '', learned: '', status: 'idea', public: false,
    })
    setPassports(await passportService.byOwner(user.id))
    setEditing(p)
  }

  const saveEdit = async (data: any) => {
    if (!editing) return
    const updated = await passportService.update(editing.id, data)
    setEditing(updated)
    setPassports(await passportService.byOwner(user!.id))
  }

  const enableShare = async () => {
    if (!editing) return
    const u = await passportService.enableShare(editing.id)
    setEditing(u)
    setPassports(await passportService.byOwner(user!.id))
    if (u?.shareToken) {
      const url = `${window.location.origin}/p/${u.shareToken}`
      const dataUrl = await QRCode.toDataURL(url)
      setQr(dataUrl)
    }
  }

  const disableShare = async () => {
    if (!editing) return
    const u = await passportService.disableShare(editing.id)
    setEditing(u); setPassports(await passportService.byOwner(user!.id))
  }

  const downloadPng = async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#F7F5EF' })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a'); a.href = url; a.download = `${editing?.projectTitle || 'passport'}.png`; a.click()
  }

  useEffect(() => {
    if (editing?.shareToken) {
      QRCode.toDataURL(`${window.location.origin}/p/${editing.shareToken}`).then(setQr)
    } else setQr('')
  }, [editing])

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid lg:grid-cols-2 gap-8">
        <div>
          <div className="label-mono mb-2">My Project Passport</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">Showcase what you built.</h1>
          <p className="text-ink/80 mt-4">A Project Passport is a shareable project credential - title, problem, stack, AI capability, and what you learned - packaged so recruiters, mentors, and teammates can see your work at a glance.</p>
          <ul className="mt-6 space-y-2 text-sm text-ink/80">
            <li>Create and edit your passport after signing in.</li>
            <li>Download a high-quality PNG for your portfolio.</li>
            <li>Enable a public link with a QR code when you are ready to share.</li>
          </ul>
          <div className="mt-8 flex gap-3 flex-wrap">
            <a href="/login?next=/passport" className="btn-primary">Create My Passport</a>
            <a href="#sample" className="btn-ghost">View Sample Passport</a>
          </div>
        </div>
        <div id="sample" className="card p-6 bg-white relative">
          <span className="absolute top-3 right-3 text-xs font-mono bg-ivory border border-ink px-2 py-1">SAMPLE</span>
          <div className="flex gap-2 flex-wrap mb-4">
            {SAMPLES.map((s, i) => (
              <button key={s.title} onClick={() => setSampleIdx(i)} className={`text-xs font-mono px-2 py-1 border border-ink ${i === sampleIdx ? 'bg-cobalt text-white' : 'bg-white'}`}>{s.title}</button>
            ))}
          </div>
          {(() => { const s = SAMPLES[sampleIdx]; return (
            <>
              <div className="label-mono mb-2">Project Passport</div>
              <h2 className="font-display text-3xl font-bold">{s.title}</h2>
              <p className="text-sm text-ink/70 mt-1">by {s.owner}</p>
              <div className="mt-4"><div className="label-mono mb-1">Problem</div><p className="text-sm">{s.problem}</p></div>
              <div className="mt-3"><div className="label-mono mb-1">Description</div><p className="text-sm">{s.desc}</p></div>
              <div className="mt-3"><div className="label-mono mb-1">AI capability</div><p className="text-sm">{s.ai}</p></div>
              <div className="mt-3"><div className="label-mono mb-1">Learned</div><p className="text-sm">{s.learned}</p></div>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.stack.map(t => <span key={t} className="text-xs font-mono px-2 py-1 border border-ink">{t}</span>)}
              </div>
              <div className="mt-3 text-xs font-mono text-ink/60">Status: {s.status}</div>
              <div className="mt-4 h-24 border-2 border-dashed border-ink/30 flex items-center justify-center bg-ivory text-xs font-mono text-ink/40">Project screenshot placeholder</div>
          <div className="mt-4 text-xs font-mono text-ink/50">Created with BuildLab 60</div>
            </>
          ) })()}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid lg:grid-cols-2 gap-8">
      <div>
        <div className="label-mono mb-2">My Project Passport</div>
        <h1 className="font-display text-4xl font-bold">Showcase what you built.</h1>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Button onClick={newPassport}>New passport</Button>
          <select onChange={e => setEditing(passports.find(p=>p.id===e.target.value) || null)} className="border-2 border-ink p-2 bg-white" value={editing?.id || ''}>
            <option value="">Select a passport</option>
            {passports.map(p => <option key={p.id} value={p.id}>{p.projectTitle || p.id}</option>)}
          </select>
        </div>
        {editing && (
          <form onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); await saveEdit({
            displayName: fd.get('displayName') as string,
            projectTitle: fd.get('projectTitle') as string,
            problem: fd.get('problem') as string,
            description: fd.get('description') as string,
            technologies: (fd.get('technologies') as string).split(',').map(s=>s.trim()).filter(Boolean),
            aiCapability: fd.get('aiCapability') as string,
            learned: fd.get('learned') as string,
            githubUrl: fd.get('githubUrl') as string || undefined,
            demoUrl: fd.get('demoUrl') as string || undefined,
            status: fd.get('status') as any,
          })}} className="card p-6 mt-6 space-y-3">
            <div><label className="label-mono block mb-1">Display name</label><input name="displayName" defaultValue={editing.displayName} className="w-full border-2 border-ink p-2" /></div>
            <div><label className="label-mono block mb-1">Project title</label><input name="projectTitle" defaultValue={editing.projectTitle} className="w-full border-2 border-ink p-2" /></div>
            <div><label className="label-mono block mb-1">Problem solved</label><input name="problem" defaultValue={editing.problem} className="w-full border-2 border-ink p-2" /></div>
            <div><label className="label-mono block mb-1">Short description</label><textarea name="description" defaultValue={editing.description} rows={2} className="w-full border-2 border-ink p-2" /></div>
            <div><label className="label-mono block mb-1">Technologies (comma)</label><input name="technologies" defaultValue={editing.technologies?.join(', ')} className="w-full border-2 border-ink p-2" /></div>
            <div><label className="label-mono block mb-1">AI capability</label><input name="aiCapability" defaultValue={editing.aiCapability} className="w-full border-2 border-ink p-2" /></div>
            <div><label className="label-mono block mb-1">What I learned</label><input name="learned" defaultValue={editing.learned} className="w-full border-2 border-ink p-2" /></div>
            <div><label className="label-mono block mb-1">GitHub URL</label><input name="githubUrl" defaultValue={editing.githubUrl} className="w-full border-2 border-ink p-2" /></div>
            <div><label className="label-mono block mb-1">Demo URL</label><input name="demoUrl" defaultValue={editing.demoUrl} className="w-full border-2 border-ink p-2" /></div>
            <div><label className="label-mono block mb-1">Status</label>
              <select name="status" defaultValue={editing.status} className="w-full border-2 border-ink p-2 bg-white">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Button type="submit">Save</Button>
            <div className="flex gap-3 flex-wrap pt-2">
              <Button variant="outline" onClick={enableShare}>Enable public share</Button>
              <Button variant="ghost" onClick={disableShare}>Disable share</Button>
              <Button variant="lime" onClick={downloadPng}>Download PNG</Button>
            </div>
            {editing.shareToken && (
              <div className="text-xs font-mono text-ink/60 break-all">
                Share URL: {window.location.origin}/p/{editing.shareToken}
                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${editing.shareToken}`)} className="ml-2 underline">Copy</button>
              </div>
            )}
          </form>
        )}
      </div>
      <div>
        {editing && (
          <div ref={cardRef} className="card p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="label-mono">Project Passport</span>
              <span className="text-xs font-mono bg-lime px-2 py-1 border border-ink">{editing.status}</span>
            </div>
            <h2 className="font-display text-3xl font-bold">{editing.projectTitle || 'Untitled project'}</h2>
            <p className="text-sm text-ink/70 mt-1">by {editing.displayName}</p>
            <div className="mt-4"><div className="label-mono mb-1">Problem</div><p className="text-sm">{editing.problem}</p></div>
            <div className="mt-3"><div className="label-mono mb-1">Description</div><p className="text-sm">{editing.description}</p></div>
            <div className="mt-3"><div className="label-mono mb-1">AI capability</div><p className="text-sm">{editing.aiCapability}</p></div>
            <div className="mt-3"><div className="label-mono mb-1">Learned</div><p className="text-sm">{editing.learned}</p></div>
            <div className="mt-3 flex flex-wrap gap-2">
              {editing.technologies?.map((t:string) => <span key={t} className="text-xs font-mono px-2 py-1 border border-ink">{t}</span>)}
            </div>
            {editing.screenshotUrl ? <img src={editing.screenshotUrl} alt="screenshot" className="mt-3 w-full h-24 object-cover border border-ink" /> : <div className="mt-3 h-24 border-2 border-dashed border-ink/30 flex items-center justify-center bg-ivory text-xs font-mono text-ink/40">Screenshot placeholder</div>}
            {qr && <img src={qr} alt="QR" className="mt-4 w-24 h-24 border border-ink" />}
            <div className="mt-4 text-xs font-mono text-ink/50">Created with BuildLab 60</div>
          </div>
        )}
      </div>
    </div>
  )
}


