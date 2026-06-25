import { supabase } from '@/lib/supabase'
import { unwrap, unwrapList, unwrapVoid } from './client'
import type { Habit, HabitLog, HabitPatch, NewHabit } from './types'

const HABITS = 'habits'
const LOGS = 'habit_logs'

export const habitsRepo = {
  async list(options?: { includeArchived?: boolean }): Promise<Habit[]> {
    let query = supabase.from(HABITS).select('*').order('created_at', { ascending: true })
    if (!options?.includeArchived) query = query.eq('archived', false)
    return unwrapList<Habit>(await query)
  },

  async get(id: string): Promise<Habit> {
    return unwrap<Habit>(await supabase.from(HABITS).select('*').eq('id', id).single())
  },

  async create(input: NewHabit): Promise<Habit> {
    return unwrap<Habit>(await supabase.from(HABITS).insert(input).select('*').single())
  },

  async update(id: string, patch: HabitPatch): Promise<Habit> {
    return unwrap<Habit>(await supabase.from(HABITS).update(patch).eq('id', id).select('*').single())
  },

  async remove(id: string): Promise<void> {
    unwrapVoid(await supabase.from(HABITS).delete().eq('id', id))
  },

  /** All logs in [from, to] (inclusive, ISO dates), optionally for one habit. */
  async logs(from: string, to: string, habitId?: string): Promise<HabitLog[]> {
    let query = supabase
      .from(LOGS)
      .select('*')
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: true })
    if (habitId) query = query.eq('habit_id', habitId)
    return unwrapList<HabitLog>(await query)
  },

  /** Mark a habit done on a date (idempotent via upsert on the unique key). */
  async logCompletion(habitId: string, date: string, count = 1): Promise<HabitLog> {
    return unwrap<HabitLog>(
      await supabase
        .from(LOGS)
        .upsert({ habit_id: habitId, date, count }, { onConflict: 'habit_id,date' })
        .select('*')
        .single(),
    )
  },

  /** Remove a habit's completion for a date (un-check). */
  async clearCompletion(habitId: string, date: string): Promise<void> {
    unwrapVoid(await supabase.from(LOGS).delete().eq('habit_id', habitId).eq('date', date))
  },
}
