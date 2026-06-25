import { useMemo, useState } from 'react'
import { Plus, Repeat } from 'lucide-react'
import type { HabitLog } from '@/data'
import { useHabits, useHabitLogs } from '@/hooks/useHabits'
import { addDays, todayISO } from '@/lib/date'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/states'
import { HabitCard } from '@/components/habits/HabitCard'
import { HabitDialog } from '@/components/habits/HabitDialog'
import { Button } from '@/components/ui/button'

export function HabitsPage() {
  const to = todayISO()
  const from = addDays(new Date(), -97).toISOString().slice(0, 10)
  const [creating, setCreating] = useState(false)

  const habitsQuery = useHabits()
  const logsQuery = useHabitLogs(from, to)

  const logsByHabit = useMemo(() => {
    const m = new Map<string, HabitLog[]>()
    for (const log of logsQuery.data ?? []) {
      const arr = m.get(log.habit_id) ?? []
      arr.push(log)
      m.set(log.habit_id, arr)
    }
    return m
  }, [logsQuery.data])

  const isLoading = habitsQuery.isLoading || logsQuery.isLoading
  const isError = habitsQuery.isError || logsQuery.isError

  return (
    <div>
      <PageHeader
        title="Habits"
        description="Check off today and keep your streaks alive."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> New habit
          </Button>
        }
      />

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : isError ? (
        <ErrorState
          error={habitsQuery.error ?? logsQuery.error}
          onRetry={() => {
            habitsQuery.refetch()
            logsQuery.refetch()
          }}
        />
      ) : !habitsQuery.data || habitsQuery.data.length === 0 ? (
        <EmptyState
          icon={<Repeat className="size-8" />}
          title="No habits yet"
          description="Create a habit to start tracking streaks."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New habit
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {habitsQuery.data.map((habit) => (
            <HabitCard key={habit.id} habit={habit} logs={logsByHabit.get(habit.id) ?? []} />
          ))}
        </div>
      )}

      <HabitDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}
