import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { passportService } from "../services/passportService"

export default function PublicPassportPage() {
  const { token } = useParams()
  const [p, setP] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!token) { setLoading(false); return }
    passportService.byToken(token).then(r => { setP(r); setLoading(false) })
  }, [token])
  if (loading) return <div className="max-w-2xl mx-auto px-4 py-16 text-center">Loading…</div>
  if (!p || !p.public) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center"><h1 className="font-display text-3xl font-bold">Project not found or not shared.</h1></div>
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="card p-8">
        <div className="label-mono mb-2">Public Project Passport</div>
        <h1 className="font-display text-4xl font-bold">{p.projectTitle}</h1>
        <p className="text-ink/70 mt-1">by {p.displayName}</p>
        <div className="mt-4"><div className="label-mono mb-1">Problem</div><p className="text-sm">{p.problem}</p></div>
        <div className="mt-3"><div className="label-mono mb-1">Description</div><p className="text-sm">{p.description}</p></div>
        <div className="mt-3"><div className="label-mono mb-1">AI capability</div><p className="text-sm">{p.aiCapability}</p></div>
        <div className="mt-3"><div className="label-mono mb-1">Learned</div><p className="text-sm">{p.learned}</p></div>
        <div className="mt-4 flex flex-wrap gap-2">{p.technologies?.map((t:string)=><span key={t} className="text-xs font-mono px-2 py-1 border border-ink">{t}</span>)}</div>
        <div className="mt-4 flex gap-3 text-sm">
          {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="underline">GitHub</a>}
          {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noreferrer" className="underline">Live demo</a>}
        </div>
        <div className="mt-6 text-xs font-mono text-ink/50">Created with BuildLab 60</div>
      </div>
    </div>
  )
}
