import { useState } from 'react'
import { Dumbbell, MoreVertical, Plus } from 'lucide-react'
import type { ExerciseLog } from '@/data'
import { useExercise, useExerciseMutations } from '@/hooks/useExercise'
import { useAreaMap } from '@/hooks/useAreas'
import { addDays, formatDate, todayISO } from '@/lib/date'
import { groupByDate } from './group'
import { ExerciseDialog } from './ExerciseDialog'
import { AreaDot } from '@/components/common/AreaDot'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/states'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ExerciseList() {
  const from = addDays(new Date(), -30).toISOString().slice(0, 10)
  const { data, isLoading, isError, error, refetch } = useExercise({ from, to: todayISO() })
  const { remove } = useExerciseMutations()
  const areaMap = useAreaMap()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ExerciseLog | undefined>()

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Log workout
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Dumbbell className="size-8" />}
          title="No workouts yet"
          description="Log your first workout to see it here (last 30 days shown)."
        />
      ) : (
        groupByDate(data).map(([date, items]) => (
          <div key={date}>
            <h3 className="text-muted-foreground mb-2 text-xs font-semibold">{formatDate(date)}</h3>
            <div className="space-y-2">
              {items.map((e) => (
                <div key={e.id} className="bg-card flex items-center gap-3 rounded-lg border p-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{e.type}</div>
                    <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 text-xs">
                      <span>{e.duration_min} min</span>
                      <span className="capitalize">{e.intensity}</span>
                      {e.calories != null && <span>{e.calories} kcal</span>}
                      {e.area_id && areaMap.get(e.area_id) && (
                        <span className="flex items-center gap-1">
                          <AreaDot color={areaMap.get(e.area_id)!.color} />
                          {areaMap.get(e.area_id)!.name}
                        </span>
                      )}
                      {e.notes && <span className="italic">{e.notes}</span>}
                    </div>
                  </div>
                  <EntryMenu onEdit={() => setEditing(e)} onDelete={() => remove.mutate(e.id)} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <ExerciseDialog open={creating} onOpenChange={setCreating} />
      {editing && (
        <ExerciseDialog open onOpenChange={(o) => !o && setEditing(undefined)} entry={editing} />
      )}
    </div>
  )
}

function EntryMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            if (confirm('Delete this entry?')) onDelete()
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
