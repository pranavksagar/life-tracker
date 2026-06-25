import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { NewTask } from '@/data'
import { useTaskMutations } from '@/hooks/useTasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/** Single-field fast add. `defaults` lets callers preset due date / area. */
export function QuickAddTask({ defaults }: { defaults?: Partial<NewTask> }) {
  const { create } = useTaskMutations()
  const [title, setTitle] = useState('')

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    create.mutate({ title: trimmed, ...defaults })
    setTitle('')
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="flex items-center gap-2"
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task…"
        className="flex-1"
      />
      <Button type="submit" size="icon" disabled={!title.trim() || create.isPending}>
        <Plus className="size-4" />
      </Button>
    </form>
  )
}
