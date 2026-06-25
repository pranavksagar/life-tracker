/**
 * Centralised, validated access to build-time environment variables.
 * Vite only exposes vars prefixed with VITE_ to the client bundle.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  // Don't crash the whole app — the UI surfaces a friendly setup screen instead.
  console.warn(
    '[life-tracker] Supabase is not configured. Copy .env.example to .env.local and set ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

export const env = {
  supabaseUrl: url ?? '',
  supabaseAnonKey: anonKey ?? '',
}
