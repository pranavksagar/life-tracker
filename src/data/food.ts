import { supabase } from '@/lib/supabase'
import { unwrap, unwrapList, unwrapVoid } from './client'
import type { FoodLog, FoodLogPatch, NewFoodLog } from './types'

const TABLE = 'food_logs'

export const foodRepo = {
  async list(filter?: { from?: string; to?: string; date?: string; areaId?: string }): Promise<FoodLog[]> {
    let query = supabase.from(TABLE).select('*').order('date', { ascending: false })
    if (filter?.date) query = query.eq('date', filter.date)
    if (filter?.from) query = query.gte('date', filter.from)
    if (filter?.to) query = query.lte('date', filter.to)
    if (filter?.areaId) query = query.eq('area_id', filter.areaId)
    return unwrapList<FoodLog>(await query)
  },

  async create(input: NewFoodLog): Promise<FoodLog> {
    return unwrap<FoodLog>(await supabase.from(TABLE).insert(input).select('*').single())
  },

  async update(id: string, patch: FoodLogPatch): Promise<FoodLog> {
    return unwrap<FoodLog>(await supabase.from(TABLE).update(patch).eq('id', id).select('*').single())
  },

  async remove(id: string): Promise<void> {
    unwrapVoid(await supabase.from(TABLE).delete().eq('id', id))
  },
}
