import { Link } from 'react-router-dom'
import { ChevronRight, Gauge, Wifi, WifiOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MeterStatusCardProps {
  status?: 'online' | 'offline' | 'connecting' | 'maintenance'
  meterSerial?: string
  wifiSignal?: number | null
  batteryLevel?: number | null
  lastSeenText?: string
  className?: string
}

export function MeterStatusCard({
  status = 'online',
  meterSerial = 'SWM-000124',
  wifiSignal,
  batteryLevel,
  lastSeenText = 'Active now',
  className,
}: MeterStatusCardProps) {
  const isOnline = status === 'online'

  const statusLabel = {
    online: 'Online',
    offline: 'Offline',
    connecting: 'Connecting',
    maintenance: 'Maintenance',
  }[status]

  return (
    <Link to="/profile" className="block flex-1 group">
      <Card
        className={cn(
          'rounded-[24px] border border-border/80 bg-card p-4 sm:p-5 card-soft-shadow card-soft-shadow-hover transition-all',
          !isOnline && 'border-amber-300/80 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20',
          className,
        )}
      >
        <CardContent className="p-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105',
                isOnline
                  ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
              )}
            >
              <Gauge className="h-5 w-5" />
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Meter {meterSerial}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-foreground">
                  {statusLabel}
                </span>
                <span
                  className={cn(
                    'inline-block h-2 w-2 rounded-full',
                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500',
                  )}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 text-sky-500" />
                    <span>{wifiSignal != null ? `${wifiSignal} dBm` : 'Connected'}</span>
                    {batteryLevel != null && <span>· {batteryLevel}%</span>}
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-amber-500" />
                    <span>{lastSeenText}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  )
}
