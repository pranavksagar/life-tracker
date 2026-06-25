import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authRepo, type Credentials, type Session, type User } from '@/data/auth'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (creds: Credentials) => Promise<void>
  signUp: (creds: Credentials) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    authRepo
      .getSession()
      .then((s) => {
        if (active) setSession(s)
      })
      .catch(() => {
        // No/expired session — treated as logged out.
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    // Reacts to sign-in, sign-out, token refresh, and expiry across tabs.
    const unsubscribe = authRepo.onChange((s) => {
      if (!active) return
      setSession((prev) => {
        // On logout, drop all cached per-user data.
        if (prev && !s) queryClient.clear()
        return s
      })
      setLoading(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: async (creds) => {
        await authRepo.signIn(creds)
      },
      signUp: (creds) => authRepo.signUp(creds),
      signOut: async () => {
        await authRepo.signOut()
        queryClient.clear()
      },
    }),
    [session, loading, queryClient],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
