/**
 * A small recurrence rule stored on tasks as JSONB. Kept intentionally simple
 * (a subset of RRULE) so the data layer and UI stay easy to reason about.
 */
export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly'

export interface Recurrence {
  freq: RecurrenceFreq
  /** Repeat every N units of `freq` (default 1). */
  interval: number
}

export function describeRecurrence(r: Recurrence | null): string {
  if (!r) return 'Does not repeat'
  const unit = r.freq === 'daily' ? 'day' : r.freq === 'weekly' ? 'week' : 'month'
  if (r.interval <= 1) return `Every ${unit}`
  return `Every ${r.interval} ${unit}s`
}
