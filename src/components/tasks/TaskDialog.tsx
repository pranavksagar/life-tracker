import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import type { NewTask, Priority, Recurrence, Task, TaskStatus } from '@/data'
import { useTaskMutations } from '@/hooks/useTasks'
import { AreaSelect } from '@/components/common/AreaSelect'
import { GoalSelect, SprintSelect } from '@/components/common/LinkSelects'
import { PRIORITIES, STATUSES, parseTags, priorityMeta, statusMeta } from './task-meta'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface FormShape {
  title: string
  notes: string
  due_date: string
  priority: Priority
  status: TaskStatus
  area_id: string | null
  goal_id: string | null
  sprint_id: string | null
  tagsText: string
  recurrenceFreq: 'none' | 'daily' | 'weekly' | 'monthly'
}

function toForm(task?: Task, defaults?: Partial<NewTask>): FormShape {
  return {
    title: task?.title ?? '',
    notes: task?.notes ?? '',
    due_date: task?.due_date ?? defaults?.due_date ?? '',
    priority: (task?.priority ?? defaults?.priority ?? 'medium') as Priority,
    status: (task?.status ?? defaults?.status ?? 'todo') as TaskStatus,
    area_id: task?.area_id ?? defaults?.area_id ?? null,
    goal_id: task?.goal_id ?? defaults?.goal_id ?? null,
    sprint_id: task?.sprint_id ?? defaults?.sprint_id ?? null,
    tagsText: (task?.tags ?? []).join(', '),
    recurrenceFreq: task?.recurrence?.freq ?? 'none',
  }
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaults,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  defaults?: Partial<NewTask>
}) {
  const { create, update } = useTaskMutations()
  const isEdit = Boolean(task)
  const { register, handleSubmit, control, reset, formState } = useForm<FormShape>({
    defaultValues: toForm(task, defaults),
  })

  // Reset whenever the dialog opens for a different task.
  useEffect(() => {
    if (open) reset(toForm(task, defaults))
  }, [open, task, defaults, reset])

  async function onSubmit(values: FormShape) {
    const recurrence: Recurrence | null =
      values.recurrenceFreq === 'none' ? null : { freq: values.recurrenceFreq, interval: 1 }

    const payload = {
      title: values.title.trim(),
      notes: values.notes.trim() || null,
      due_date: values.due_date || null,
      priority: values.priority,
      status: values.status,
      area_id: values.area_id,
      goal_id: values.goal_id,
      sprint_id: values.sprint_id,
      tags: parseTags(values.tagsText),
      recurrence,
    }

    try {
      if (task) await update.mutateAsync({ id: task.id, patch: payload })
      else await create.mutateAsync(payload)
      onOpenChange(false)
    } catch {
      // mutation hooks surface the toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit task' : 'New task'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update the details.' : 'Add something to do.'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" autoFocus placeholder="What needs doing?" {...register('title', { required: true })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" type="date" {...register('due_date')} />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {priorityMeta[p].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusMeta[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Area</Label>
              <Controller
                control={control}
                name="area_id"
                render={({ field }) => <AreaSelect value={field.value} onChange={field.onChange} />}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" placeholder="comma, separated" {...register('tagsText')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Goal</Label>
              <Controller
                control={control}
                name="goal_id"
                render={({ field }) => <GoalSelect value={field.value} onChange={field.onChange} />}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sprint</Label>
              <Controller
                control={control}
                name="sprint_id"
                render={({ field }) => <SprintSelect value={field.value} onChange={field.onChange} />}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Repeat</Label>
            <Controller
              control={control}
              name="recurrenceFreq"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Does not repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} placeholder="Optional details" {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? 'Save' : 'Add task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
