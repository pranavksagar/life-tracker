/**
 * Date helpers. The app stores calendar dates as ISO `yyyy-mm-dd` strings in
 * the user's *local* sense of "day" — these helpers avoid the classic UTC
 * off-by-one by formatting from local components.
 */
import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfWeek,
} from 'date-fns'

/** Local calendar date as yyyy-mm-dd (no timezone shift). */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Today as yyyy-mm-dd. */
export function todayISO(): string {
  return toISODate(new Date())
}

/** Parse an ISO date safely; returns null for missing/invalid input. */
export function parseISODate(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = parseISO(value)
  return isValid(d) ? d : null
}

/** Format an ISO date for display, with a fallback for bad/missing values. */
export function formatDate(value: string | null | undefined, pattern = 'MMM d, yyyy'): string {
  const d = parseISODate(value)
  return d ? format(d, pattern) : '—'
}

/** Human relative label for a due date: "Today", "Tomorrow", "Overdue", etc. */
export function relativeDueLabel(value: string | null | undefined, today = new Date()): string {
  const d = parseISODate(value)
  if (!d) return ''
  const diff = differenceInCalendarDays(d, today)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff <= 7) return `In ${diff}d`
  return format(d, 'MMM d')
}

export { addDays, differenceInCalendarDays, startOfWeek, endOfWeek }
