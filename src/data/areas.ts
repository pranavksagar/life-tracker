import { supabase } from '@/lib/supabase'
import { unwrap, unwrapList, unwrapVoid } from './client'
import type { Area, AreaPatch, NewArea } from './types'

const TABLE = 'areas'

export const areasRepo = {
  async list(options?: { includeArchived?: boolean }): Promise<Area[]> {
    let query = supabase.from(TABLE).select('*').order('sort_order', { ascending: true })
    if (!options?.includeArchived) query = query.eq('archived', false)
    return unwrapList<Area>(await query)
  },

  async create(input: NewArea): Promise<Area> {
    return unwrap<Area>(await supabase.from(TABLE).insert(input).select('*').single())
  },

  async update(id: string, patch: AreaPatch): Promise<Area> {
    return unwrap<Area>(await supabase.from(TABLE).update(patch).eq('id', id).select('*').single())
  },

  async remove(id: string): Promise<void> {
    unwrapVoid(await supabase.from(TABLE).delete().eq('id', id))
  },
}
