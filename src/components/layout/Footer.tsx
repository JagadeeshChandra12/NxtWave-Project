import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-ink text-ivory mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="font-display font-bold text-xl mb-3">BuildLab 60</div>
          <p className="text-sm text-ivory/70">Turn rough AI ideas into buildable projects. Free workshop for final-year engineering students.</p>
        </div>
        <div>
          <div className="label-mono text-ivory/50 mb-3">Product</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/planner" className="hover:text-lime">AI Project Planner</Link></li>
            <li><Link to="/workshop" className="hover:text-lime">The Workshop</Link></li>
            <li><Link to="/build-battle" className="hover:text-lime">Build Battle</Link></li>
            <li><Link to="/passport" className="hover:text-lime">Project Passport</Link></li>
          </ul>
        </div>
        <div>
          <div className="label-mono text-ivory/50 mb-3">Legal</div>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li>Privacy notice (placeholder)</li>
            <li>Competition terms (placeholder)</li>
            <li>Contact: hello@buildlab60.example</li>
          </ul>
        </div>
        <div>
          <div className="label-mono text-ivory/50 mb-3">Status</div>
          <p className="text-sm text-ivory/70">Demo mode. Workshop details unconfirmed until organizer sets them.</p>
        </div>
      </div>
      <div className="border-t border-ivory/20 py-4 text-center text-xs text-ivory/50 font-mono">
        © BuildLab 60 — a growth campaign concept. Not an official NxtWave product.
      </div>
    </footer>
  )
}
