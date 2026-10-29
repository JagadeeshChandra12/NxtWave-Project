import { createClient, SupabaseClient } from "@supabase/supabase-js"

export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || ""
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ""
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } })
  : null
