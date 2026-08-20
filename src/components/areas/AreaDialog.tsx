import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Area } from '@/data'
import { useAreaMutations } from '@/hooks/useAreas'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b',
]

export function AreaDialog({
  open,
  onOpenChange,
  area,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  area?: Area
}) {
  const { create, update } = useAreaMutations()
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[5])

  useEffect(() => {
    if (open) {
      setName(area?.name ?? '')
      setColor(area?.color ?? PRESET_COLORS[5])
    }
  }, [open, area])

  async function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      if (area) {
        await update.mutateAsync({ id: area.id, patch: { name: trimmed, color } })
      } else {
        await create.mutateAsync({ name: trimmed, color })
        if (typeof pendo !== 'undefined') {
          pendo.track('area_created', {
            color,
          })
        }
      }
      onOpenChange(false)
    } catch {
      /* toast handled in hook */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{area ? 'Edit area' : 'New area'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="area-name">Name</Label>
            <Input
              id="area-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Health"
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'size-7 rounded-full border-2 transition',
                    color === c ? 'border-foreground' : 'border-transparent',
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim() || create.isPending || update.isPending}>
            {(create.isPending || update.isPending) && <Loader2 className="size-4 animate-spin" />}
            {area ? 'Save' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
