import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getConfig } from '../lib/config'
import { competitionService } from '../services/competitionService'
import { scoreService } from '../services/scoreService'


const SAMPLE_LEADERBOARD = [
  { title: 'AI Interview Prep Assistant', reg: 'Sample A', total: 92, func: 33, use: 24, orig: 18, pres: 17, judges: 2 },
  { title: 'Campus FAQ Bot', reg: 'Sample B', total: 85, func: 30, use: 22, orig: 17, pres: 16, judges: 2 },
  { title: 'Smart Parking Insights', reg: 'Sample C', total: 78, func: 27, use: 20, orig: 16, pres: 15, judges: 1 },
  { title: 'Expense Tracker', reg: 'Sample D', total: 71, func: 25, use: 18, orig: 14, pres: 14, judges: 1 },
]

export default function LeaderboardPage() {
  const cfg = getConfig()
  const [subs, setSubs] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const s = await competitionService.submissions.all()
      const sc = await scoreService.all()
      setSubs(s); setScores(sc); setLoading(false)
    })()
  }, [])

  const ranked = subs.map(s => {
    const ss = scores.filter((sc: any) => sc.submissionId === s.id && sc.state === 'submitted')
    const avg = ss.length ? ss.reduce((a: number, sc: any) => a + sc.total, 0) / ss.length : 0
    const agg = ss.length ? {
      functionality: ss.reduce((a: number, sc: any) => a + sc.functionality, 0) / ss.length,
      usefulness: ss.reduce((a: number, sc: any) => a + sc.usefulness, 0) / ss.length,
      originality: ss.reduce((a: number, sc: any) => a + sc.originality, 0) / ss.length,
      presentation: ss.reduce((a: number, sc: any) => a + sc.presentation, 0) / ss.length,
    } : null
    return { s, avg, count: ss.length, agg }
  }).filter(r => r.count > 0).sort((a, b) => b.avg - a.avg)

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-16 text-center">Loading leaderboard…</div>

  if (!cfg.resultsPublished) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="label-mono mb-2">Build Battle Leaderboard</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold">Results will appear here after judging and official publication.</h1>
        <p className="text-ink/70 mt-4 max-w-xl mx-auto">Submissions are being reviewed. The Top 3 will be announced once the organizer publishes official results.</p>
        <div className="mt-8"><Link to="/build-battle" className="btn-primary">Back to Build Battle</Link></div>
      </div>
    )
  }

  const usingSamples = ranked.length === 0
  const displayRanked = usingSamples
    ? SAMPLE_LEADERBOARD.map((s, i) => ({ s: { id: 'sample-' + i, title: s.title, competitionRegId: s.reg }, avg: s.total, count: s.judges, agg: { functionality: s.func, usefulness: s.use, originality: s.orig, presentation: s.pres } }))
    : ranked
  const top3 = displayRanked.slice(0, 3)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="label-mono mb-2">Build Battle Leaderboard</div>
      <h1 className="font-display text-4xl md:text-5xl font-bold">Official Results</h1>
      <p className="text-ink/70 mt-2">Top 3 submissions, ranked by average judge score out of 100.</p>\n      {usingSamples && <div className="mt-4 card p-3 bg-lime/40 text-sm font-mono">SAMPLE DATA — illustrative entries for demonstration. Not real competition results.</div>}

      {top3.length > 0 && (
        <div className="mt-10 grid md:grid-cols-3 gap-4 items-end">
          {[1, 0, 2].map(idx => {
            const r = top3[idx]
            if (!r) return null
            const heights = ['h-40', 'h-52', 'h-32']
            const medals = ['🥈', '🥇', '🥉']
            return (
              <div key={r.s.id} className={`card p-4 text-center ${idx === 1 ? 'bg-cobalt text-white' : ''}`}>
                <div className="font-display text-3xl mb-2">{medals[idx]}</div>
                <div className="font-display text-xl font-bold">{r.s.title}</div>
                <div className="text-sm opacity-80 mt-1">{r.avg.toFixed(1)} / 100</div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-10 card overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-ivory">
            <tr>
              <th className="p-2 text-left">Rank</th>
              <th className="p-2 text-left">Project</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Func (35)</th>
              <th className="p-2 text-left">Use (25)</th>
              <th className="p-2 text-left">Orig (20)</th>
              <th className="p-2 text-left">Pres (20)</th>
              <th className="p-2 text-left">Judges</th>
            </tr>
          </thead>
          <tbody>
            {displayRanked.map((r, i) => (
              <tr key={r.s.id} className="border-t border-ink/10">
                <td className="p-2 font-mono">#{i + 1}</td>
                <td className="p-2">
                  <div className="font-medium">{r.s.title}</div>
                  <div className="text-xs text-ink/60">{r.s.competitionRegId}</div>
                </td>
                <td className="p-2 font-mono font-bold">{r.avg.toFixed(1)}</td>
                <td className="p-2">{r.agg?.functionality.toFixed(1)}</td>
                <td className="p-2">{r.agg?.usefulness.toFixed(1)}</td>
                <td className="p-2">{r.agg?.originality.toFixed(1)}</td>
                <td className="p-2">{r.agg?.presentation.toFixed(1)}</td>
                <td className="p-2">{r.count}</td>
              </tr>
            ))}
            {displayRanked.length === 0 && (
              <tr><td colSpan={8} className="p-4 text-center text-ink/60">No scored submissions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
