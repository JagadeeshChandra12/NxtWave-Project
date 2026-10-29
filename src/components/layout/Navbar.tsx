import { Link, NavLink } from 'react-router-dom'
import { Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../lib/auth'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()
  const nav = [
    { to: '/', label: 'Home' },
    { to: '/planner', label: 'AI Project Planner' },
    { to: '/workshop', label: 'The Workshop' },
    { to: '/build-battle', label: 'Build Battle' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/passport', label: 'My Project Passport' },
  ]
  return (
    <header className="sticky top-0 z-40 bg-ivory/90 backdrop-blur border-b-2 border-ink">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <span className="inline-block w-7 h-7 bg-cobalt border-2 border-ink shadow-offset-sm" />
          BuildLab <span className="text-cobalt">60</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} className={({isActive}) => `text-sm font-medium hover:text-cobalt ${isActive ? 'text-cobalt' : 'text-ink'}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-mono">{user.name || user.email}</span>
              <button onClick={signOut} className="text-sm underline">Sign out</button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-medium hover:text-cobalt">Sign in</Link>
          )}
          <Link to="/workshop" className="btn-primary text-sm py-2 px-4">Register Free</Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t-2 border-ink bg-ivory px-4 py-4 flex flex-col gap-3">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)} className="text-base font-medium">
              {n.label}
            </NavLink>
          ))}
          <Link to="/workshop" onClick={() => setOpen(false)} className="btn-primary text-sm py-2 px-4 w-fit">Register Free</Link>
        </div>
      )}
    </header>
  )
}
