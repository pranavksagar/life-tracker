import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTasks } from '@/hooks/useTasks'
import { useHabits, useHabitLogs } from '@/hooks/useHabits'
import { useExercise } from '@/hooks/useExercise'
import { useFood } from '@/hooks/useFood'
import {
  exerciseMinutes,
  habitCompletionRate,
  nutritionDaily,
  taskThroughput,
  weeksBetween,
} from '@/lib/analytics'
import { addDays, todayISO } from '@/lib/date'
import { PageHeader } from '@/components/common/PageHeader'
import { ChartCard } from '@/components/progress/ChartCard'
import { AreaSelect } from '@/components/common/AreaSelect'
import { LoadingState } from '@/components/common/states'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const RANGES = { '30': '30 days', '90': '90 days', '365': 'Year' } as const
type RangeKey = keyof typeof RANGES

const axis = { fontSize: 11, stroke: 'var(--muted-foreground)' }
const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--popover-foreground)',
}

export function ProgressPage() {
  const [range, setRange] = useState<RangeKey>('90')
  const [areaId, setAreaId] = useState<string | null>(null)

  const to = todayISO()
  const from = useMemo(() => addDays(new Date(), -(Number(range) - 1)).toISOString().slice(0, 10), [range])
  const weeks = useMemo(() => weeksBetween(from, to), [from, to])

  const tasksQuery = useTasks()
  const habitsQuery = useHabits()
  const logsQuery = useHabitLogs(from, to)
  const exerciseQuery = useExercise({ from, to, areaId: areaId ?? undefined })
  const foodQuery = useFood({ from, to, areaId: areaId ?? undefined })

  const loading =
    tasksQuery.isLoading ||
    habitsQuery.isLoading ||
    logsQuery.isLoading ||
    exerciseQuery.isLoading ||
    foodQuery.isLoading

  const data = useMemo(() => {
    const tasks = (tasksQuery.data ?? []).filter(
      (t) => !areaId || t.area_id === areaId,
    )
    const habits = (habitsQuery.data ?? []).filter((h) => !areaId || h.area_id === areaId)
    const habitIds = new Set(habits.map((h) => h.id))
    const logs = (logsQuery.data ?? []).filter((l) => habitIds.has(l.habit_id))

    return {
      throughput: taskThroughput(tasks, weeks),
      completion: habitCompletionRate(habits, logs, weeks),
      minutes: exerciseMinutes(exerciseQuery.data ?? [], weeks),
      nutrition: nutritionDaily(foodQuery.data ?? [], from, to),
    }
  }, [tasksQuery.data, habitsQuery.data, logsQuery.data, exerciseQuery.data, foodQuery.data, weeks, areaId, from, to])

  return (
    <div className="space-y-5">
      <PageHeader title="Progress" description="How you're trending over time." />

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <TabsList>
            {(Object.keys(RANGES) as RangeKey[]).map((k) => (
              <TabsTrigger key={k} value={k}>
                {RANGES[k]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="w-44">
          <AreaSelect value={areaId} onChange={setAreaId} placeholder="All areas" />
        </div>
      </div>

      {loading ? (
        <LoadingState label="Crunching numbers…" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Habit completion rate" subtitle="% of expected completions per week">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.completion} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={axis} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={axis} tickLine={false} axisLine={false} width={32} unit="%" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Rate']} />
                <Line type="monotone" dataKey="rate" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Task throughput" subtitle="Tasks completed per week">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.throughput} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={axis} tickLine={false} axisLine={false} />
                <YAxis tick={axis} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="completed" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Exercise minutes" subtitle="Total minutes per week">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.minutes} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={axis} tickLine={false} axisLine={false} />
                <YAxis tick={axis} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} min`, 'Minutes']} />
                <Bar dataKey="minutes" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Nutrition" subtitle="Daily calories and protein">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.nutrition} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis tick={axis} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="calories" stroke="var(--chart-3)" strokeWidth={2} dot={false} name="kcal" />
                <Line type="monotone" dataKey="protein" stroke="var(--chart-4)" strokeWidth={2} dot={false} name="protein (g)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  )
}
