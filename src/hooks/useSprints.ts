import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sprintsRepo } from '@/data'
import type { NewSprint, SprintPatch } from '@/data'
import { qk } from '@/lib/query-keys'

export function useSprints() {
  return useQuery({ queryKey: qk.sprints, queryFn: () => sprintsRepo.list() })
}

export function useCurrentSprint() {
  return useQuery({ queryKey: qk.currentSprint, queryFn: () => sprintsRepo.current() })
}

export function useSprintMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: qk.sprints })
    queryClient.invalidateQueries({ queryKey: qk.currentSprint })
  }

  const create = useMutation({
    mutationFn: (input: NewSprint) => sprintsRepo.create(input),
    onSuccess: (data) => {
      invalidate()
      toast.success('Sprint created')
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      const durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      pendo.track('sprint_created', {
        duration_days: durationDays,
        has_capacity: data.capacity != null,
        capacity: data.capacity ?? 0,
        status: data.status,
      })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not create sprint'),
  })

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: SprintPatch }) =>
      sprintsRepo.update(id, patch),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not update sprint'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => sprintsRepo.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Sprint deleted')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not delete sprint'),
  })

  return { create, update, remove }
}
