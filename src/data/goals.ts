import { supabase } from '@/lib/supabase'
import { unwrap, unwrapList, unwrapVoid } from './client'
import type { Goal, GoalPatch, NewGoal } from './types'

const TABLE = 'goals'

export const goalsRepo = {
  async list(filter?: { sprintId?: string; areaId?: string }): Promise<Goal[]> {
    let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false })
    if (filter?.sprintId) query = query.eq('sprint_id', filter.sprintId)
    if (filter?.areaId) query = query.eq('area_id', filter.areaId)
    return unwrapList<Goal>(await query)
  },

  async get(id: string): Promise<Goal> {
    return unwrap<Goal>(await supabase.from(TABLE).select('*').eq('id', id).single())
  },

  async create(input: NewGoal): Promise<Goal> {
    return unwrap<Goal>(await supabase.from(TABLE).insert(input).select('*').single())
  },

  async update(id: string, patch: GoalPatch): Promise<Goal> {
    return unwrap<Goal>(await supabase.from(TABLE).update(patch).eq('id', id).select('*').single())
  },

  async remove(id: string): Promise<void> {
    unwrapVoid(await supabase.from(TABLE).delete().eq('id', id))
  },
}

/** Progress as a 0–1 fraction; null when the goal has no measurable target. */
export function goalProgress(goal: Goal): number | null {
  if (goal.target_value === null || goal.target_value === 0) return null
  return Math.max(0, Math.min(1, goal.current_value / goal.target_value))
}
