import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'sonner'
import { WifiOff } from 'lucide-react'

/**
 * Headless-ish PWA helper: prompts to reload when a new version is ready, and
 * shows a small offline banner so the user knows changes will sync later.
 */
export function PwaStatus() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  useEffect(() => {
    if (!needRefresh) return
    toast('A new version is available', {
      duration: Infinity,
      action: {
        label: 'Reload',
        onClick: () => updateServiceWorker(true),
      },
      onDismiss: () => setNeedRefresh(false),
    })
  }, [needRefresh, setNeedRefresh, updateServiceWorker])

  if (!offline) return null
  return (
    <div className="bg-warning/15 text-foreground pb-safe fixed inset-x-0 bottom-16 z-30 flex items-center justify-center gap-2 py-1.5 text-xs md:bottom-0">
      <WifiOff className="size-3.5" />
      Offline — changes will sync when you reconnect.
    </div>
  )
}
