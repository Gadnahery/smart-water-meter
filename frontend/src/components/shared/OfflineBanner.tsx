import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()

  if (online) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-sm font-medium text-white">
      <WifiOff className="h-4 w-4" />
      You&apos;re offline — some features may not work until your connection is back.
    </div>
  )
}
