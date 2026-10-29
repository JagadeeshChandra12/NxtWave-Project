import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { registrationService } from '../services/registrationService'
import { competitionService } from '../services/competitionService'
import { certificateService } from '../services/certificateService'
import { passportService } from '../services/passportService'
import { scoreService } from '../services/scoreService'
import { getConfig, setConfig } from '../lib/config'
import Button from '../components/ui/Button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const TABS = ['overview','registrations','attendance','competition','submissions','judging','results','passports','certificates','analytics','config'] as const

type Tab = typeof TABS[number]

export default function AdminPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')
  const [cfg, setCfgState] = useState(getConfig())
  const [refresh, setRefresh] = useState(0)
  const rerender = () => setRefresh(x=>x+1)

  const [regs, setRegs] = useState<any[]>([])
  const [compRegs, setCompRegs] = useState<any[]>([])
  const [subs, setSubs] = useState<any[]>([])
  const [passports, setPassports] = useState<any[]>([])
  const [certs, setCerts] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const loadAll = async () => {
    setLoadingData(true)
    try {
      const [r, cr, s, p, c, sc] = await Promise.all([
        registrationService.all(), competitionService.regs.all(), competitionService.submissions.all(),
        passportService.all(), certificateService.all(), scoreService.all(),
      ])
      setRegs(r); setCompRegs(cr); setSubs(s); setPassports(p); setCerts(c); setScores(sc)
    } finally { setLoadingData(false) }
  }
  useEffect(() => { loadAll() }, [refresh])

  const dailyData = useMemo(() => {
    const map: Record<string, number> = {}
    regs.forEach(r => { const d = r.createdAt.slice(0,10); map[d] = (map[d]||0)+1 })
    return Object.entries(map).sort().map(([date,count]) => ({ date, count }))
  }, [regs, refresh])

  const bySource = useMemo(() => {
    const map: Record<string, number> = {}
    regs.forEach(r => { const s = r.source || 'direct'; map[s] = (map[s]||0)+1 })
    return Object.entries(map).map(([name,value]) => ({ name, value }))
  }, [regs, refresh])

  const byCollege = useMemo(() => {
    const map: Record<string, number> = {}
    regs.forEach(r => { map[r.college] = (map[r.college]||0)+1 })
    return Object.entries(map).map(([name,value]) => ({ name, value }))
  }, [regs, refresh])

  const byYear = useMemo(() => {
    const map: Record<string, number> = {}
    regs.forEach(r => { map[String(r.graduationYear)] = (map[String(r.graduationYear)]||0)+1 })
    return Object.entries(map).map(([name,value]) => ({ name, value }))
  }, [regs, refresh])

  const exportCsv = async () => {
    const csv = await registrationService.exportCsv()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'registrations.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="label-mono mb-2">Admin Dashboard</div>
      <h1 className="font-display text-4xl font-bold">Operations & Growth</h1>
      <p className="text-xs font-mono text-ink/50 mt-1">Signed in as {user?.email} ({user?.role})</p>
      <div className="flex gap-1 mt-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 border-2 border-ink text-xs font-mono ${tab===t?'bg-cobalt text-white':'bg-white'}`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="card p-4"><div className="label-mono">Registrations</div><div className="font-display text-3xl font-bold">{regs.length}</div><div className="text-xs">Target 500</div></div>
          <div className="card p-4"><div className="label-mono">Progress</div><div className="font-display text-3xl font-bold">{Math.round(regs.length/500*100)}%</div></div>
          <div className="card p-4"><div className="label-mono">Attendance</div><div className="font-display text-3xl font-bold">{regs.filter(r=>r.attendanceVerified).length}</div></div>
          <div className="card p-4"><div className="label-mono">Comp. interest</div><div className="font-display text-3xl font-bold">{compRegs.length}</div></div>
          <div className="card p-4"><div className="label-mono">Submissions</div><div className="font-display text-3xl font-bold">{subs.length}</div></div>
          <div className="card p-4"><div className="label-mono">Passports</div><div className="font-display text-3xl font-bold">{passports.length}</div></div>
          <div className="card p-4"><div className="label-mono">Certificates</div><div className="font-display text-3xl font-bold">{certs.length}</div></div>
          <div className="card p-4"><div className="label-mono">Referrals (attr)</div><div className="font-display text-3xl font-bold">{regs.filter(r=>r.referredBy).length}</div></div>
        </div>
      )}

      {tab === 'registrations' && (
        <div className="mt-6">
          <div className="flex gap-2 mb-4"><Button onClick={exportCsv}>Export CSV</Button></div>
          <div className="card overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-ivory"><tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">College</th><th className="p-2 text-left">Year</th><th className="p-2 text-left">Source</th><th className="p-2 text-left">Created</th></tr></thead>
              <tbody>
                {regs.map(r => (
                  <tr key={r.id} className="border-t border-ink/10">
                    <td className="p-2">{r.fullName}</td>
                    <td className="p-2 font-mono text-xs">{r.email}</td>
                    <td className="p-2">{r.college}</td>
                    <td className="p-2">{r.graduationYear}</td>
                    <td className="p-2">{r.source || 'direct'}</td>
                    <td className="p-2 text-xs">{r.createdAt.slice(0,10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="mt-6 card overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-ivory"><tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Verified</th><th className="p-2 text-left">Action</th></tr></thead>
            <tbody>
              {regs.map(r => (
                <tr key={r.id} className="border-t border-ink/10">
                  <td className="p-2">{r.fullName}</td>
                  <td className="p-2 font-mono text-xs">{r.email}</td>
                  <td className="p-2">{r.attendanceVerified ? 'Yes' : 'No'}</td>
                  <td className="p-2">
                    <Button variant="outline" className="text-xs py-1 px-2" onClick={async () => { await registrationService.update(r.id, { attendanceVerified: !r.attendanceVerified }); rerender() }}>
                      {r.attendanceVerified ? 'Unverify' : 'Verify'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'competition' && (
        <div className="mt-6 card overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-ivory"><tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Project</th><th className="p-2 text-left">Status</th></tr></thead>
            <tbody>
              {compRegs.map(r => (
                <tr key={r.id} className="border-t border-ink/10">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2 font-mono text-xs">{r.email}</td>
                  <td className="p-2">{r.projectTitle}</td>
                  <td className="p-2">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'submissions' && (
        <div className="mt-6 space-y-4">
          {subs.map(s => (
            <div key={s.id} className="card p-4">
              <div className="font-display font-bold">{s.title}</div>
              <div className="text-xs text-ink/60">by reg {s.competitionRegId}</div>
              <p className="text-sm mt-2">{s.description}</p>
              <div className="text-xs font-mono mt-2">Features: {s.features.join(', ')}</div>
              <div className="text-xs font-mono">Tech: {s.technologies.join(', ')}</div>
              {s.githubUrl && <a href={s.githubUrl} target="_blank" rel="noreferrer" className="text-xs underline">GitHub</a>}
            </div>
          ))}
          {subs.length === 0 && <p className="text-sm text-ink/60">No submissions yet.</p>}
        </div>
      )}

      {tab === 'judging' && (
        <div className="mt-6 space-y-6">
          {subs.map(s => {
            const submittedScores = scores.filter((sc:any) => sc.submissionId === s.id && sc.state === 'submitted')
            const ranking = submittedScores.length ? { average: submittedScores.reduce((a:number, sc:any) => a + sc.total, 0) / submittedScores.length, count: submittedScores.length } : null
            return (
              <div key={s.id} className="card p-4">
                <div className="font-display font-bold">{s.title}</div>
                <div className="text-xs text-ink/60 mb-3">Avg score: {ranking ? ranking.average.toFixed(1) : '—'} ({ranking?.count || 0} judges)</div>
                <JudgeForm submissionId={s.id} judgeId={user!.id} onDone={rerender} />
                <div className="mt-3 text-xs text-ink/60">Submitted scores: {submittedScores.length}</div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'results' && (
        <div className="mt-6 card p-6 space-y-4">
          <p className="text-sm">Publish official Top 3 only after judging complete.</p>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.resultsPublished} onChange={e => { const c = setConfig({ resultsPublished: e.target.checked }); setCfgState(c); rerender() }} /> Results published</label>
          {cfg.resultsPublished && (
            <div className="mt-4">
              <h3 className="font-display font-bold mb-2">Top 3 (by avg score)</h3>
              {subs.map(s => { const ss = scores.filter((sc:any) => sc.submissionId === s.id && sc.state === 'submitted'); const r = ss.length ? { average: ss.reduce((a:number,sc:any)=>a+sc.total,0)/ss.length, count: ss.length } : null; return { s, r } }).filter(x=>x.r).sort((a,b)=> (b.r!.average - a.r!.average)).slice(0,3).map((x,i) => (
                <div key={x.s.id} className="card p-3 mb-2">
                  <span className="font-mono">#{i+1}</span> {x.s.title} — {x.r!.average.toFixed(1)} pts
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'passports' && (
        <div className="mt-6 card overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-ivory"><tr><th className="p-2 text-left">Title</th><th className="p-2 text-left">Owner</th><th className="p-2 text-left">Public</th></tr></thead>
            <tbody>
              {passports.map(p => (
                <tr key={p.id} className="border-t border-ink/10">
                  <td className="p-2">{p.projectTitle}</td>
                  <td className="p-2 font-mono text-xs">{p.ownerId}</td>
                  <td className="p-2">{p.public ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'certificates' && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-ink/70">Issue certificates to attendees with verified attendance.</p>
          {regs.filter(r=>r.attendanceVerified).map(r => {
            const existing = certs.find((c:any) => c.registrationId === r.id)
            return (
              <div key={r.id} className="card p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.fullName}</div>
                  <div className="text-xs font-mono text-ink/60">{r.email}</div>
                  {existing && <div className="text-xs text-green-700">Issued: {existing.certificateId}</div>}
                </div>
                {!existing && (
                  <Button variant="lime" onClick={async () => { await certificateService.issue(r.id, r.fullName, cfg.workshopDate || new Date().toLocaleDateString(), user!.email); rerender() }}>Issue certificate</Button>
                )}
              </div>
            )
          })}
          {regs.filter(r=>r.attendanceVerified).length === 0 && <p className="text-sm text-ink/60">No verified attendees yet.</p>}
        </div>
      )}

      {tab === 'analytics' && (
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="card p-4">
            <div className="label-mono mb-3">Daily registrations</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="count" stroke="#3F51FF" /></LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-4">
            <div className="label-mono mb-3">By source</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bySource}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#3F51FF" /></BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-4">
            <div className="label-mono mb-3">By college</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCollege}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#D9FF45" /></BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-4">
            <div className="label-mono mb-3">By graduation year</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byYear}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#FF765F" /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'config' && (
        <div className="mt-6 card p-6 space-y-4 max-w-2xl">
          <div><label className="label-mono block mb-1">Workshop title</label><input value={cfg.workshopTitle} onChange={e=>setCfgState({...cfg, workshopTitle: e.target.value})} className="w-full border-2 border-ink p-2" /></div>
          <div><label className="label-mono block mb-1">Workshop date (unconfirmed if blank)</label><input value={cfg.workshopDate||''} onChange={e=>setCfgState({...cfg, workshopDate: e.target.value})} className="w-full border-2 border-ink p-2" /></div>
          <div><label className="label-mono block mb-1">Trainer</label><input value={cfg.trainer||''} onChange={e=>setCfgState({...cfg, trainer: e.target.value})} className="w-full border-2 border-ink p-2" /></div>
          <div><label className="label-mono block mb-1">Submission deadline (ISO)</label><input value={cfg.submissionDeadline||''} onChange={e=>setCfgState({...cfg, submissionDeadline: e.target.value})} className="w-full border-2 border-ink p-2" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.competitionOpen} onChange={e=>setCfgState({...cfg, competitionOpen: e.target.checked})} /> Competition open</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.prizesApproved} onChange={e=>setCfgState({...cfg, prizesApproved: e.target.checked})} /> Prizes approved</label>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="label-mono block mb-1">1st</label><input type="number" value={cfg.prizes.first} onChange={e=>setCfgState({...cfg, prizes: {...cfg.prizes, first: Number(e.target.value)}})} className="w-full border-2 border-ink p-2" /></div>
            <div><label className="label-mono block mb-1">2nd</label><input type="number" value={cfg.prizes.second} onChange={e=>setCfgState({...cfg, prizes: {...cfg.prizes, second: Number(e.target.value)}})} className="w-full border-2 border-ink p-2" /></div>
            <div><label className="label-mono block mb-1">3rd</label><input type="number" value={cfg.prizes.third} onChange={e=>setCfgState({...cfg, prizes: {...cfg.prizes, third: Number(e.target.value)}})} className="w-full border-2 border-ink p-2" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.demoMode} onChange={e=>setCfgState({...cfg, demoMode: e.target.checked})} /> Demo mode</label>
          <Button onClick={() => { setConfig(cfg); rerender(); alert('Saved') }}>Save config</Button>
        </div>
      )}
    </div>
  )
}

function JudgeForm({ submissionId, judgeId, onDone }: { submissionId: string; judgeId: string; onDone: () => void }) {
  const [vals, setVals] = useState({ functionality: 0, usefulness: 0, originality: 0, presentation: 0, comments: '' })
  const submit = async (state: 'draft' | 'submitted') => {
    await scoreService.upsert({ submissionId, judgeId, ...vals, state })
    if (state === 'submitted') {
      const allScores = await scoreService.all()
      const s = allScores.find((x:any) => x.submissionId === submissionId && x.judgeId === judgeId)
      if (s) await scoreService.finalize(s.id)
    }
    onDone()
  }
  return (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-4 gap-2">
        <div><label className="label-mono block mb-1">Func (35)</label><input type="number" min={0} max={35} value={vals.functionality} onChange={e=>setVals({...vals, functionality: Number(e.target.value)})} className="w-full border-2 border-ink p-1" /></div>
        <div><label className="label-mono block mb-1">Use (25)</label><input type="number" min={0} max={25} value={vals.usefulness} onChange={e=>setVals({...vals, usefulness: Number(e.target.value)})} className="w-full border-2 border-ink p-1" /></div>
        <div><label className="label-mono block mb-1">Orig (20)</label><input type="number" min={0} max={20} value={vals.originality} onChange={e=>setVals({...vals, originality: Number(e.target.value)})} className="w-full border-2 border-ink p-1" /></div>
        <div><label className="label-mono block mb-1">Pres (20)</label><input type="number" min={0} max={20} value={vals.presentation} onChange={e=>setVals({...vals, presentation: Number(e.target.value)})} className="w-full border-2 border-ink p-1" /></div>
      </div>
      <div><label className="label-mono block mb-1">Comments</label><textarea value={vals.comments} onChange={e=>setVals({...vals, comments: e.target.value})} className="w-full border-2 border-ink p-2" rows={2} /></div>
      <div className="flex gap-2">
        <Button variant="ghost" className="text-xs py-1 px-2" onClick={() => submit('draft')}>Save draft</Button>
        <Button variant="primary" className="text-xs py-1 px-2" onClick={() => submit('submitted')}>Submit score</Button>
      </div>
    </div>
  )
}










