import { BatteryWarning, CheckCircle2, Cpu, SignalLow, WifiOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DeviceHealthCardProps {
  totalMeters?: number
  onlineMeters?: number
  offlineMeters?: number
  lowBatteryMeters?: number
  weakSignalMeters?: number
  className?: string
}

export function DeviceHealthCard({
  totalMeters = 1284,
  onlineMeters = 1142,
  offlineMeters = 94,
  lowBatteryMeters = 12,
  weakSignalMeters = 24,
  className,
}: DeviceHealthCardProps) {
  const onlinePct = totalMeters > 0 ? Math.round((onlineMeters / totalMeters) * 100) : 100

  return (
    <Card className={cn('rounded-[18px] border border-border/80 bg-card card-soft-shadow', className)}>
      <CardHeader className="py-4 px-5 border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Cpu className="h-4 w-4 text-sky-500" />
            Device Health & Telemetry
          </CardTitle>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {onlinePct}% Operational
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Fleet health bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Online Fleet Ratio</span>
            <span className="font-bold text-foreground">{onlineMeters} / {totalMeters} Meters</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${onlinePct}%` }}
            />
          </div>
        </div>

        {/* 4 Health Indicators */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
          <div className="flex items-center gap-2.5 rounded-xl border border-border/60 p-2.5 bg-secondary/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Online Fleet</span>
              <span className="font-bold text-foreground">{onlineMeters} active</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-border/60 p-2.5 bg-secondary/20">
            <WifiOff className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Offline</span>
              <span className="font-bold text-foreground">{offlineMeters} units</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-border/60 p-2.5 bg-secondary/20">
            <BatteryWarning className="h-4 w-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Low Battery</span>
              <span className="font-bold text-foreground">{lowBatteryMeters} alerts</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-border/60 p-2.5 bg-secondary/20">
            <SignalLow className="h-4 w-4 text-sky-500 shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Weak Signal</span>
              <span className="font-bold text-foreground">{weakSignalMeters} units</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
