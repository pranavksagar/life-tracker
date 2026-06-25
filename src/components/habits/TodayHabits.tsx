import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { useHabits, useHabitLogs, useHabitMutations } from '@/hooks/useHabits'
import { countsByDate, currentStreak } from '@/lib/habit-stats'
import { addDays, todayISO } from '@/lib/date'
import { LoadingState } from '@/components/common/states'
import { Checkbox } from '@/components/ui/checkbox'

/** Compact habit checkoff list for the Today dashboard. */
export function TodayHabits() {
  const today = todayISO()
  const from = addDays(new Date(), -60).toISOString().slice(0, 10)
  const { data: habits, isLoading } = useHabits()
  const { data: logs } = useHabitLogs(from, today)
  const { toggle } = useHabitMutations()

  const logsByHabit = useMemo(() => {
    const m = new Map<string, typeof logs>()
    for (const log of logs ?? []) {
      const arr = m.get(log.habit_id) ?? []
      arr!.push(log)
      m.set(log.habit_id, arr)
    }
    return m
  }, [logs])

  if (isLoading) return <LoadingState label="Loading habits…" />
  if (!habits || habits.length === 0) {
    return <p className="text-muted-foreground text-sm">No habits yet. Add some in the Habits tab.</p>
  }

  return (
    <ul className="space-y-1">
      {habits.map((habit) => {
        const habitLogs = logsByHabit.get(habit.id) ?? []
        const done = countsByDate(habitLogs).get(today) ? true : false
        const streak = currentStreak(habit, habitLogs)
        return (
          <li key={habit.id} className="flex items-center gap-3 py-1">
            <Checkbox
              checked={done}
              onCheckedChange={(c) => toggle.mutate({ habitId: habit.id, date: today, done: Boolean(c) })}
              aria-label={`Mark ${habit.name} done`}
            />
            <span className="size-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
            <span className="flex-1 text-sm">{habit.name}</span>
            {streak.value > 0 && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Flame className="size-3 text-orange-500" />
                {streak.value}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
