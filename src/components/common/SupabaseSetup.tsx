import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/** Shown when env vars are missing, instead of a blank/crashed screen. */
export function SupabaseSetup() {
  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Almost there</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Life Tracker needs your Supabase project to store data.
        </p>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base">Add your Supabase keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Copy <code className="bg-muted rounded px-1 py-0.5">.env.example</code> to{' '}
            <code className="bg-muted rounded px-1 py-0.5">.env.local</code> and set:
          </p>
          <pre className="bg-muted overflow-x-auto rounded-lg p-3 text-xs">
            {`VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...`}
          </pre>
          <p className="text-muted-foreground">
            Find both under <strong>Project Settings → API</strong> in your Supabase dashboard, then
            restart the dev server. See the README for the full walkthrough.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
