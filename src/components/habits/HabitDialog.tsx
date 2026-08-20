import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Habit, HabitCadence } from '@/data'
import { useHabitMutations } from '@/hooks/useHabits'
import { cn } from '@/lib/utils'
import { AreaSelect } from '@/components/common/AreaSelect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#64748b']

export function HabitDialog({
  open,
  onOpenChange,
  habit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit?: Habit
}) {
  const { create, update } = useHabitMutations()
  const [name, setName] = useState('')
  const [cadence, setCadence] = useState<HabitCadence>('daily')
  const [target, setTarget] = useState(1)
  const [areaId, setAreaId] = useState<string | null>(null)
  const [color, setColor] = useState(COLORS[2])

  useEffect(() => {
    if (!open) return
    setName(habit?.name ?? '')
    setCadence(habit?.cadence ?? 'daily')
    setTarget(habit?.target_count ?? 1)
    setAreaId(habit?.area_id ?? null)
    setColor(habit?.color ?? COLORS[2])
  }, [open, habit])

  const showTarget = cadence === 'n_per_week' || cadence === 'daily'

  async function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    const payload = {
      name: trimmed,
      cadence,
      target_count: Math.max(1, target),
      area_id: areaId,
      color,
    }
    try {
      if (habit) {
        await update.mutateAsync({ id: habit.id, patch: payload })
      } else {
        await create.mutateAsync(payload)
        if (typeof pendo !== 'undefined') {
          pendo.track('habit_created', {
            cadence,
            target_count: Math.max(1, target),
            has_area: areaId !== null,
          })
        }
      }
      onOpenChange(false)
    } catch {
      /* toast handled in hook */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit habit' : 'New habit'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meditate"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cadence</Label>
              <Select value={cadence} onValueChange={(v) => setCadence(v as HabitCadence)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="n_per_week">N× per week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showTarget && (
              <div className="space-y-1.5">
                <Label htmlFor="habit-target">
                  {cadence === 'daily' ? 'Times / day' : 'Times / week'}
                </Label>
                <Input
                  id="habit-target"
                  type="number"
                  min={1}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value) || 1)}
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Area</Label>
            <AreaSelect value={areaId} onChange={setAreaId} />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'size-7 rounded-full border-2 transition',
                    color === c ? 'border-foreground' : 'border-transparent',
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim() || create.isPending || update.isPending}>
            {(create.isPending || update.isPending) && <Loader2 className="size-4 animate-spin" />}
            {habit ? 'Save' : 'Add habit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
