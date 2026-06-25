import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Dumbbell, UtensilsCrossed } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useExercise } from '@/hooks/useExercise'
import { useFood } from '@/hooks/useFood'
import { toISODate, todayISO } from '@/lib/date'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
import { TaskList } from '@/components/tasks/TaskList'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function CalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState(todayISO())

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const from = toISODate(gridStart)
  const to = toISODate(gridEnd)

  const tasksQuery = useTasks()
  const exerciseQuery = useExercise({ from, to })
  const foodQuery = useFood({ from, to })

  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd])

  const byDay = useMemo(() => {
    const map = new Map<string, { tasks: number; exercise: number; food: number }>()
    const bump = (d: string, key: 'tasks' | 'exercise' | 'food') => {
      const cur = map.get(d) ?? { tasks: 0, exercise: 0, food: 0 }
      cur[key] += 1
      map.set(d, cur)
    }
    for (const t of tasksQuery.data ?? []) if (t.due_date) bump(t.due_date, 'tasks')
    for (const e of exerciseQuery.data ?? []) bump(e.date, 'exercise')
    for (const f of foodQuery.data ?? []) bump(f.date, 'food')
    return map
  }, [tasksQuery.data, exerciseQuery.data, foodQuery.data])

  const selectedTasks = (tasksQuery.data ?? []).filter((t) => t.due_date === selected)
  const selectedExercise = (exerciseQuery.data ?? []).filter((e) => e.date === selected)
  const selectedFood = (foodQuery.data ?? []).filter((f) => f.date === selected)
  const today = todayISO()

  return (
    <div className="space-y-5">
      <PageHeader title="Calendar" />

      <Card>
        <CardContent className="pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{format(month, 'MMMM yyyy')}</h2>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="size-8" onClick={() => setMonth(addMonths(month, -1))}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setMonth(startOfMonth(new Date()))}>
                Today
              </Button>
              <Button variant="outline" size="icon" className="size-8" onClick={() => setMonth(addMonths(month, 1))}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-muted-foreground pb-1 text-center text-xs font-medium">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const iso = toISODate(day)
              const info = byDay.get(iso)
              const inMonth = isSameMonth(day, month)
              const isSelected = iso === selected
              const isToday = iso === today
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelected(iso)}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-start rounded-md border p-1 text-xs transition-colors',
                    inMonth ? 'bg-card' : 'bg-muted/30 text-muted-foreground',
                    isSelected && 'ring-primary ring-2',
                    isToday && !isSelected && 'border-primary',
                  )}
                >
                  <span className={cn('font-medium', isToday && 'text-primary')}>{format(day, 'd')}</span>
                  <div className="mt-auto flex items-center gap-0.5">
                    {info?.tasks ? <span className="bg-chart-1 size-1.5 rounded-full" /> : null}
                    {info?.exercise ? <span className="bg-chart-2 size-1.5 rounded-full" /> : null}
                    {info?.food ? <span className="bg-chart-3 size-1.5 rounded-full" /> : null}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">{format(new Date(selected + 'T00:00:00'), 'EEEE, MMMM d')}</h2>

        {selectedTasks.length > 0 ? (
          <TaskList tasks={selectedTasks} />
        ) : (
          <p className="text-muted-foreground text-sm">No tasks due.</p>
        )}

        {selectedExercise.map((e) => (
          <div key={e.id} className="bg-card flex items-center gap-2 rounded-lg border p-3 text-sm">
            <Dumbbell className="text-chart-2 size-4" />
            <span className="font-medium">{e.type}</span>
            <span className="text-muted-foreground">
              {e.duration_min} min{e.calories != null ? ` · ${e.calories} kcal` : ''}
            </span>
          </div>
        ))}
        {selectedFood.map((f) => (
          <div key={f.id} className="bg-card flex items-center gap-2 rounded-lg border p-3 text-sm">
            <UtensilsCrossed className="text-chart-3 size-4" />
            <span className="font-medium capitalize">{f.meal}</span>
            <span className="text-muted-foreground">
              {f.name}
              {f.calories != null ? ` · ${f.calories} kcal` : ''}
            </span>
          </div>
        ))}
      </section>
    </div>
  )
}
