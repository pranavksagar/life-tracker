import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { DataError } from './client'

export type { Session, User }

export interface Credentials {
  email: string
  password: string
}

/** Auth surface for the app — the UI never touches supabase.auth directly. */
export const authRepo = {
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw new DataError(error.message, { cause: error })
    return data.session
  },

  async signUp({ email, password }: Credentials): Promise<{ needsConfirmation: boolean }> {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw new DataError(error.message, { cause: error })
    // When email confirmation is on, a user is returned but no session yet.
    return { needsConfirmation: Boolean(data.user && !data.session) }
  },

  async signIn({ email, password }: Credentials): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new DataError(error.message, { cause: error })
    return data.session
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new DataError(error.message, { cause: error })
  },

  /** Subscribe to auth changes; returns an unsubscribe function. */
  onChange(callback: (session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
    return () => data.subscription.unsubscribe()
  },
}
