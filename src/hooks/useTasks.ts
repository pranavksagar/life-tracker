import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tasksRepo } from '@/data'
import type { NewTask, TaskFilter, TaskPatch, TaskStatus } from '@/data'
import { todayISO } from '@/lib/date'
import { pendoTrack } from '@/lib/pendo'
import { qk, qkRoots } from '@/lib/query-keys'

export function useTasks(filter: TaskFilter = {}) {
  return useQuery({
    queryKey: qk.tasks(filter),
    queryFn: () => tasksRepo.list(filter),
  })
}

export function useTaskMutations() {
  const queryClient = useQueryClient()
  // Tasks appear across Today/Tasks/Board/Goals — invalidate the whole family.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: qkRoots.tasks })
    queryClient.invalidateQueries({ queryKey: qkRoots.goals })
  }

  const create = useMutation({
    mutationFn: (input: NewTask) => tasksRepo.create(input),
    onSuccess: (task) => {
      invalidate()
      toast.success('Task added')
      pendoTrack('task_created', {
        priority: task.priority,
        status: task.status,
        has_due_date: task.due_date != null,
        has_area: task.area_id != null,
        has_goal: task.goal_id != null,
        has_sprint: task.sprint_id != null,
        has_recurrence: task.recurrence != null,
        tag_count: task.tags.length,
      })
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'Could not add task'),
  })

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TaskPatch }) =>
      tasksRepo.update(id, patch),
    onSuccess: invalidate,
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'Could not update task'),
  })

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksRepo.setStatus(id, status),
    onSuccess: (task, { status }) => {
      invalidate()
      if (status === 'done') {
        pendoTrack('task_completed', {
          task_id: task.id,
          priority: task.priority,
          has_due_date: task.due_date != null,
          was_overdue: task.due_date != null && task.due_date < todayISO(),
          has_area: task.area_id != null,
          has_sprint: task.sprint_id != null,
          has_goal: task.goal_id != null,
        })
      }
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'Could not update task'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => tasksRepo.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Task deleted')
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'Could not delete task'),
  })

  return { create, update, setStatus, remove }
}
