import { useMemo } from 'react'
import { addDays, startOfWeek } from 'date-fns'
import { toISODate, todayISO } from '@/lib/date'
import { cn } from '@/lib/utils'

/**
 * GitHub-style completion grid: one column per week (Mon–Sun), most recent on
 * the right. Completed days use the habit color; future days are blank.
 */
export function HabitGrid({
  color,
  completed,
  weeks = 13,
  onToggle,
}: {
  color: string
  completed: Set<string>
  weeks?: number
  onToggle?: (date: string) => void
}) {
  const today = todayISO()
  const columns = useMemo(() => {
    const start = addDays(startOfWeek(new Date(today + 'T00:00:00'), { weekStartsOn: 1 }), -(weeks - 1) * 7)
    return Array.from({ length: weeks }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => toISODate(addDays(start, w * 7 + d))),
    )
  }, [today, weeks])

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {columns.map((week, i) => (
        <div key={i} className="flex flex-col gap-1">
          {week.map((iso) => {
            const isFuture = iso > today
            const isDone = completed.has(iso)
            const cell = (
              <div
                className={cn(
                  'size-3 rounded-[3px]',
                  isFuture ? 'bg-transparent' : isDone ? '' : 'bg-muted',
                )}
                style={isDone ? { backgroundColor: color } : undefined}
                title={iso}
              />
            )
            if (isFuture || !onToggle) return <div key={iso}>{cell}</div>
            return (
              <button
                key={iso}
                type="button"
                aria-label={`Toggle ${iso}`}
                onClick={() => onToggle(iso)}
                className="rounded-[3px] focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
              >
                {cell}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
