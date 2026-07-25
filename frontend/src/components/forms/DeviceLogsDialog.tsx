import { format } from 'date-fns'
import { ScrollText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/empty/EmptyState'
import { useDeviceLogs } from '@/hooks/useAdminDeviceLogs'

const levelTone: Record<string, 'secondary' | 'outline' | 'destructive'> = {
  INFO: 'secondary',
  DEBUG: 'outline',
  WARNING: 'outline',
  ERROR: 'destructive',
}

export function DeviceLogsDialog({
  open,
  onOpenChange,
  meterId,
  meterSerial,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  meterId: string | null
  meterSerial?: string
}) {
  const { data: logs = [], isLoading } = useDeviceLogs(meterId ?? undefined)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Device logs — {meterSerial}</DialogTitle>
          <DialogDescription>Most recent 50 events reported by the device firmware.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No logs yet"
            description="Events from the ESP32 firmware (boot, Wi-Fi, valve commands, errors) will appear here."
          />
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                <Badge variant={levelTone[log.log_level] ?? 'secondary'} className="mt-0.5 shrink-0">
                  {log.log_level}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{log.message}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(log.created_at), 'MMM d, yyyy, h:mm:ss a')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
