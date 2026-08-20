import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { ExerciseLog, Intensity } from '@/data'
import { useExerciseMutations } from '@/hooks/useExercise'
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

function optInt(v: string): number | null {
  const n = Number(v)
  return v.trim() === '' || Number.isNaN(n) ? null : Math.round(n)
}

export function ExerciseDialog({
  open,
  onOpenChange,
  entry,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: ExerciseLog
}) {
  const { create, update } = useExerciseMutations()
  const [type, setType] = useState('')
  const [date, setDate] = useState(todayISO())
  const [duration, setDuration] = useState('30')
  const [intensity, setIntensity] = useState<Intensity>('medium')
  const [calories, setCalories] = useState('')
  const [areaId, setAreaId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setType(entry?.type ?? '')
    setDate(entry?.date ?? todayISO())
    setDuration(String(entry?.duration_min ?? 30))
    setIntensity(entry?.intensity ?? 'medium')
    setCalories(entry?.calories != null ? String(entry.calories) : '')
    setAreaId(entry?.area_id ?? null)
    setNotes(entry?.notes ?? '')
  }, [open, entry])

  async function submit() {
    if (!type.trim()) return
    const payload = {
      type: type.trim(),
      date,
      duration_min: optInt(duration) ?? 0,
      intensity,
      calories: optInt(calories),
      area_id: areaId,
      notes: notes.trim() || null,
    }
    try {
      if (entry) {
        await update.mutateAsync({ id: entry.id, patch: payload })
      } else {
        await create.mutateAsync(payload)
        if (typeof pendo !== 'undefined') {
          pendo.track('exercise_logged', {
            exercise_type: type.trim(),
            duration_min: optInt(duration) ?? 0,
            intensity,
            has_calories: calories.trim() !== '',
            has_area: areaId !== null,
          })
        }
      }
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
          <DialogTitle>{entry ? 'Edit workout' : 'Log workout'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ex-type">Type</Label>
            <Input
              id="ex-type"
              autoFocus
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. Running, Strength, Yoga"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ex-date">Date</Label>
              <Input
                id="ex-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ex-dur">Duration (min)</Label>
              <Input
                id="ex-dur"
                type="number"
                min={0}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Intensity</Label>
              <Select value={intensity} onValueChange={(v) => setIntensity(v as Intensity)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ex-cal">Calories (optional)</Label>
              <Input
                id="ex-cal"
                type="number"
                min={0}
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Area</Label>
            <AreaSelect value={areaId} onChange={setAreaId} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ex-notes">Notes</Label>
            <Textarea
              id="ex-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!type.trim() || busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {entry ? 'Save' : 'Log'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
