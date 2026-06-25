import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { foodRepo } from '@/data'
import type { FoodLogPatch, NewFoodLog } from '@/data'
import { qk, qkRoots } from '@/lib/query-keys'

export interface FoodFilter {
  from?: string
  to?: string
  date?: string
  areaId?: string
}

export function useFood(filter: FoodFilter = {}) {
  return useQuery({
    queryKey: qk.food(filter),
    queryFn: () => foodRepo.list(filter),
  })
}

export function useFoodMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: qkRoots.food })

  const create = useMutation({
    mutationFn: (input: NewFoodLog) => foodRepo.create(input),
    onSuccess: () => {
      invalidate()
      toast.success('Meal logged')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not log meal'),
  })

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: FoodLogPatch }) => foodRepo.update(id, patch),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not update meal'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => foodRepo.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Entry deleted')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not delete entry'),
  })

  return { create, update, remove }
}
