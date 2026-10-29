import React, { createContext, useContext, useEffect, useState } from "react"
import type { User } from "../types"
import { load, save, uid } from "./storage"
import { getConfig } from "./config"
import { supabase, hasSupabase } from "./supabase"

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, name?: string, password?: string) => Promise<User>
  signInDemoAdmin: () => User
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)
const KEY = "bl60_user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => load<User | null>(KEY, null))
  const [loading, setLoading] = useState(false)

  const resolveRole = (email: string): User["role"] => {
    const cfg = getConfig()
    if (cfg.adminEmails.includes(email.toLowerCase())) return "admin"
    if (cfg.judgeEmails.includes(email.toLowerCase())) return "judge"
    return "user"
  }

  useEffect(() => {
    if (!hasSupabase || !supabase) return
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      const s = data.session
      if (s?.user) {
        const email = s.user.email || ""
        const u: User = { id: s.user.id, email, name: (s.user.user_metadata as any)?.name, role: resolveRole(email) }
        save(KEY, u); setUser(u)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email || ""
        const u: User = { id: session.user.id, email, name: (session.user.user_metadata as any)?.name, role: resolveRole(email) }
        save(KEY, u); setUser(u)
      } else {
        localStorage.removeItem(KEY); setUser(null)
      }
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  const signIn = async (email: string, name?: string, password?: string) => {
    setLoading(true)
    try {
      if (hasSupabase && supabase) {
        if (password) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) {
            // try sign up
            const { data: su, error: sue } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
            if (sue) throw sue
            const uidv = su.user?.id || uid("user")
            const u: User = { id: uidv, email: email.toLowerCase().trim(), name: name?.trim(), role: resolveRole(email) }
            save(KEY, u); setUser(u); return u
          }
          const uidv = data.user?.id || uid("user")
          const u: User = { id: uidv, email: email.toLowerCase().trim(), name: name?.trim() || (data.user?.user_metadata as any)?.name, role: resolveRole(email) }
          save(KEY, u); setUser(u); return u
        }
      }
      const u: User = { id: uid("user"), email: email.toLowerCase().trim(), name: name?.trim(), role: resolveRole(email) }
      save(KEY, u); setUser(u); return u
    } finally { setLoading(false) }
  }

  const signInDemoAdmin = () => {
    const email = "demo-admin@buildlab60.local"
    const cfg = getConfig()
    if (!cfg.adminEmails.includes(email)) {
      cfg.adminEmails.push(email)
      localStorage.setItem("bl60_config", JSON.stringify(cfg))
    }
    const u: User = { id: uid("user"), email, name: "Demo Admin", role: "admin" }
    save(KEY, u); setUser(u); return u
  }

  const signOut = async () => {
    if (hasSupabase && supabase) await supabase.auth.signOut()
    localStorage.removeItem(KEY); setUser(null)
  }

  return <Ctx.Provider value={{ user, loading, signIn, signInDemoAdmin, signOut }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useAuth outside provider")
  return ctx
}
