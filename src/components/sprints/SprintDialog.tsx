import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Sprint, SprintStatus } from '@/data'
import { useSprintMutations } from '@/hooks/useSprints'
import { addDays, todayISO } from '@/lib/date'
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

function optInt(v: string): number | null {
  const n = Number(v)
  return v.trim() === '' || Number.isNaN(n) ? null : Math.round(n)
}

export function SprintDialog({
  open,
  onOpenChange,
  sprint,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sprint?: Sprint
}) {
  const { create, update } = useSprintMutations()
  const [name, setName] = useState('')
  const [start, setStart] = useState(todayISO())
  const [end, setEnd] = useState(addDays(new Date(), 13).toISOString().slice(0, 10))
  const [capacity, setCapacity] = useState('')
  const [status, setStatus] = useState<SprintStatus>('planning')

  useEffect(() => {
    if (!open) return
    setName(sprint?.name ?? '')
    setStart(sprint?.start_date ?? todayISO())
    setEnd(sprint?.end_date ?? addDays(new Date(), 13).toISOString().slice(0, 10))
    setCapacity(sprint?.capacity != null ? String(sprint.capacity) : '')
    setStatus(sprint?.status ?? 'planning')
  }, [open, sprint])

  async function submit() {
    if (!name.trim() || !start || !end) return
    if (end < start) return
    const payload = {
      name: name.trim(),
      start_date: start,
      end_date: end,
      capacity: optInt(capacity),
      status,
    }
    try {
      if (sprint) {
        await update.mutateAsync({ id: sprint.id, patch: payload })
      } else {
        await create.mutateAsync(payload)
        const startDate = new Date(start)
        const endDate = new Date(end)
        const durationDays = Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        )
        if (typeof pendo !== 'undefined') {
          pendo.track('sprint_created', {
            duration_days: durationDays,
            has_capacity: capacity.trim() !== '',
            capacity: optInt(capacity),
            status,
          })
        }
      }
      onOpenChange(false)
    } catch {
      /* toast handled in hook */
    }
  }

  const busy = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{sprint ? 'Edit sprint' : 'New sprint'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sprint-name">Name</Label>
            <Input
              id="sprint-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sprint 3 — Ship the thing"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sprint-start">Start</Label>
              <Input
                id="sprint-start"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sprint-end">End</Label>
              <Input
                id="sprint-end"
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          {end < start && (
            <p className="text-destructive text-xs">End date must be after the start.</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sprint-cap">Capacity (points)</Label>
              <Input
                id="sprint-cap"
                type="number"
                min={0}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 20"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as SprintStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim() || end < start || busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {sprint ? 'Save' : 'Create sprint'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
