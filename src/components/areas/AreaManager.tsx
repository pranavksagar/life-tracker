import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Area } from '@/data'
import { useAreas, useAreaMutations } from '@/hooks/useAreas'
import { AreaDot } from '@/components/common/AreaDot'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/states'
import { AreaDialog } from './AreaDialog'
import { Button } from '@/components/ui/button'

export function AreaManager() {
  const { data, isLoading, isError, error, refetch } = useAreas()
  const { remove } = useAreaMutations()
  const [editing, setEditing] = useState<Area | undefined>(undefined)
  const [open, setOpen] = useState(false)

  function openNew() {
    setEditing(undefined)
    setOpen(true)
  }
  function openEdit(area: Area) {
    setEditing(area)
    setOpen(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Group everything by area (Health, Work, …).</p>
        <Button size="sm" variant="outline" onClick={openNew}>
          <Plus className="size-4" /> Add
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No areas yet" description="Create your first area to start grouping." />
      ) : (
        <ul className="divide-y rounded-lg border">
          {data.map((area) => (
            <li key={area.id} className="flex items-center gap-3 p-3">
              <AreaDot color={area.color} className="size-3" />
              <span className="flex-1 font-medium">{area.name}</span>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(area)}>
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  if (confirm(`Delete "${area.name}"? Items keep their data but lose this area.`))
                    remove.mutate(area.id)
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AreaDialog open={open} onOpenChange={setOpen} area={editing} />
    </div>
  )
}
