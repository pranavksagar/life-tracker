import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { goalsRepo } from '@/data'
import type { GoalPatch, NewGoal } from '@/data'
import { qk, qkRoots } from '@/lib/query-keys'

export function useGoals(filter?: { sprintId?: string; areaId?: string }) {
  return useQuery({
    queryKey: qk.goals(filter),
    queryFn: () => goalsRepo.list(filter),
  })
}

export function useGoalMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: qkRoots.goals })

  const create = useMutation({
    mutationFn: (input: NewGoal) => goalsRepo.create(input),
    onSuccess: () => {
      invalidate()
      toast.success('Goal created')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not create goal'),
  })

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: GoalPatch }) => goalsRepo.update(id, patch),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not update goal'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => goalsRepo.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Goal deleted')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not delete goal'),
  })

  return { create, update, remove }
}
