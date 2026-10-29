import { collection } from "./store"
import type { ProjectPlan } from "../types"
import { supabase, hasSupabase } from "../lib/supabase"

const plans: any = collection<ProjectPlan>("bl60_plans")

export const planStore = {
  all: async (): Promise<ProjectPlan[]> => {
    if (hasSupabase && supabase) { const { data, error } = await supabase.from("plans").select("*"); if (error) throw error; return (data || []).map((r: any) => r.payload) }
    return plans.all()
  },
  byOwner: async (ownerId: string): Promise<ProjectPlan[]> => {
    if (hasSupabase && supabase) { const { data, error } = await supabase.from("plans").select("*").eq("owner_id", ownerId); if (error) throw error; return (data || []).map((r: any) => r.payload) }
    return plans.all().filter((p: any) => p.ownerId === ownerId)
  },
  save: async (plan: ProjectPlan): Promise<ProjectPlan> => {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.from("plans").upsert({ id: plan.id, owner_id: plan.ownerId, idea: plan.idea, title: plan.title, payload: plan }).select().single()
      if (error) throw error
      return data.payload
    }
    const existing = plans.get(plan.id)
    if (existing) return plans.update(plan.id, plan)!
    return plans.create(plan)
  },
  remove: async (id: string) => {
    if (hasSupabase && supabase) { await supabase.from("plans").delete().eq("id", id); return }
    plans.remove(id)
  },
}
