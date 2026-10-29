import { collection } from "./store"
import type { Score } from "../types"
import { supabase, hasSupabase } from "../lib/supabase"

const scores: any = collection<Score>("bl60_scores")

function rowToScore(r: any): Score { return { id: r.id, submissionId: r.submission_id, judgeId: r.judge_id, functionality: r.functionality, usefulness: r.usefulness, originality: r.originality, presentation: r.presentation, comments: r.comments, total: r.total, state: r.state, createdAt: r.created_at, updatedAt: r.updated_at } }

export const scoreService = {
  all: async (): Promise<Score[]> => {
    if (hasSupabase && supabase) { const { data, error } = await supabase.from("scores").select("*"); if (error) throw error; return (data || []).map(rowToScore) }
    return scores.all()
  },
  bySubmission: async (submissionId: string): Promise<Score[]> => {
    if (hasSupabase && supabase) { const { data, error } = await supabase.from("scores").select("*").eq("submission_id", submissionId); if (error) throw error; return (data || []).map(rowToScore) }
    return scores.all().filter((s: any) => s.submissionId === submissionId)
  },
  byJudge: async (judgeId: string): Promise<Score[]> => {
    if (hasSupabase && supabase) { const { data, error } = await supabase.from("scores").select("*").eq("judge_id", judgeId); if (error) throw error; return (data || []).map(rowToScore) }
    return scores.all().filter((s: any) => s.judgeId === judgeId)
  },
  upsert: async (data: any): Promise<Score> => {
    const total = data.functionality + data.usefulness + data.originality + data.presentation
    if (hasSupabase && supabase) {
      const { data: existing } = await supabase.from("scores").select("*").eq("submission_id", data.submissionId).eq("judge_id", data.judgeId).maybeSingle()
      if (existing) {
        const { data: row, error } = await supabase.from("scores").update({ functionality: data.functionality, usefulness: data.usefulness, originality: data.originality, presentation: data.presentation, total, comments: data.comments, state: data.state, updated_at: new Date().toISOString() }).eq("id", existing.id).select().single()
        if (error) throw error
        return rowToScore(row)
      }
      const { data: row, error } = await supabase.from("scores").insert({ submission_id: data.submissionId, judge_id: data.judgeId, functionality: data.functionality, usefulness: data.usefulness, originality: data.originality, presentation: data.presentation, total, comments: data.comments, state: data.state }).select().single()
      if (error) throw error
      return rowToScore(row)
    }
    const existing = scores.all().find((s: any) => s.submissionId === data.submissionId && s.judgeId === data.judgeId)
    if (existing) return scores.update(existing.id, { ...data, total, updatedAt: new Date().toISOString() })!
    return scores.create({ ...data, total, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
  },
  finalize: async (id: string) => {
    if (hasSupabase && supabase) { await supabase.from("scores").update({ state: "submitted", updated_at: new Date().toISOString() }).eq("id", id); return }
    scores.update(id, { state: "submitted", updatedAt: new Date().toISOString() })
  },
  rankingFor: async (submissionId: string) => {
    const ss = await scoreService.bySubmission(submissionId)
    const submitted = ss.filter((s: any) => s.state === "submitted")
    if (submitted.length === 0) return null
    const avg = submitted.reduce((a: number, s: any) => a + s.total, 0) / submitted.length
    return { average: avg, count: submitted.length }
  },
}
