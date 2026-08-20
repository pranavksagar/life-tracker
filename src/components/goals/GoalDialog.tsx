import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Goal, GoalStatus } from '@/data'
import { useGoalMutations } from '@/hooks/useGoals'
import { AreaSelect } from '@/components/common/AreaSelect'
import { SprintSelect } from '@/components/common/LinkSelects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

function optNum(v: string): number | null {
  const n = Number(v)
  return v.trim() === '' || Number.isNaN(n) ? null : n
}

export function GoalDialog({
  open,
  onOpenChange,
  goal,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: Goal
}) {
  const { create, update } = useGoalMutations()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [metricName, setMetricName] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [unit, setUnit] = useState('')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState<GoalStatus>('active')
  const [areaId, setAreaId] = useState<string | null>(null)
  const [sprintId, setSprintId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle(goal?.title ?? '')
    setDescription(goal?.description ?? '')
    setMetricName(goal?.metric_name ?? '')
    setTarget(goal?.target_value != null ? String(goal.target_value) : '')
    setCurrent(goal?.current_value != null ? String(goal.current_value) : '0')
    setUnit(goal?.unit ?? '')
    setDeadline(goal?.deadline ?? '')
    setStatus(goal?.status ?? 'active')
    setAreaId(goal?.area_id ?? null)
    setSprintId(goal?.sprint_id ?? null)
  }, [open, goal])

  async function submit() {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      metric_name: metricName.trim() || null,
      target_value: optNum(target),
      current_value: optNum(current) ?? 0,
      unit: unit.trim() || null,
      deadline: deadline || null,
      status,
      area_id: areaId,
      sprint_id: sprintId,
    }
    try {
      if (goal) {
        await update.mutateAsync({ id: goal.id, patch: payload })
      } else {
        await create.mutateAsync(payload)
        if (typeof pendo !== 'undefined') {
          pendo.track('goal_created', {
            has_metric: Boolean(metricName.trim()),
            has_target_value: target.trim() !== '' && !Number.isNaN(Number(target)),
            has_deadline: Boolean(deadline),
            has_area: areaId !== null,
            has_sprint: sprintId !== null,
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
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit goal' : 'New goal'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal-title">Title</Label>
            <Input
              id="goal-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 12 books this year"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal-desc">Description</Label>
            <Textarea
              id="goal-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="goal-current">Current</Label>
              <Input id="goal-current" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-target">Target</Label>
              <Input id="goal-target" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-unit">Unit</Label>
              <Input id="goal-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="books" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-deadline">Deadline</Label>
              <Input id="goal-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Area</Label>
              <AreaSelect value={areaId} onChange={setAreaId} />
            </div>
            <div className="space-y-1.5">
              <Label>Sprint</Label>
              <SprintSelect value={sprintId} onChange={setSprintId} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!title.trim() || busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {goal ? 'Save' : 'Add goal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
