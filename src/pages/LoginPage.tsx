import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../lib/auth"
import { hasSupabase } from "../lib/supabase"
import Button from "../components/ui/Button"

export default function LoginPage() {
  const { signIn, signInDemoAdmin } = useAuth()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(email, name, password || undefined)
      nav(params.get("next") || "/")
    } catch (ex: any) {
      setErr(ex?.message || "Sign in failed")
    }
  }
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="label-mono mb-2">Sign in</div>
      <h1 className="font-display text-4xl font-bold">Welcome back.</h1>
      <form onSubmit={submit} className="card p-6 mt-6 space-y-4">
        <div><label className="label-mono block mb-1">Email *</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border-2 border-ink p-3" required /></div>
        <div><label className="label-mono block mb-1">Name (optional)</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full border-2 border-ink p-3" /></div>
        {hasSupabase && <div><label className="label-mono block mb-1">Password *</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border-2 border-ink p-3" required /></div>}
        {err && <p className="text-coral text-sm">{err}</p>}
        <Button type="submit" className="w-full">Sign in</Button>
      </form>
      <div className="mt-4">
        <Button variant="ghost" className="w-full" onClick={() => { signInDemoAdmin(); nav(params.get("next") || "/") }}>Sign in as demo admin (demo mode)</Button>
      </div>
      <p className="text-xs font-mono text-ink/50 mt-4">{hasSupabase ? "Supabase auth enabled." : "Demo mode: no password required."}</p>
    </div>
  )
}
