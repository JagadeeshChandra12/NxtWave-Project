import { Link } from 'react-router-dom'
import Countdown from '../components/Countdown'
import { formatWorkshopDateTime } from '../lib/datetime'
import { ArrowRight } from 'lucide-react'

const PREVIEW = {
  title: 'AI Interview Preparation Assistant',
  difficulty: 'Beginner',
  scope: 'One screen, 5 sample questions, instant feedback',
  features: ['Paste a job description', 'Get 5 likely interview questions', 'Receive a sample answer outline'],
  tech: ['React', 'Vite', 'Tailwind', 'OpenAI API'],
  steps: ['0-10 min Scope', '10-25 min Form', '25-40 min Logic', '40-50 min States', '50-60 min Polish'],
}

export default function HomePage() {
  return (
    <div>
      <section className="grid-lines border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="label-mono mb-4">BuildLab 60 / Growth Campaign</div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.95]">
              Your idea deserves more than a README.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ink/80 max-w-xl">
              Got an AI project idea but don't know where to start? Get a practical build plan, learn the basics at our free workshop, and turn your idea into something you can show.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/planner" className="btn-primary">Make My Idea Buildable <ArrowRight size={18} /></Link>
              <Link to="/workshop" className="btn-lime">Reserve My Free Spot</Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm font-mono text-ink/60">
              <span>01 Describe</span><span>?</span><span>02 Plan</span><span>?</span><span>03 Build</span><span>?</span><span>04 Showcase</span>
            </div>
          </div>
          <div className="card p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="label-mono">60-minute starter plan</span>
              <span className="text-xs font-mono bg-lime px-2 py-1 border border-ink">PREVIEW</span>
            </div>
            <h3 className="font-display text-2xl font-bold">{PREVIEW.title}</h3>
            <div className="mt-2 flex gap-2 text-xs font-mono">
              <span className="px-2 py-1 border border-ink bg-ivory">Difficulty: {PREVIEW.difficulty}</span>
              <span className="px-2 py-1 border border-ink bg-ivory">Scope: {PREVIEW.scope}</span>
            </div>
            <div className="mt-4">
              <div className="label-mono mb-2">Three core features</div>
              <ul className="space-y-1 text-sm">
                {PREVIEW.features.map(f => <li key={f} className="flex gap-2"><span className="text-cobalt">?</span>{f}</li>)}
              </ul>
            </div>
            <div className="mt-4">
              <div className="label-mono mb-2">Suggested stack</div>
              <div className="flex flex-wrap gap-2">
                {PREVIEW.tech.map(t => <span key={t} className="text-xs font-mono px-2 py-1 border border-ink">{t}</span>)}
              </div>
            </div>
            <div className="mt-4">
              <div className="label-mono mb-2">Build sequence</div>
              <div className="flex flex-wrap gap-2">
                {PREVIEW.steps.map(s => <span key={s} className="text-xs font-mono px-2 py-1 bg-cobalt text-white">{s}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
        <div className="label-mono mb-3">Countdown to the workshop</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold">{formatWorkshopDateTime()}</h2>
        <div className="mt-8"><Countdown /></div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="label-mono mb-3">02 / The Workshop</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Build Your First AI Project in 60 Minutes</h2>
            <p className="mt-4 text-ink/80">A free, beginner-friendly session for final-year engineering students. No prior AI experience required. You will leave with a realistic starter plan and the confidence to build.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="card p-4"><div className="label-mono">Duration</div><div className="font-display text-2xl font-bold">60 min</div></div>
              <div className="card p-4"><div className="label-mono">Cost</div><div className="font-display text-2xl font-bold">Free</div></div>
              <div className="card p-4"><div className="label-mono">Level</div><div className="font-display text-2xl font-bold">Beginner</div></div>
              <div className="card p-4"><div className="label-mono">Outcome</div><div className="font-display text-2xl font-bold">Build plan</div></div>
            </div>
            <p className="mt-4 text-xs font-mono text-ink/50">Workshop date, trainer, and registration link are configured by the organizer. Unconfirmed details are labeled.</p>
          </div>
          <div className="card p-6">
            <div className="label-mono mb-3">What you'll learn</div>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><span className="font-mono text-cobalt">01</span>Turn a vague idea into a scoped, buildable project.</li>
              <li className="flex gap-3"><span className="font-mono text-cobalt">02</span>Pick a realistic tech stack you can actually ship.</li>
              <li className="flex gap-3"><span className="font-mono text-cobalt">03</span>Build a working v1 in one focused hour.</li>
              <li className="flex gap-3"><span className="font-mono text-cobalt">04</span>Showcase your work with a Project Passport.</li>
            </ul>
            <Link to="/workshop" className="btn-primary mt-6 w-full justify-center">Reserve My Free Spot</Link>
          </div>
        </div>
      </section>

      <section className="bg-ink text-ivory py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="label-mono text-ivory/50 mb-3">03 / How it works</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-12">Four stages. One real project.</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '01', t: 'Describe your idea', d: 'Tell us what you want to build and your level.' },
              { n: '02', t: 'Get a buildable plan', d: 'Receive a scoped 60-minute starter plan.' },
              { n: '03', t: 'Learn and build', d: 'Attend the free workshop and ship a v1.' },
              { n: '04', t: 'Showcase and compete', d: 'Create a Passport and enter the Build Battle.' },
            ].map(s => (
              <div key={s.n} className="border-2 border-ivory/20 p-6 hover:border-lime transition-colors">
                <div className="font-mono text-lime text-3xl font-bold">{s.n}</div>
                <div className="font-display text-xl font-bold mt-3">{s.t}</div>
                <div className="text-sm text-ivory/70 mt-2">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="label-mono mb-3">04 / Featured examples</div>
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-8">Start from a real idea.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'AI Interview Preparation Assistant', problem: 'Students struggle to prepare for technical interviews.', feature: 'Generates likely questions from a job description.', scope: 'Beginner - single screen, sample data.' },
            { title: 'College FAQ Assistant', problem: 'New students ask the same questions repeatedly.', feature: 'Answers campus questions from a small knowledge base.', scope: 'Beginner - keyword search + answers.' },
            { title: 'Smart Parking Insights', problem: 'Students waste time finding parking on campus.', feature: 'Shows availability trends by hour.', scope: 'Intermediate - charts + mock data.' },
          ].map(e => (
            <Link key={e.title} to={`/planner?idea=${encodeURIComponent(e.title)}&problem=${encodeURIComponent(e.problem)}`} className="card p-6 hover:-translate-y-1 transition-transform">
              <h3 className="font-display text-xl font-bold">{e.title}</h3>
              <p className="text-sm text-ink/70 mt-2">{e.problem}</p>
              <div className="mt-4 text-sm"><span className="label-mono">Starter feature</span><div className="mt-1">{e.feature}</div></div>
              <div className="mt-3 text-xs font-mono text-ink/50">{e.scope}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="card p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center bg-cobalt text-white border-ink">
          <div>
            <div className="label-mono text-white/70 mb-3">05 / Build Battle</div>
            <h2 className="font-display text-4xl font-bold">Take your AI idea further.</h2>
            <p className="mt-4 text-white/80">Develop your starter project, submit it for judging, and compete to have your work recognised. Prizes are proposed and subject to organizer approval.</p>
            <Link to="/build-battle" className="btn-lime mt-6">Explore Build Battle</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="border-2 border-white/30 p-4"><div className="label-mono text-white/60">Functionality</div><div className="font-display text-3xl font-bold">35</div></div>
            <div className="border-2 border-white/30 p-4"><div className="label-mono text-white/60">Usefulness</div><div className="font-display text-3xl font-bold">25</div></div>
            <div className="border-2 border-white/30 p-4"><div className="label-mono text-white/60">Originality</div><div className="font-display text-3xl font-bold">20</div></div>
            <div className="border-2 border-white/30 p-4"><div className="label-mono text-white/60">Presentation</div><div className="font-display text-3xl font-bold">20</div></div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-24 text-center">
        <h2 className="font-display text-5xl md:text-7xl font-bold">Start small. Build something real.</h2>
        <p className="mt-6 text-lg text-ink/70 max-w-2xl mx-auto">One idea. One focused build. A real starting point.</p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link to="/planner" className="btn-primary">Make My Idea Buildable</Link>
          <Link to="/workshop" className="btn-ghost">Reserve My Free Spot</Link>
        </div>
      </section>
    </div>
  )
}
