/** Central registry of React Query cache keys for consistent invalidation. */
export const qk = {
  areas: ['areas'] as const,
  tasks: (filter?: unknown) => ['tasks', filter ?? null] as const,
  task: (id: string) => ['task', id] as const,
  habits: ['habits'] as const,
  habitLogs: (from: string, to: string, habitId?: string) =>
    ['habit-logs', from, to, habitId ?? null] as const,
  exercise: (filter?: unknown) => ['exercise', filter ?? null] as const,
  food: (filter?: unknown) => ['food', filter ?? null] as const,
  goals: (filter?: unknown) => ['goals', filter ?? null] as const,
  goal: (id: string) => ['goal', id] as const,
  sprints: ['sprints'] as const,
  sprint: (id: string) => ['sprint', id] as const,
  currentSprint: ['sprint', 'current'] as const,
}

/** Prefixes to invalidate broadly after a write touches multiple views. */
export const qkRoots = {
  tasks: ['tasks'],
  habitLogs: ['habit-logs'],
  exercise: ['exercise'],
  food: ['food'],
  goals: ['goals'],
}
