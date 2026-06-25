import { useMemo } from 'react'
import { format } from 'date-fns'
import { CheckCircle2 } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { todayISO } from '@/lib/date'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/states'
import { TaskList } from '@/components/tasks/TaskList'
import { QuickAddTask } from '@/components/tasks/QuickAddTask'
import { TodayHabits } from '@/components/habits/TodayHabits'
import { QuickLog } from '@/components/activity/QuickLog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function greeting(d = new Date()): string {
  const h = d.getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function TodayPage() {
  const today = todayISO()
  // Everything not done; we slice "today" client-side.
  const { data, isLoading, isError, error, refetch } = useTasks({ status: ['todo', 'doing'] })

  const todays = useMemo(() => {
    if (!data) return []
    return data.filter((t) => t.status === 'doing' || (t.due_date && t.due_date <= today))
  }, [data, today])

  return (
    <div className="space-y-6">
      <PageHeader title={greeting()} description={format(new Date(), 'EEEE, MMMM d')} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick add</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <QuickAddTask defaults={{ due_date: today }} />
          <QuickLog />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <TodayHabits />
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Today &amp; overdue {todays.length > 0 && `· ${todays.length}`}
        </h2>
        {isLoading ? (
          <ListSkeleton rows={3} />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : todays.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="size-8" />}
            title="You're all caught up"
            description="Nothing due today. Add something above or enjoy the breather."
          />
        ) : (
          <TaskList tasks={todays} />
        )}
      </section>
    </div>
  )
}
