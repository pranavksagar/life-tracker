import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tasksRepo } from '@/data'
import type { NewTask, TaskFilter, TaskPatch, TaskStatus } from '@/data'
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
    onSuccess: () => {
      invalidate()
      toast.success('Task added')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not add task'),
  })

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TaskPatch }) => tasksRepo.update(id, patch),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not update task'),
  })

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksRepo.setStatus(id, status),
    onSuccess: (_data, variables) => {
      invalidate()
      if (variables.status === 'done' && typeof pendo !== 'undefined') {
        pendo.track('task_completed')
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not update task'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => tasksRepo.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Task deleted')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not delete task'),
  })

  return { create, update, setStatus, remove }
}
