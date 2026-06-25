import type { Task } from '@/data'
import { useAreaMap } from '@/hooks/useAreas'
import { TaskItem } from './TaskItem'

export function TaskList({ tasks }: { tasks: Task[] }) {
  const areaMap = useAreaMap()
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} area={task.area_id ? areaMap.get(task.area_id) : undefined} />
      ))}
    </div>
  )
}
