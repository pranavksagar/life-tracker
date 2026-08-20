import { useState } from 'react'
import { MoreVertical, Repeat } from 'lucide-react'
import type { Goal, Habit, Task } from '@/data'
import { goalProgress } from '@/data'
import { useGoalMutations } from '@/hooks/useGoals'
import { useAreaMap } from '@/hooks/useAreas'
import { formatDate } from '@/lib/date'
import { GoalDialog } from './GoalDialog'
import { AreaDot } from '@/components/common/AreaDot'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const statusVariant = { active: 'default', completed: 'secondary', dropped: 'outline' } as const

export function GoalCard({ goal, tasks, habits }: { goal: Goal; tasks: Task[]; habits: Habit[] }) {
  const { update, remove } = useGoalMutations()
  const areaMap = useAreaMap()
  const [editing, setEditing] = useState(false)

  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const metricProgress = goalProgress(goal)
  // Fall back to task completion when there's no measurable target.
  const fraction = metricProgress ?? (tasks.length > 0 ? doneTasks / tasks.length : 0)
  const percent = Math.round(fraction * 100)
  const area = goal.area_id ? areaMap.get(goal.area_id) : undefined

  return (
    <Card>
      <CardContent className="space-y-3 pt-5">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {area && <AreaDot color={area.color} />}
              <h3 className="truncate font-semibold">{goal.title}</h3>
              {goal.status !== 'active' && (
                <Badge variant={statusVariant[goal.status]} className="capitalize">
                  {goal.status}
                </Badge>
              )}
            </div>
            {goal.description && (
              <p className="text-muted-foreground mt-0.5 text-sm">{goal.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>Edit</DropdownMenuItem>
              {goal.status !== 'completed' && (
                <DropdownMenuItem
                  onClick={() => {
                    update.mutate({ id: goal.id, patch: { status: 'completed' } })
                    pendo.track('goal_completed', {
                      had_target_value: goal.target_value != null,
                      progress_percent: percent,
                      had_deadline: goal.deadline != null,
                      had_area: goal.area_id != null,
                      linked_task_count: tasks.length,
                    })
                  }}
                >
                  Mark complete
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  if (confirm(`Delete goal "${goal.title}"?`)) remove.mutate(goal.id)
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
            <span>
              {goal.target_value != null
                ? `${goal.current_value}${goal.unit ? ' ' + goal.unit : ''} / ${goal.target_value}${goal.unit ? ' ' + goal.unit : ''}`
                : `${doneTasks}/${tasks.length} tasks done`}
            </span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} />
        </div>

        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {goal.deadline && <span>Due {formatDate(goal.deadline)}</span>}
          {tasks.length > 0 && (
            <span>
              {tasks.length} linked task{tasks.length !== 1 ? 's' : ''}
            </span>
          )}
          {habits.length > 0 && (
            <span className="flex items-center gap-1">
              <Repeat className="size-3" />
              {habits.length} habit{habits.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {(tasks.length > 0 || habits.length > 0) && (
          <ul className="space-y-1 border-t pt-2 text-sm">
            {habits.map((h) => (
              <li key={h.id} className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: h.color }} />
                <span className="text-muted-foreground">{h.name}</span>
              </li>
            ))}
            {tasks.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <span className="text-muted-foreground">{t.status === 'done' ? '✓' : '○'}</span>
                <span className={t.status === 'done' ? 'text-muted-foreground line-through' : ''}>
                  {t.title}
                </span>
              </li>
            ))}
            {tasks.length > 5 && (
              <li className="text-muted-foreground text-xs">+{tasks.length - 5} more</li>
            )}
          </ul>
        )}
      </CardContent>

      {editing && <GoalDialog open={editing} onOpenChange={setEditing} goal={goal} />}
    </Card>
  )
}
