import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Repeat } from 'lucide-react'
import type { Task, TaskStatus } from '@/data'
import { useTaskMutations } from '@/hooks/useTasks'
import { useAreaMap } from '@/hooks/useAreas'
import { priorityMeta } from '@/components/tasks/task-meta'
import { statusMeta } from '@/components/tasks/task-meta'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { AreaDot } from '@/components/common/AreaDot'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const COLUMNS: TaskStatus[] = ['todo', 'doing', 'done']

export function KanbanBoard({ tasks, sprintId }: { tasks: Task[]; sprintId: string }) {
  const { setStatus } = useTaskMutations()
  const [editing, setEditing] = useState<Task | undefined>()
  const [adding, setAdding] = useState<TaskStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  )

  function onDragEnd(event: DragEndEvent) {
    const overId = event.over?.id as TaskStatus | undefined
    const task = tasks.find((t) => t.id === event.active.id)
    if (!overId || !task || task.status === overId) return
    setStatus.mutate({ id: task.id, status: overId })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {COLUMNS.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onAdd={() => setAdding(status)}
            onEdit={setEditing}
          />
        ))}
      </div>

      {editing && <TaskDialog open onOpenChange={(o) => !o && setEditing(undefined)} task={editing} />}
      {adding && (
        <TaskDialog
          open
          onOpenChange={(o) => !o && setAdding(null)}
          defaults={{ sprint_id: sprintId, status: adding }}
        />
      )}
    </DndContext>
  )
}

function Column({
  status,
  tasks,
  onAdd,
  onEdit,
}: {
  status: TaskStatus
  tasks: Task[]
  onAdd: () => void
  onEdit: (task: Task) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-muted/40 flex flex-col rounded-xl border p-2 transition-colors',
        isOver && 'bg-accent ring-primary/40 ring-2',
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-sm font-semibold">
          {statusMeta[status].label}
          <span className="text-muted-foreground ml-1.5 font-normal">{tasks.length}</span>
        </span>
        <Button variant="ghost" size="icon" className="size-7" onClick={onAdd} aria-label="Add task">
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="min-h-16 space-y-2">
        {tasks.map((task) => (
          <Card key={task.id} task={task} onEdit={() => onEdit(task)} />
        ))}
      </div>
    </div>
  )
}

function Card({ task, onEdit }: { task: Task; onEdit: () => void }) {
  const areaMap = useAreaMap()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const area = task.area_id ? areaMap.get(task.area_id) : undefined

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn('bg-card rounded-lg border p-2.5 shadow-sm', isDragging && 'opacity-50')}
      {...attributes}
      {...listeners}
      onClick={onEdit}
      role="button"
      tabIndex={0}
    >
      <div className={cn('text-sm font-medium', task.status === 'done' && 'text-muted-foreground line-through')}>
        {task.title}
      </div>
      <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {area && <AreaDot color={area.color} />}
        {task.estimate != null && (
          <span className="bg-secondary rounded px-1.5 py-0.5 font-medium">{task.estimate}p</span>
        )}
        {task.priority !== 'medium' && (
          <span className={priorityMeta[task.priority].className}>{priorityMeta[task.priority].label}</span>
        )}
        {task.recurrence && <Repeat className="size-3" />}
      </div>
    </div>
  )
}
