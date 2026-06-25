import { useMemo, useState } from 'react'
import { Flame, MoreVertical } from 'lucide-react'
import type { Habit, HabitLog } from '@/data'
import { useHabitMutations } from '@/hooks/useHabits'
import { cadenceLabel, countsByDate, currentStreak } from '@/lib/habit-stats'
import { todayISO } from '@/lib/date'
import { HabitGrid } from './HabitGrid'
import { HabitDialog } from './HabitDialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function HabitCard({ habit, logs }: { habit: Habit; logs: HabitLog[] }) {
  const { toggle, remove } = useHabitMutations()
  const [editing, setEditing] = useState(false)
  const today = todayISO()

  const completed = useMemo(() => {
    const counts = countsByDate(logs)
    return new Set([...counts.entries()].filter(([, c]) => c > 0).map(([d]) => d))
  }, [logs])

  const streak = useMemo(() => currentStreak(habit, logs), [habit, logs])
  const doneToday = completed.has(today)

  return (
    <Card>
      <CardContent className="space-y-3 pt-5">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={doneToday}
            onCheckedChange={(c) => toggle.mutate({ habitId: habit.id, date: today, done: Boolean(c) })}
            className="mt-0.5"
            aria-label={`Mark ${habit.name} done today`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} />
              <span className="truncate font-medium">{habit.name}</span>
            </div>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
              <span>{cadenceLabel(habit)}</span>
              {streak.value > 0 && (
                <span className="text-foreground flex items-center gap-1 font-medium">
                  <Flame className="size-3 text-orange-500" />
                  {streak.value} {streak.unit}
                  {streak.value !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  if (confirm(`Delete habit "${habit.name}" and its history?`)) remove.mutate(habit.id)
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <HabitGrid
          color={habit.color}
          completed={completed}
          onToggle={(date) =>
            toggle.mutate({ habitId: habit.id, date, done: !completed.has(date) })
          }
        />
      </CardContent>

      {editing && <HabitDialog open={editing} onOpenChange={setEditing} habit={habit} />}
    </Card>
  )
}
