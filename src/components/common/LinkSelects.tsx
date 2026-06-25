import { useGoals } from '@/hooks/useGoals'
import { useSprints } from '@/hooks/useSprints'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const NONE = '__none__'

export function GoalSelect({
  value,
  onChange,
}: {
  value: string | null
  onChange: (goalId: string | null) => void
}) {
  const { data: goals } = useGoals()
  const active = (goals ?? []).filter((g) => g.status === 'active')
  return (
    <Select value={value ?? NONE} onValueChange={(v) => onChange(v === NONE ? null : v)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="No goal" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>No goal</SelectItem>
        {active.map((g) => (
          <SelectItem key={g.id} value={g.id}>
            {g.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function SprintSelect({
  value,
  onChange,
}: {
  value: string | null
  onChange: (sprintId: string | null) => void
}) {
  const { data: sprints } = useSprints()
  return (
    <Select value={value ?? NONE} onValueChange={(v) => onChange(v === NONE ? null : v)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="No sprint" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>No sprint</SelectItem>
        {(sprints ?? []).map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
