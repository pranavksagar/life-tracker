import { supabase } from '@/lib/supabase'
import { unwrap, unwrapList, unwrapVoid } from './client'
import type { NewSprint, Sprint, SprintPatch } from './types'

const TABLE = 'sprints'

export const sprintsRepo = {
  async list(): Promise<Sprint[]> {
    return unwrapList<Sprint>(
      await supabase.from(TABLE).select('*').order('start_date', { ascending: false }),
    )
  },

  /** The active sprint, or the one whose date range contains today. */
  async current(): Promise<Sprint | null> {
    const today = new Date().toISOString().slice(0, 10)
    const result = await supabase
      .from(TABLE)
      .select('*')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (result.error) throw result.error
    return result.data
  },

  async get(id: string): Promise<Sprint> {
    return unwrap<Sprint>(await supabase.from(TABLE).select('*').eq('id', id).single())
  },

  async create(input: NewSprint): Promise<Sprint> {
    return unwrap<Sprint>(await supabase.from(TABLE).insert(input).select('*').single())
  },

  async update(id: string, patch: SprintPatch): Promise<Sprint> {
    return unwrap<Sprint>(await supabase.from(TABLE).update(patch).eq('id', id).select('*').single())
  },

  async remove(id: string): Promise<void> {
    unwrapVoid(await supabase.from(TABLE).delete().eq('id', id))
  },
}
