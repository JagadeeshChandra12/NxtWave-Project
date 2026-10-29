import { collection } from "./store"
import type { Registration } from "../types"
import { supabase, hasSupabase } from "../lib/supabase"
import { load, save } from "../lib/storage"

const regs: any = collection<Registration>("bl60_registrations")
const KEY = "bl60_registrations"

function rowToReg(r: any): Registration {
  return {
    id: r.id, fullName: r.full_name, email: r.email, college: r.college, branch: r.branch,
    graduationYear: r.graduation_year, phone: r.phone, projectIdea: r.project_idea,
    referralCode: r.referral_code, consent: r.consent, source: r.source, medium: r.medium,
    campaign: r.campaign, referringPage: r.referring_page, referredBy: r.referred_by,
    createdAt: r.created_at, attendanceVerified: r.attendance_verified, certificateId: r.certificate_id,
  }
}
function regToRow(r: any) {
  return {
    full_name: r.fullName, email: r.email.toLowerCase().trim(), college: r.college, branch: r.branch,
    graduation_year: r.graduationYear, phone: r.phone, project_idea: r.projectIdea,
    referral_code: r.referralCode, consent: r.consent, source: r.source, medium: r.medium,
    campaign: r.campaign, referring_page: r.referringPage, referred_by: r.referredBy,
  }
}

export const registrationService = {
  all: async (): Promise<Registration[]> => {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false })
      if (error) throw error
      return (data || []).map(rowToReg)
    }
    return regs.all()
  },
  byEmail: async (email: string): Promise<Registration | undefined> => {
    if (hasSupabase && supabase) {
      const { data } = await supabase.from("registrations").select("*").eq("email", email.toLowerCase().trim()).maybeSingle()
      return data ? rowToReg(data) : undefined
    }
    return regs.all().find((r: any) => r.email === email.toLowerCase().trim())
  },
  create: async (data: any): Promise<Registration> => {
    const norm = { ...data, email: data.email.toLowerCase().trim() }
    if (hasSupabase && supabase) {
      // duplicate check
      const existing = await registrationService.byEmail(norm.email)
      if (existing) throw new Error("DUPLICATE")
      const { data: row, error } = await supabase.from("registrations").insert(regToRow(norm)).select().single()
      if (error) {
        if (error.code === "23505") throw new Error("DUPLICATE")
        throw error
      }
      return rowToReg(row)
    }
    const dup = regs.all().find((r: any) => r.email === norm.email)
    if (dup) throw new Error("DUPLICATE")
    if (norm.referralCode) (norm as any).referredBy = norm.referralCode
    return regs.create(norm)
  },
  update: async (id: string, patch: any) => {
    if (hasSupabase && supabase) {
      const row: any = {}
      if (patch.attendanceVerified !== undefined) row.attendance_verified = patch.attendanceVerified
      if (patch.certificateId !== undefined) row.certificate_id = patch.certificateId
      const { data, error } = await supabase.from("registrations").update(row).eq("id", id).select().single()
      if (error) throw error
      return rowToReg(data)
    }
    return regs.update(id, patch)
  },
  verifyAttendance: async (id: string, verified: boolean) => {
    if (hasSupabase && supabase) {
      const { error } = await supabase.rpc("verify_attendance", { reg_id: id, verified })
      if (error) throw error
      return
    }
    regs.update(id, { attendanceVerified: verified })
  },
  exportCsv: async () => {
    const rows = await registrationService.all()
    const header = ["id","fullName","email","college","branch","graduationYear","phone","projectIdea","referralCode","source","medium","campaign","createdAt","attendanceVerified"]
    const lines = [header.join(",")]
    for (const r of rows) {
      lines.push(header.map(h => JSON.stringify((r as any)[h] ?? "")).join(","))
    }
    return lines.join("\n")
  },
}
