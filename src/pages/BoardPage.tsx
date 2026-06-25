import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, Pencil, Plus, Trash2 } from 'lucide-react'
import { goalProgress } from '@/data'
import { useSprints, useCurrentSprint, useSprintMutations } from '@/hooks/useSprints'
import { useTasks } from '@/hooks/useTasks'
import { useGoals } from '@/hooks/useGoals'
import { formatDate } from '@/lib/date'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/states'
import { KanbanBoard } from '@/components/sprints/KanbanBoard'
import { SprintDialog } from '@/components/sprints/SprintDialog'
import { RetroEditor } from '@/components/sprints/RetroEditor'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function BoardPage() {
  const sprintsQuery = useSprints()
  const currentQuery = useCurrentSprint()
  const { remove } = useSprintMutations()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)

  // Default the selection to the current/most-recent sprint once loaded.
  useEffect(() => {
    if (selectedId || !sprintsQuery.data) return
    const fallback = currentQuery.data?.id ?? sprintsQuery.data[0]?.id ?? null
    if (fallback) setSelectedId(fallback)
  }, [selectedId, sprintsQuery.data, currentQuery.data])

  const sprint = useMemo(
    () => sprintsQuery.data?.find((s) => s.id === selectedId) ?? null,
    [sprintsQuery.data, selectedId],
  )

  const tasksQuery = useTasks(selectedId ? { sprintId: selectedId } : {})
  const goalsQuery = useGoals(selectedId ? { sprintId: selectedId } : undefined)

  if (sprintsQuery.isLoading) {
    return (
      <div>
        <PageHeader title="Sprint board" />
        <ListSkeleton rows={3} />
      </div>
    )
  }

  if (sprintsQuery.isError) {
    return (
      <div>
        <PageHeader title="Sprint board" />
        <ErrorState error={sprintsQuery.error} onRetry={sprintsQuery.refetch} />
      </div>
    )
  }

  if (!sprintsQuery.data || sprintsQuery.data.length === 0) {
    return (
      <div>
        <PageHeader title="Sprint board" />
        <EmptyState
          icon={<LayoutGrid className="size-8" />}
          title="No sprints yet"
          description="Plan your personal work in a time-boxed sprint."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New sprint
            </Button>
          }
        />
        <SprintDialog open={creating} onOpenChange={setCreating} />
      </div>
    )
  }

  const tasks = tasksQuery.data ?? []
  const done = tasks.filter((t) => t.status === 'done').length
  const committed = tasks.reduce((sum, t) => sum + (t.estimate ?? 0), 0)
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sprint board"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> New sprint
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={selectedId ?? undefined} onValueChange={setSelectedId}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Select a sprint" />
          </SelectTrigger>
          <SelectContent>
            {sprintsQuery.data.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sprint && (
          <>
            <Badge variant={sprint.status === 'active' ? 'default' : 'secondary'} className="capitalize">
              {sprint.status}
            </Badge>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => {
                if (sprint && confirm(`Delete sprint "${sprint.name}"? Tasks keep their data.`)) {
                  remove.mutate(sprint.id)
                  setSelectedId(null)
                }
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </>
        )}
      </div>

      {sprint && (
        <Card>
          <CardContent className="pt-5">
            <div className="text-muted-foreground mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                {formatDate(sprint.start_date)} → {formatDate(sprint.end_date)}
              </span>
              <span>
                {done}/{tasks.length} done
                {committed > 0 && ` · ${committed} pts committed`}
                {sprint.capacity != null && ` of ${sprint.capacity} capacity`}
              </span>
            </div>
            <Progress value={pct} />
            {sprint.capacity != null && committed > sprint.capacity && (
              <p className="text-warning mt-2 text-xs" style={{ color: 'var(--warning)' }}>
                Over capacity by {committed - sprint.capacity} points — consider trimming scope.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {goalsQuery.data && goalsQuery.data.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sprint goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {goalsQuery.data.map((g) => {
              const frac = goalProgress(g)
              return (
                <div key={g.id} className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm">{g.title}</span>
                  <div className="w-28">
                    <Progress value={frac != null ? Math.round(frac * 100) : 0} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {tasksQuery.isLoading ? (
        <ListSkeleton rows={3} />
      ) : selectedId ? (
        <KanbanBoard tasks={tasks} sprintId={selectedId} />
      ) : null}

      {sprint && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Retro &amp; notes</CardTitle>
          </CardHeader>
          <CardContent>
            <RetroEditor sprint={sprint} />
          </CardContent>
        </Card>
      )}

      <SprintDialog open={creating} onOpenChange={setCreating} />
      {sprint && editing && <SprintDialog open onOpenChange={setEditing} sprint={sprint} />}
    </div>
  )
}
