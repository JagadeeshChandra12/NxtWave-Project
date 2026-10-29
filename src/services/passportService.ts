import { collection } from "./store"
import { uid } from "../lib/storage"
import type { Passport } from "../types"
import { supabase, hasSupabase } from "../lib/supabase"

const passports: any = collection<Passport>("bl60_passports")

function rowToPassport(r: any): Passport {
  return {
    id: r.id, ownerId: r.owner_id, displayName: r.display_name, projectTitle: r.project_title,
    problem: r.problem, description: r.description, technologies: r.technologies || [],
    aiCapability: r.ai_capability, learned: r.learned, githubUrl: r.github_url, demoUrl: r.demo_url,
    screenshotUrl: r.screenshot_url, status: r.status, workshopParticipated: r.workshop_participated,
    public: r.public, shareToken: r.share_token, createdAt: r.created_at, updatedAt: r.updated_at,
  }
}
function passportToRow(p: any) {
  return {
    owner_id: p.ownerId, display_name: p.displayName, project_title: p.projectTitle,
    problem: p.problem, description: p.description, technologies: p.technologies,
    ai_capability: p.aiCapability, learned: p.learned, github_url: p.githubUrl, demo_url: p.demoUrl,
    screenshot_url: p.screenshotUrl, status: p.status, workshop_participated: p.workshopParticipated,
    public: p.public, share_token: p.shareToken,
  }
}

export const passportService = {
  all: async (): Promise<Passport[]> => {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.from("passports").select("*")
      if (error) throw error
      return (data || []).map(rowToPassport)
    }
    return passports.all()
  },
  byOwner: async (ownerId: string): Promise<Passport[]> => {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.from("passports").select("*").eq("owner_id", ownerId)
      if (error) throw error
      return (data || []).map(rowToPassport)
    }
    return passports.all().filter((p: any) => p.ownerId === ownerId)
  },
  get: async (id: string): Promise<Passport | undefined> => {
    if (hasSupabase && supabase) {
      const { data } = await supabase.from("passports").select("*").eq("id", id).maybeSingle()
      return data ? rowToPassport(data) : undefined
    }
    return passports.get(id)
  },
  byToken: async (token: string): Promise<Passport | undefined> => {
    if (hasSupabase && supabase) {
      const { data } = await supabase.from("passports").select("*").eq("share_token", token).maybeSingle()
      return data ? rowToPassport(data) : undefined
    }
    return passports.all().find((p: any) => p.shareToken === token)
  },
  create: async (data: any): Promise<Passport> => {
    if (hasSupabase && supabase) {
      const { data: row, error } = await supabase.from("passports").insert(passportToRow(data)).select().single()
      if (error) throw error
      return rowToPassport(row)
    }
    const now = new Date().toISOString()
    return passports.create({ ...data, createdAt: now, updatedAt: now })
  },
  update: async (id: string, patch: any): Promise<Passport | undefined> => {
    if (hasSupabase && supabase) {
      const row: any = { updated_at: new Date().toISOString() }
      if (patch.displayName !== undefined) row.display_name = patch.displayName
      if (patch.projectTitle !== undefined) row.project_title = patch.projectTitle
      if (patch.problem !== undefined) row.problem = patch.problem
      if (patch.description !== undefined) row.description = patch.description
      if (patch.technologies !== undefined) row.technologies = patch.technologies
      if (patch.aiCapability !== undefined) row.ai_capability = patch.aiCapability
      if (patch.learned !== undefined) row.learned = patch.learned
      if (patch.githubUrl !== undefined) row.github_url = patch.githubUrl
      if (patch.demoUrl !== undefined) row.demo_url = patch.demoUrl
      if (patch.status !== undefined) row.status = patch.status
      if (patch.public !== undefined) row.public = patch.public
      if (patch.shareToken !== undefined) row.share_token = patch.shareToken
      const { data, error } = await supabase.from("passports").update(row).eq("id", id).select().single()
      if (error) throw error
      return rowToPassport(data)
    }
    return passports.update(id, { ...patch, updatedAt: new Date().toISOString() })
  },
  remove: async (id: string) => {
    if (hasSupabase && supabase) {
      await supabase.from("passports").delete().eq("id", id)
      return
    }
    passports.remove(id)
  },
  enableShare: async (id: string): Promise<Passport | undefined> => {
    const p = await passportService.get(id)
    if (!p) return undefined
    const token = p.shareToken || uid("share")
    return passportService.update(id, { public: true, shareToken: token })
  },
  disableShare: async (id: string): Promise<Passport | undefined> => {
    return passportService.update(id, { public: false })
  },
}
