import { supabase } from '@/lib/supabase'
import { unwrapList, unwrapVoid } from './client'
import type {
  Area,
  ExerciseLog,
  FoodLog,
  Goal,
  Habit,
  HabitLog,
  Sprint,
  Task,
} from './types'

export interface BackupFile {
  app: 'life-tracker'
  version: 1
  exportedAt: string
  data: {
    areas: Area[]
    sprints: Sprint[]
    goals: Goal[]
    tasks: Task[]
    habits: Habit[]
    habit_logs: HabitLog[]
    exercise_logs: ExerciseLog[]
    food_logs: FoodLog[]
  }
}

/** Dump every row the user can see (RLS already scopes to them). */
export async function exportAll(): Promise<BackupFile> {
  const [areas, sprints, goals, tasks, habits, habit_logs, exercise_logs, food_logs] =
    await Promise.all([
      unwrapList<Area>(await supabase.from('areas').select('*')),
      unwrapList<Sprint>(await supabase.from('sprints').select('*')),
      unwrapList<Goal>(await supabase.from('goals').select('*')),
      unwrapList<Task>(await supabase.from('tasks').select('*')),
      unwrapList<Habit>(await supabase.from('habits').select('*')),
      unwrapList<HabitLog>(await supabase.from('habit_logs').select('*')),
      unwrapList<ExerciseLog>(await supabase.from('exercise_logs').select('*')),
      unwrapList<FoodLog>(await supabase.from('food_logs').select('*')),
    ])

  return {
    app: 'life-tracker',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { areas, sprints, goals, tasks, habits, habit_logs, exercise_logs, food_logs },
  }
}

/** Drop the owner column so RLS assigns rows to the importing user. */
function strip<T extends { user_id: string }>(rows: T[]): Omit<T, 'user_id'>[] {
  return rows.map(({ user_id: _user_id, ...rest }) => rest)
}

/**
 * Restore a backup. Rows keep their original UUIDs and are upserted in
 * dependency order, so foreign keys stay intact and re-importing is idempotent.
 */
export async function importAll(file: BackupFile): Promise<void> {
  if (file?.app !== 'life-tracker' || !file.data) {
    throw new Error('This file does not look like a Life Tracker backup.')
  }
  const d = file.data
  // Order matters: parents before children.
  unwrapVoid(await supabase.from('areas').upsert(strip(d.areas ?? []), { onConflict: 'id' }))
  unwrapVoid(await supabase.from('sprints').upsert(strip(d.sprints ?? []), { onConflict: 'id' }))
  unwrapVoid(await supabase.from('goals').upsert(strip(d.goals ?? []), { onConflict: 'id' }))
  unwrapVoid(await supabase.from('tasks').upsert(strip(d.tasks ?? []), { onConflict: 'id' }))
  unwrapVoid(await supabase.from('habits').upsert(strip(d.habits ?? []), { onConflict: 'id' }))
  unwrapVoid(
    await supabase.from('habit_logs').upsert(strip(d.habit_logs ?? []), { onConflict: 'id' }),
  )
  unwrapVoid(
    await supabase.from('exercise_logs').upsert(strip(d.exercise_logs ?? []), { onConflict: 'id' }),
  )
  unwrapVoid(await supabase.from('food_logs').upsert(strip(d.food_logs ?? []), { onConflict: 'id' }))
}
