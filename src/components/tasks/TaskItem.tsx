import { useState } from 'react'
import { MoreVertical, Repeat } from 'lucide-react'
import type { Area, Task } from '@/data'
import { useTaskMutations } from '@/hooks/useTasks'
import { relativeDueLabel } from '@/lib/date'
import { cn } from '@/lib/utils'
import { AreaDot } from '@/components/common/AreaDot'
import { TaskDialog } from './TaskDialog'
import { priorityMeta } from './task-meta'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function TaskItem({ task, area }: { task: Task; area?: Area }) {
  const { setStatus, remove } = useTaskMutations()
  const [editing, setEditing] = useState(false)
  const done = task.status === 'done'
  const overdue = !done && task.due_date && task.due_date < new Date().toISOString().slice(0, 10)

  return (
    <div className="group bg-card flex items-start gap-3 rounded-lg border p-3">
      <Checkbox
        checked={done}
        onCheckedChange={(checked) =>
          setStatus.mutate({ id: task.id, status: checked ? 'done' : 'todo' })
        }
        className="mt-0.5"
        aria-label={done ? 'Mark as not done' : 'Mark as done'}
      />

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="min-w-0 flex-1 text-left"
      >
        <div className={cn('font-medium leading-snug', done && 'text-muted-foreground line-through')}>
          {task.title}
        </div>
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {task.status === 'doing' && <Badge variant="secondary" className="px-1.5 py-0">Doing</Badge>}
          {area && (
            <span className="flex items-center gap-1">
              <AreaDot color={area.color} /> {area.name}
            </span>
          )}
          {task.due_date && (
            <span className={cn(overdue && 'text-destructive font-medium')}>
              {relativeDueLabel(task.due_date)}
            </span>
          )}
          {task.priority !== 'medium' && (
            <span className={priorityMeta[task.priority].className}>{priorityMeta[task.priority].label}</span>
          )}
          {task.recurrence && <Repeat className="size-3" />}
          {task.tags.map((t) => (
            <span key={t} className="bg-muted rounded px-1.5 py-0.5">
              #{t}
            </span>
          ))}
        </div>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditing(true)}>Edit</DropdownMenuItem>
          {task.status !== 'todo' && (
            <DropdownMenuItem onClick={() => setStatus.mutate({ id: task.id, status: 'todo' })}>
              Move to To do
            </DropdownMenuItem>
          )}
          {task.status !== 'doing' && (
            <DropdownMenuItem onClick={() => setStatus.mutate({ id: task.id, status: 'doing' })}>
              Move to Doing
            </DropdownMenuItem>
          )}
          {task.status !== 'done' && (
            <DropdownMenuItem onClick={() => setStatus.mutate({ id: task.id, status: 'done' })}>
              Mark done
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              if (confirm('Delete this task?')) remove.mutate(task.id)
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editing && <TaskDialog open={editing} onOpenChange={setEditing} task={task} />}
    </div>
  )
}
