import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { habitsRepo } from '@/data'
import type { HabitPatch, NewHabit } from '@/data'
import { qk, qkRoots } from '@/lib/query-keys'

export function useHabits(options?: { includeArchived?: boolean }) {
  return useQuery({
    queryKey: [...qk.habits, options?.includeArchived ?? false],
    queryFn: () => habitsRepo.list(options),
  })
}

export function useHabitLogs(from: string, to: string, habitId?: string) {
  return useQuery({
    queryKey: qk.habitLogs(from, to, habitId),
    queryFn: () => habitsRepo.logs(from, to, habitId),
  })
}

export function useHabitMutations() {
  const queryClient = useQueryClient()
  const invalidateHabits = () => queryClient.invalidateQueries({ queryKey: qk.habits })
  const invalidateLogs = () => queryClient.invalidateQueries({ queryKey: qkRoots.habitLogs })

  const create = useMutation({
    mutationFn: (input: NewHabit) => habitsRepo.create(input),
    onSuccess: (data) => {
      invalidateHabits()
      toast.success('Habit created')
      pendo.track('habit_created', {
        cadence: data.cadence,
        target_count: data.target_count,
        has_area: Boolean(data.area_id),
        color: data.color,
      })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not create habit'),
  })

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: HabitPatch }) => habitsRepo.update(id, patch),
    onSuccess: invalidateHabits,
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not update habit'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => habitsRepo.remove(id),
    onSuccess: () => {
      invalidateHabits()
      invalidateLogs()
      toast.success('Habit deleted')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not delete habit'),
  })

  const toggle = useMutation({
    mutationFn: async ({
      habitId,
      date,
      done,
    }: {
      habitId: string
      date: string
      done: boolean
    }) => {
      if (done) await habitsRepo.logCompletion(habitId, date)
      else await habitsRepo.clearCompletion(habitId, date)
    },
    onSuccess: (_data, variables) => {
      invalidateLogs()
      pendo.track('habit_completion_toggled', {
        done: variables.done,
        date: variables.date,
      })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not update log'),
  })

  return { create, update, remove, toggle }
}
