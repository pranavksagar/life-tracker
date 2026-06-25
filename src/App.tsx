import { BrowserRouter } from 'react-router-dom'
import { isSupabaseConfigured } from '@/lib/env'
import { AuthProvider } from '@/hooks/useAuth'
import { SupabaseSetup } from '@/components/common/SupabaseSetup'
import { AppRoutes } from './routes'

export default function App() {
  // If env vars are missing, show a friendly setup screen instead of crashing.
  if (!isSupabaseConfigured) return <SupabaseSetup />

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
