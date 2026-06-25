/**
 * Pure aggregation helpers for the Progress screen. Everything is computed in
 * the browser from rows already fetched — no extra round-trips.
 */
import { addDays, eachDayOfInterval, format, startOfWeek } from 'date-fns'
import type { ExerciseLog, FoodLog, Habit, HabitLog, Task } from '@/data'
import { completionsByWeek } from './habit-stats'
import { toISODate } from './date'

function weekKey(iso: string): string {
  return toISODate(startOfWeek(new Date(iso + 'T00:00:00'), { weekStartsOn: 1 }))
}

/** Ordered list of Monday week-starts spanning [from, to]. */
export function weeksBetween(from: string, to: string): string[] {
  const first = startOfWeek(new Date(from + 'T00:00:00'), { weekStartsOn: 1 })
  const last = startOfWeek(new Date(to + 'T00:00:00'), { weekStartsOn: 1 })
  const weeks: string[] = []
  for (let d = first; d <= last; d = addDays(d, 7)) weeks.push(toISODate(d))
  return weeks
}

export function weekLabel(weekStartISO: string): string {
  return format(new Date(weekStartISO + 'T00:00:00'), 'MMM d')
}

/** Tasks completed per week (by completed_at). */
export function taskThroughput(tasks: Task[], weeks: string[]): { week: string; completed: number }[] {
  const counts = new Map<string, number>()
  for (const t of tasks) {
    if (t.status !== 'done' || !t.completed_at) continue
    const k = weekKey(t.completed_at.slice(0, 10))
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return weeks.map((w) => ({ week: weekLabel(w), completed: counts.get(w) ?? 0 }))
}

/** Total exercise minutes per week. */
export function exerciseMinutes(logs: ExerciseLog[], weeks: string[]): { week: string; minutes: number }[] {
  const sums = new Map<string, number>()
  for (const e of logs) {
    const k = weekKey(e.date)
    sums.set(k, (sums.get(k) ?? 0) + e.duration_min)
  }
  return weeks.map((w) => ({ week: weekLabel(w), minutes: sums.get(w) ?? 0 }))
}

/** Expected completions per week for a habit. */
function weeklyExpected(habit: Habit): number {
  if (habit.cadence === 'daily') return 7
  if (habit.cadence === 'n_per_week') return Math.max(1, habit.target_count)
  return 1
}

/**
 * Overall habit completion rate per week (0–100): summed completed days across
 * all habits over summed expected, capped per habit so over-logging can't
 * exceed 100%.
 */
export function habitCompletionRate(
  habits: Habit[],
  logs: HabitLog[],
  weeks: string[],
): { week: string; rate: number }[] {
  const logsByHabit = new Map<string, HabitLog[]>()
  for (const log of logs) {
    const arr = logsByHabit.get(log.habit_id) ?? []
    arr.push(log)
    logsByHabit.set(log.habit_id, arr)
  }
  const perHabitWeek = new Map<string, Map<string, number>>()
  for (const habit of habits) {
    perHabitWeek.set(habit.id, completionsByWeek(logsByHabit.get(habit.id) ?? []))
  }

  return weeks.map((w) => {
    let completed = 0
    let expected = 0
    for (const habit of habits) {
      const exp = weeklyExpected(habit)
      expected += exp
      completed += Math.min(exp, perHabitWeek.get(habit.id)?.get(w) ?? 0)
    }
    return { week: weekLabel(w), rate: expected > 0 ? Math.round((completed / expected) * 100) : 0 }
  })
}

/** Daily calories and protein across [from, to]. */
export function nutritionDaily(
  logs: FoodLog[],
  from: string,
  to: string,
): { date: string; label: string; calories: number; protein: number }[] {
  const cal = new Map<string, number>()
  const pro = new Map<string, number>()
  for (const f of logs) {
    if (f.calories != null) cal.set(f.date, (cal.get(f.date) ?? 0) + f.calories)
    if (f.protein != null) pro.set(f.date, (pro.get(f.date) ?? 0) + f.protein)
  }
  const days = eachDayOfInterval({
    start: new Date(from + 'T00:00:00'),
    end: new Date(to + 'T00:00:00'),
  })
  return days.map((d) => {
    const iso = toISODate(d)
    return { date: iso, label: format(d, 'MMM d'), calories: cal.get(iso) ?? 0, protein: pro.get(iso) ?? 0 }
  })
}
