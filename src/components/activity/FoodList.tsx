import { useState } from 'react'
import { MoreVertical, Plus, UtensilsCrossed } from 'lucide-react'
import type { FoodLog } from '@/data'
import { useFood, useFoodMutations } from '@/hooks/useFood'
import { addDays, formatDate, todayISO } from '@/lib/date'
import { groupByDate } from './group'
import { FoodDialog } from './FoodDialog'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/states'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function FoodList() {
  const from = addDays(new Date(), -30).toISOString().slice(0, 10)
  const { data, isLoading, isError, error, refetch } = useFood({ from, to: todayISO() })
  const { remove } = useFoodMutations()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<FoodLog | undefined>()

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Log meal
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="size-8" />}
          title="No meals logged"
          description="Log a meal to see it here (last 30 days shown)."
        />
      ) : (
        groupByDate(data).map(([date, items]) => {
          const dayKcal = items.reduce((sum, i) => sum + (i.calories ?? 0), 0)
          return (
            <div key={date}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-muted-foreground text-xs font-semibold">{formatDate(date)}</h3>
                {dayKcal > 0 && <span className="text-muted-foreground text-xs">{dayKcal} kcal</span>}
              </div>
              <div className="space-y-2">
                {items.map((f) => (
                  <div key={f.id} className="bg-card flex items-center gap-3 rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="px-1.5 py-0 capitalize">
                          {f.meal}
                        </Badge>
                        <span className="truncate font-medium">{f.name}</span>
                      </div>
                      {(f.calories != null || f.protein != null || f.carbs != null || f.fat != null) && (
                        <div className="text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 text-xs">
                          {f.calories != null && <span>{f.calories} kcal</span>}
                          {f.protein != null && <span>P {f.protein}g</span>}
                          {f.carbs != null && <span>C {f.carbs}g</span>}
                          {f.fat != null && <span>F {f.fat}g</span>}
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 shrink-0">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(f)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm('Delete this entry?')) remove.mutate(f.id)
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      <FoodDialog open={creating} onOpenChange={setCreating} />
      {editing && <FoodDialog open onOpenChange={(o) => !o && setEditing(undefined)} entry={editing} />}
    </div>
  )
}
