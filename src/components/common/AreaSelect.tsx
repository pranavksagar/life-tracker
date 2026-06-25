import { useAreas } from '@/hooks/useAreas'
import { AreaDot } from './AreaDot'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const NONE = '__none__'

/** A reusable area picker. Uses a sentinel for the "no area" option. */
export function AreaSelect({
  value,
  onChange,
  placeholder = 'No area',
}: {
  value: string | null
  onChange: (areaId: string | null) => void
  placeholder?: string
}) {
  const { data: areas } = useAreas()

  return (
    <Select
      value={value ?? NONE}
      onValueChange={(v) => onChange(v === NONE ? null : v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>{placeholder}</SelectItem>
        {(areas ?? []).map((area) => (
          <SelectItem key={area.id} value={area.id}>
            <span className="flex items-center gap-2">
              <AreaDot color={area.color} />
              {area.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
