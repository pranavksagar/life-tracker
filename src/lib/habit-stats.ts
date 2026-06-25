/**
 * Habit streak + completion math, computed from logs (nothing is stored).
 * Weeks start on Monday. "Completed on a day" means a log with count >= the
 * habit's per-day target (daily) or >= 1 (weekly / n-per-week).
 */
import { addDays, differenceInCalendarDays, startOfWeek } from 'date-fns'
import type { Habit, HabitLog } from '@/data'
import { toISODate, todayISO } from './date'

export interface Streak {
  value: number
  unit: 'day' | 'week'
}

/** target completions per week, for weekly / n_per_week habits. */
function weeklyTarget(habit: Habit): number {
  return habit.cadence === 'n_per_week' ? Math.max(1, habit.target_count) : 1
}

/** Map of ISO date -> total count from logs. */
export function countsByDate(logs: HabitLog[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const log of logs) m.set(log.date, (m.get(log.date) ?? 0) + log.count)
  return m
}

function dayMet(habit: Habit, count: number): boolean {
  const target = habit.cadence === 'daily' ? Math.max(1, habit.target_count) : 1
  return count >= target
}

/** ISO date of the Monday that starts the week containing `iso`. */
function weekKey(iso: string): string {
  return toISODate(startOfWeek(new Date(iso + 'T00:00:00'), { weekStartsOn: 1 }))
}

/** Completions per week (week-start ISO -> number of completed days). */
export function completionsByWeek(logs: HabitLog[]): Map<string, number> {
  const m = new Map<string, number>()
  const counts = countsByDate(logs)
  for (const [date, count] of counts) {
    if (count <= 0) continue
    const k = weekKey(date)
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return m
}

/** Current streak for a habit, in days (daily) or weeks (weekly/n_per_week). */
export function currentStreak(habit: Habit, logs: HabitLog[]): Streak {
  const today = todayISO()

  if (habit.cadence === 'daily') {
    const counts = countsByDate(logs)
    let cursor = new Date(today + 'T00:00:00')
    // If today isn't met yet, the streak can still stand from yesterday.
    if (!dayMet(habit, counts.get(today) ?? 0)) cursor = addDays(cursor, -1)
    let value = 0
    while (dayMet(habit, counts.get(toISODate(cursor)) ?? 0)) {
      value += 1
      cursor = addDays(cursor, -1)
    }
    return { value, unit: 'day' }
  }

  // weekly / n_per_week
  const target = weeklyTarget(habit)
  const byWeek = completionsByWeek(logs)
  let cursor = startOfWeek(new Date(today + 'T00:00:00'), { weekStartsOn: 1 })
  // Current (in-progress) week shouldn't break the streak if not yet met.
  if ((byWeek.get(toISODate(cursor)) ?? 0) < target) cursor = addDays(cursor, -7)
  let value = 0
  while ((byWeek.get(toISODate(cursor)) ?? 0) >= target) {
    value += 1
    cursor = addDays(cursor, -7)
  }
  return { value, unit: 'week' }
}

/** Completion rate in [from,to] as a 0–1 fraction (days or weeks met). */
export function completionRate(habit: Habit, logs: HabitLog[], from: string, to: string): number {
  if (habit.cadence === 'daily') {
    const counts = countsByDate(logs)
    const totalDays = differenceInCalendarDays(new Date(to), new Date(from)) + 1
    if (totalDays <= 0) return 0
    let met = 0
    for (let i = 0; i < totalDays; i++) {
      const iso = toISODate(addDays(new Date(from + 'T00:00:00'), i))
      if (dayMet(habit, counts.get(iso) ?? 0)) met += 1
    }
    return met / totalDays
  }

  const target = weeklyTarget(habit)
  const byWeek = completionsByWeek(logs)
  const firstWeek = startOfWeek(new Date(from + 'T00:00:00'), { weekStartsOn: 1 })
  const lastWeek = startOfWeek(new Date(to + 'T00:00:00'), { weekStartsOn: 1 })
  const weeks = Math.floor(differenceInCalendarDays(lastWeek, firstWeek) / 7) + 1
  if (weeks <= 0) return 0
  let met = 0
  for (let i = 0; i < weeks; i++) {
    const k = toISODate(addDays(firstWeek, i * 7))
    if ((byWeek.get(k) ?? 0) >= target) met += 1
  }
  return met / weeks
}

export function cadenceLabel(habit: Habit): string {
  if (habit.cadence === 'daily')
    return habit.target_count > 1 ? `${habit.target_count}× daily` : 'Daily'
  if (habit.cadence === 'weekly') return 'Weekly'
  return `${habit.target_count}× / week`
}
