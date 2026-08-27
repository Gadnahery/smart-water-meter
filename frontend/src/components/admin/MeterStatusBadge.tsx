import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MeterStatusBadgeProps {
  status: 'online' | 'offline' | 'maintenance' | 'fault' | string
  className?: string
}

export function MeterStatusBadge({ status, className }: MeterStatusBadgeProps) {
  const norm = status.toLowerCase()

  if (norm === 'online') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-[10px]',
          className,
        )}
      >
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Online
      </Badge>
    )
  }

  if (norm === 'offline') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300 font-semibold text-[10px]',
          className,
        )}
      >
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
        Offline
      </Badge>
    )
  }

  if (norm === 'maintenance') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-semibold text-[10px]',
          className,
        )}
      >
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
        Maintenance
      </Badge>
    )
  }

  return (
    <Badge
      variant="destructive"
      className={cn('font-semibold text-[10px]', className)}
    >
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white animate-ping" />
      Fault
    </Badge>
  )
}
