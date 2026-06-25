import { useState } from 'react'
import { Plus, ListTodo } from 'lucide-react'
import type { TaskStatus } from '@/data'
import { useTasks } from '@/hooks/useTasks'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/states'
import { AreaSelect } from '@/components/common/AreaSelect'
import { TaskList } from '@/components/tasks/TaskList'
import { QuickAddTask } from '@/components/tasks/QuickAddTask'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type StatusFilter = 'all' | TaskStatus

export function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [areaId, setAreaId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  const { data, isLoading, isError, error, refetch } = useTasks({
    status: statusFilter === 'all' ? undefined : statusFilter,
    areaId: areaId ?? undefined,
    search: search.trim() || undefined,
  })

  return (
    <div>
      <PageHeader
        title="Tasks"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> New task
          </Button>
        }
      />

      <div className="mb-4 space-y-3">
        <QuickAddTask />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="todo">To do</TabsTrigger>
              <TabsTrigger value="doing">Doing</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-1 gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="flex-1"
            />
            <div className="w-40">
              <AreaSelect value={areaId} onChange={setAreaId} placeholder="All areas" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="size-8" />}
          title="No tasks here"
          description="Add your first task above, or adjust the filters."
        />
      ) : (
        <TaskList tasks={data} />
      )}

      <TaskDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}
