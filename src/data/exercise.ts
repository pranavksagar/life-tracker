import { supabase } from '@/lib/supabase'
import { unwrap, unwrapList, unwrapVoid } from './client'
import type { ExerciseLog, ExerciseLogPatch, NewExerciseLog } from './types'

const TABLE = 'exercise_logs'

export const exerciseRepo = {
  async list(filter?: { from?: string; to?: string; areaId?: string }): Promise<ExerciseLog[]> {
    let query = supabase.from(TABLE).select('*').order('date', { ascending: false })
    if (filter?.from) query = query.gte('date', filter.from)
    if (filter?.to) query = query.lte('date', filter.to)
    if (filter?.areaId) query = query.eq('area_id', filter.areaId)
    return unwrapList<ExerciseLog>(await query)
  },

  async create(input: NewExerciseLog): Promise<ExerciseLog> {
    return unwrap<ExerciseLog>(await supabase.from(TABLE).insert(input).select('*').single())
  },

  async update(id: string, patch: ExerciseLogPatch): Promise<ExerciseLog> {
    return unwrap<ExerciseLog>(
      await supabase.from(TABLE).update(patch).eq('id', id).select('*').single(),
    )
  },

  async remove(id: string): Promise<void> {
    unwrapVoid(await supabase.from(TABLE).delete().eq('id', id))
  },
}
