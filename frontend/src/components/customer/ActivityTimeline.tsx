import { format, isToday, isYesterday } from 'date-fns'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Droplets,
  Receipt,
  Waves,
  WifiOff,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface ActivityEvent {
  id: string
  title: string
  description?: string
  timestamp: Date | string
  type: 'session_started' | 'session_completed' | 'consumed' | 'payment' | 'bill' | 'leak' | 'meter_offline' | 'valve' | 'token_activated' | 'general'
  badge?: string
}

interface ActivityTimelineProps {
  events: ActivityEvent[]
  className?: string
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground">
        No recorded activity yet.
      </div>
    )
  }

  // Group events by day
  const grouped = events.reduce((acc, event) => {
    const d = new Date(event.timestamp)
    let key = format(d, 'MMMM d, yyyy')
    if (isToday(d)) key = 'Today'
    else if (isYesterday(d)) key = 'Yesterday'

    if (!acc[key]) acc[key] = []
    acc[key].push(event)
    return acc
  }, {} as Record<string, ActivityEvent[]>)

  function getIconInfo(type: ActivityEvent['type']) {
    switch (type) {
      case 'session_started':
      case 'token_activated':
        return {
          icon: Waves,
          color: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
        }
      case 'consumed':
        return {
          icon: Droplets,
          color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
        }
      case 'session_completed':
        return {
          icon: CheckCircle2,
          color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
        }
      case 'payment':
      case 'bill':
        return {
          icon: Receipt,
          color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
        }
      case 'leak':
        return {
          icon: AlertTriangle,
          color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
        }
      case 'meter_offline':
        return {
          icon: WifiOff,
          color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
        }
      default:
        return {
          icon: Bell,
          color: 'bg-secondary text-muted-foreground',
        }
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {Object.entries(grouped).map(([dayLabel, dayEvents]) => (
        <div key={dayLabel} className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            {dayLabel}
          </span>

          <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/70">
            {dayEvents.map((evt) => {
              const { icon: Icon, color } = getIconInfo(evt.type)
              const timeStr = format(new Date(evt.timestamp), 'h:mm a')

              return (
                <div key={evt.id} className="relative flex items-start gap-3 group">
                  {/* Timeline dot/icon */}
                  <div
                    className={cn(
                      'absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card font-bold text-xs ring-4 ring-card',
                      color,
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </div>

                  {/* Content card */}
                  <div className="flex-1 rounded-2xl border border-border/70 bg-card p-3.5 card-soft-shadow card-soft-shadow-hover transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground">
                            {evt.title}
                          </h4>
                          {evt.badge && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {evt.badge}
                            </Badge>
                          )}
                        </div>
                        {evt.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {evt.description}
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                        {timeStr}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
