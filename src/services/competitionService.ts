import { collection } from "./store"
import type { CompetitionRegistration, Submission } from "../types"
import { supabase, hasSupabase } from "../lib/supabase"

const compRegs: any = collection<CompetitionRegistration>("bl60_comp_regs")
const subs: any = collection<Submission>("bl60_submissions")

function rowToCompReg(r: any): CompetitionRegistration {
  return { id: r.id, registrationId: r.registration_id, name: r.name, email: r.email, projectTitle: r.project_title, description: r.description, participation: r.participation, teamMembers: r.team_members || [], rulesAgreed: r.rules_agreed, status: r.status, createdAt: r.created_at }
}
function compRegToRow(d: any) { return { registration_id: d.registrationId, name: d.name, email: d.email, project_title: d.projectTitle, description: d.description, participation: d.participation, team_members: d.teamMembers, rules_agreed: d.rulesAgreed, status: d.status } }
function rowToSub(r: any): Submission { return { id: r.id, competitionRegId: r.competition_reg_id, title: r.title, problem: r.problem, description: r.description, features: r.features || [], technologies: r.technologies || [], aiComponent: r.ai_component, githubUrl: r.github_url, demoUrl: r.demo_url, videoUrl: r.video_url, screenshots: r.screenshots, declaration: r.declaration, submittedAt: r.submitted_at, locked: r.locked } }
function subToRow(d: any) { return { competition_reg_id: d.competitionRegId, title: d.title, problem: d.problem, description: d.description, features: d.features, technologies: d.technologies, ai_component: d.aiComponent, github_url: d.githubUrl, demo_url: d.demoUrl, video_url: d.videoUrl, screenshots: d.screenshots, declaration: d.declaration, locked: d.locked } }

export const competitionService = {
  regs: {
    all: async (): Promise<CompetitionRegistration[]> => {
      if (hasSupabase && supabase) { const { data, error } = await supabase.from("competition_registrations").select("*"); if (error) throw error; return (data || []).map(rowToCompReg) }
      return compRegs.all()
    },
    create: async (data: any): Promise<CompetitionRegistration> => {
      if (hasSupabase && supabase) { const { data: row, error } = await supabase.from("competition_registrations").insert(compRegToRow(data)).select().single(); if (error) throw error; return rowToCompReg(row) }
      return compRegs.create(data)
    },
    update: async (id: string, patch: any) => {
      if (hasSupabase && supabase) { const { data, error } = await supabase.from("competition_registrations").update(patch).eq("id", id).select().single(); if (error) throw error; return rowToCompReg(data) }
      return compRegs.update(id, patch)
    },
    byEmail: async (email: string): Promise<CompetitionRegistration | undefined> => {
      if (hasSupabase && supabase) { const { data } = await supabase.from("competition_registrations").select("*").eq("email", email.toLowerCase().trim()).maybeSingle(); return data ? rowToCompReg(data) : undefined }
      return compRegs.all().find((r: any) => r.email === email.toLowerCase().trim())
    },
  },
  submissions: {
    all: async (): Promise<Submission[]> => {
      if (hasSupabase && supabase) { const { data, error } = await supabase.from("submissions").select("*"); if (error) throw error; return (data || []).map(rowToSub) }
      return subs.all()
    },
    get: async (id: string): Promise<Submission | undefined> => {
      if (hasSupabase && supabase) { const { data } = await supabase.from("submissions").select("*").eq("id", id).maybeSingle(); return data ? rowToSub(data) : undefined }
      return subs.get(id)
    },
    byReg: async (regId: string): Promise<Submission[]> => {
      if (hasSupabase && supabase) { const { data, error } = await supabase.from("submissions").select("*").eq("competition_reg_id", regId); if (error) throw error; return (data || []).map(rowToSub) }
      return subs.all().filter((s: any) => s.competitionRegId === regId)
    },
    create: async (data: any): Promise<Submission> => {
      if (hasSupabase && supabase) {
        const existing = await competitionService.submissions.byReg(data.competitionRegId)
        if (existing.length > 0) throw new Error("ALREADY_SUBMITTED")
        const { data: row, error } = await supabase.from("submissions").insert({ ...subToRow(data), submitted_at: new Date().toISOString() }).select().single()
        if (error) throw error
        return rowToSub(row)
      }
      const existing = subs.all().filter((s: any) => s.competitionRegId === data.competitionRegId)
      if (existing.length > 0) throw new Error("ALREADY_SUBMITTED")
      return subs.create({ ...data, submittedAt: new Date().toISOString() })
    },
    update: async (id: string, patch: any) => {
      if (hasSupabase && supabase) { const { data, error } = await supabase.from("submissions").update(patch).eq("id", id).select().single(); if (error) throw error; return rowToSub(data) }
      return subs.update(id, patch)
    },
  },
}
