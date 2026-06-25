import type { Priority, TaskStatus } from '@/data'

export const priorityMeta: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'text-muted-foreground' },
  medium: { label: 'Medium', className: 'text-chart-1' },
  high: { label: 'High', className: 'text-destructive' },
}

export const statusMeta: Record<TaskStatus, { label: string }> = {
  todo: { label: 'To do' },
  doing: { label: 'Doing' },
  done: { label: 'Done' },
}

export const PRIORITIES: Priority[] = ['low', 'medium', 'high']
export const STATUSES: TaskStatus[] = ['todo', 'doing', 'done']

/** Parse a comma/space separated tag string into a clean array. */
export function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(/[,\n]/)
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  )
}
