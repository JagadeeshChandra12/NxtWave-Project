import { collection } from "./store"
import { uid } from "../lib/storage"
import type { Certificate } from "../types"
import { supabase, hasSupabase } from "../lib/supabase"

const certs: any = collection<Certificate>("bl60_certificates")

function rowToCert(r: any): Certificate { return { id: r.id, registrationId: r.registration_id, participantName: r.participant_name, workshopTitle: r.workshop_title, date: r.date, certificateId: r.certificate_id, issuedAt: r.issued_at, issuedBy: r.issued_by } }

export const certificateService = {
  all: async (): Promise<Certificate[]> => {
    if (hasSupabase && supabase) { const { data, error } = await supabase.from("certificates").select("*"); if (error) throw error; return (data || []).map(rowToCert) }
    return certs.all()
  },
  byRegistration: async (regId: string): Promise<Certificate | undefined> => {
    if (hasSupabase && supabase) { const { data } = await supabase.from("certificates").select("*").eq("registration_id", regId).maybeSingle(); return data ? rowToCert(data) : undefined }
    return certs.all().find((c: any) => c.registrationId === regId)
  },
  byCertId: async (certId: string): Promise<Certificate | undefined> => {
    if (hasSupabase && supabase) { const { data } = await supabase.from("certificates").select("*").eq("certificate_id", certId).maybeSingle(); return data ? rowToCert(data) : undefined }
    return certs.all().find((c: any) => c.certificateId === certId)
  },
  issue: async (registrationId: string, participantName: string, date: string, issuedBy: string): Promise<Certificate> => {
    if (hasSupabase && supabase) {
      const existing = await certificateService.byRegistration(registrationId)
      if (existing) return existing
      const certId = "BL60-" + new Date().getFullYear() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase()
      const { data, error } = await supabase.from("certificates").insert({ registration_id: registrationId, participant_name: participantName, workshop_title: "Build Your First AI Project in 60 Minutes", date, certificate_id: certId, issued_by: issuedBy }).select().single()
      if (error) throw error
      return rowToCert(data)
    }
    const existing = certs.all().find((c: any) => c.registrationId === registrationId)
    if (existing) return existing
    const certId = "BL60-" + new Date().getFullYear() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase()
    return certs.create({ registrationId, participantName, workshopTitle: "Build Your First AI Project in 60 Minutes", date, certificateId: certId, issuedAt: new Date().toISOString(), issuedBy })
  },
  revoke: async (id: string) => {
    if (hasSupabase && supabase) { await supabase.from("certificates").delete().eq("id", id); return }
    certs.remove(id)
  },
}
