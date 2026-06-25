import type { PostgrestError } from '@supabase/supabase-js'

/** A normalized error thrown by every repository call so the UI can rely on it. */
export class DataError extends Error {
  readonly code?: string
  readonly cause?: unknown
  constructor(message: string, options?: { code?: string; cause?: unknown }) {
    super(message)
    this.name = 'DataError'
    this.code = options?.code
    this.cause = options?.cause
  }
}

/** Unwrap a Supabase single-row response, throwing a DataError on failure. */
export function unwrap<T>(result: { data: T | null; error: PostgrestError | null }): T {
  if (result.error) throw toDataError(result.error)
  if (result.data === null) {
    throw new DataError('No data returned from the server.')
  }
  return result.data
}

/** Unwrap a Supabase list response, returning [] instead of null. */
export function unwrapList<T>(result: { data: T[] | null; error: PostgrestError | null }): T[] {
  if (result.error) throw toDataError(result.error)
  return result.data ?? []
}

/** Unwrap a write where we don't need the returned row. */
export function unwrapVoid(result: { error: PostgrestError | null }): void {
  if (result.error) throw toDataError(result.error)
}

function toDataError(error: PostgrestError): DataError {
  return new DataError(friendlyMessage(error), { code: error.code, cause: error })
}

function friendlyMessage(error: PostgrestError): string {
  switch (error.code) {
    case '23505':
      return 'That entry already exists.'
    case '23503':
      return 'That action references something that no longer exists.'
    case '42501':
      return 'You do not have permission to do that.'
    case 'PGRST301':
      return 'Your session has expired. Please sign in again.'
    default:
      return error.message || 'Something went wrong talking to the server.'
  }
}
