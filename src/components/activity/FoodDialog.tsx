import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { FoodLog, Meal } from '@/data'
import { useFoodMutations } from '@/hooks/useFood'
import { todayISO } from '@/lib/date'
import { AreaSelect } from '@/components/common/AreaSelect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function optNum(v: string): number | null {
  const n = Number(v)
  return v.trim() === '' || Number.isNaN(n) ? null : n
}

export function FoodDialog({
  open,
  onOpenChange,
  entry,
  defaultMeal,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: FoodLog
  defaultMeal?: Meal
}) {
  const { create, update } = useFoodMutations()
  const [meal, setMeal] = useState<Meal>('snack')
  const [name, setName] = useState('')
  const [date, setDate] = useState(todayISO())
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [areaId, setAreaId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setMeal(entry?.meal ?? defaultMeal ?? mealForNow())
    setName(entry?.name ?? '')
    setDate(entry?.date ?? todayISO())
    setCalories(entry?.calories != null ? String(entry.calories) : '')
    setProtein(entry?.protein != null ? String(entry.protein) : '')
    setCarbs(entry?.carbs != null ? String(entry.carbs) : '')
    setFat(entry?.fat != null ? String(entry.fat) : '')
    setAreaId(entry?.area_id ?? null)
    setNotes(entry?.notes ?? '')
  }, [open, entry, defaultMeal])

  async function submit() {
    if (!name.trim()) return
    const payload = {
      meal,
      name: name.trim(),
      date,
      calories: optNum(calories) != null ? Math.round(optNum(calories)!) : null,
      protein: optNum(protein),
      carbs: optNum(carbs),
      fat: optNum(fat),
      area_id: areaId,
      notes: notes.trim() || null,
    }
    try {
      if (entry) await update.mutateAsync({ id: entry.id, patch: payload })
      else await create.mutateAsync(payload)
      onOpenChange(false)
    } catch {
      /* toast handled in hook */
    }
  }

  const busy = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit meal' : 'Log meal'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Meal</Label>
              <Select value={meal} onValueChange={(v) => setMeal(v as Meal)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="food-date">Date</Label>
              <Input id="food-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="food-name">What did you eat?</Label>
            <Input
              id="food-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken rice bowl"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Nutrition (all optional)</Label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              <NumField id="kcal" label="kcal" value={calories} onChange={setCalories} />
              <NumField id="p" label="Protein" value={protein} onChange={setProtein} />
              <NumField id="c" label="Carbs" value={carbs} onChange={setCarbs} />
              <NumField id="f" label="Fat" value={fat} onChange={setFat} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Area</Label>
            <AreaSelect value={areaId} onChange={setAreaId} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="food-notes">Notes</Label>
            <Textarea id="food-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim() || busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {entry ? 'Save' : 'Log'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NumField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-muted-foreground text-[11px]">
        {label}
      </Label>
      <Input id={id} type="number" min={0} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function mealForNow(): Meal {
  const h = new Date().getHours()
  if (h < 11) return 'breakfast'
  if (h < 15) return 'lunch'
  if (h < 21) return 'dinner'
  return 'snack'
}
