import { supabase } from '@/lib/supabase'
import { unwrap, unwrapList, unwrapVoid } from './client'
import type { NewTask, Task, TaskPatch, TaskStatus } from './types'

const TABLE = 'tasks'

export interface TaskFilter {
  status?: TaskStatus | TaskStatus[]
  areaId?: string | null
  goalId?: string
  sprintId?: string
  /** ISO date (yyyy-mm-dd) — tasks due on or before this date. */
  dueOnOrBefore?: string
  /** ISO date — tasks due exactly on this date. */
  dueOn?: string
  search?: string
}

export const tasksRepo = {
  async list(filter: TaskFilter = {}): Promise<Task[]> {
    let query = supabase.from(TABLE).select('*')

    if (filter.status) {
      query = Array.isArray(filter.status)
        ? query.in('status', filter.status)
        : query.eq('status', filter.status)
    }
    if (filter.areaId !== undefined) {
      query = filter.areaId === null ? query.is('area_id', null) : query.eq('area_id', filter.areaId)
    }
    if (filter.goalId) query = query.eq('goal_id', filter.goalId)
    if (filter.sprintId) query = query.eq('sprint_id', filter.sprintId)
    if (filter.dueOn) query = query.eq('due_date', filter.dueOn)
    if (filter.dueOnOrBefore) query = query.lte('due_date', filter.dueOnOrBefore)
    if (filter.search) query = query.ilike('title', `%${filter.search}%`)

    query = query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    return unwrapList<Task>(await query)
  },

  async get(id: string): Promise<Task> {
    return unwrap<Task>(await supabase.from(TABLE).select('*').eq('id', id).single())
  },

  async create(input: NewTask): Promise<Task> {
    return unwrap<Task>(await supabase.from(TABLE).insert(input).select('*').single())
  },

  async update(id: string, patch: TaskPatch): Promise<Task> {
    return unwrap<Task>(await supabase.from(TABLE).update(patch).eq('id', id).select('*').single())
  },

  /** Toggle/set status, stamping completed_at appropriately. */
  async setStatus(id: string, status: TaskStatus): Promise<Task> {
    const patch: TaskPatch = {
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
    }
    return this.update(id, patch)
  },

  async remove(id: string): Promise<void> {
    unwrapVoid(await supabase.from(TABLE).delete().eq('id', id))
  },
}
