import { Check, Download as DownloadIcon, Share } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { PageHeader } from '@/components/common/PageHeader'
import { AreaManager } from '@/components/areas/AreaManager'
import { DataBackup } from '@/components/settings/DataBackup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { canInstall, installed, promptInstall } = useInstallPrompt()
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaManager />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data backup</CardTitle>
        </CardHeader>
        <CardContent>
          <DataBackup />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Install app</CardTitle>
        </CardHeader>
        <CardContent>
          {installed ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Check className="size-4 text-green-600" /> Installed — running as an app.
            </p>
          ) : canInstall ? (
            <Button variant="outline" onClick={promptInstall}>
              <DownloadIcon className="size-4" /> Add to home screen
            </Button>
          ) : isIOS ? (
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              Tap <Share className="size-4" /> then “Add to Home Screen” to install.
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              Use your browser’s “Install app” option to add Life Tracker to your device.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
