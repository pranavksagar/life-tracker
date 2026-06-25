import { useMemo, useState } from 'react'
import { Flag, Plus } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { useTasks } from '@/hooks/useTasks'
import { useHabits } from '@/hooks/useHabits'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/states'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalDialog } from '@/components/goals/GoalDialog'
import { Button } from '@/components/ui/button'

export function GoalsPage() {
  const goalsQuery = useGoals()
  const tasksQuery = useTasks()
  const habitsQuery = useHabits()
  const [creating, setCreating] = useState(false)

  const tasksByGoal = useMemo(() => groupByGoal(tasksQuery.data ?? []), [tasksQuery.data])
  const habitsByGoal = useMemo(() => groupByGoal(habitsQuery.data ?? []), [habitsQuery.data])

  const isLoading = goalsQuery.isLoading || tasksQuery.isLoading || habitsQuery.isLoading

  return (
    <div>
      <PageHeader
        title="Goals"
        description="Measurable objectives and what feeds them."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> New goal
          </Button>
        }
      />

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : goalsQuery.isError ? (
        <ErrorState error={goalsQuery.error} onRetry={goalsQuery.refetch} />
      ) : !goalsQuery.data || goalsQuery.data.length === 0 ? (
        <EmptyState
          icon={<Flag className="size-8" />}
          title="No goals yet"
          description="Set a measurable goal and link tasks or habits to it."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New goal
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {goalsQuery.data.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              tasks={tasksByGoal.get(goal.id) ?? []}
              habits={habitsByGoal.get(goal.id) ?? []}
            />
          ))}
        </div>
      )}

      <GoalDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}

function groupByGoal<T extends { goal_id: string | null }>(rows: T[]): Map<string, T[]> {
  const m = new Map<string, T[]>()
  for (const row of rows) {
    if (!row.goal_id) continue
    const arr = m.get(row.goal_id) ?? []
    arr.push(row)
    m.set(row.goal_id, arr)
  }
  return m
}
