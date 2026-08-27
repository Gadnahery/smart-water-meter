import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface WaterSafetyCardProps {
  status?: 'no_leak' | 'leak_detected' | 'monitoring' | 'checking'
  lastUpdated?: string
  currentFlow?: number
  className?: string
}

export function WaterSafetyCard({
  status = 'no_leak',
  lastUpdated = 'Just now',
  currentFlow,
  className,
}: WaterSafetyCardProps) {
  const isLeak = status === 'leak_detected'
  const isChecking = status === 'checking'

  const statusText = {
    no_leak: 'No leak',
    leak_detected: 'Leak detected',
    monitoring: 'Monitoring',
    checking: 'Checking...',
  }[status]

  return (
    <Link to="/activity" className="block flex-1 group">
      <Card
        className={cn(
          'rounded-[24px] border border-border/80 bg-card p-4 sm:p-5 card-soft-shadow card-soft-shadow-hover transition-all',
          isLeak && 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20',
          className,
        )}
      >
        <CardContent className="p-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105',
                isLeak
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
              )}
            >
              {isLeak ? (
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Water Safety
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    'text-sm font-bold text-foreground',
                    isLeak && 'text-rose-600 dark:text-rose-400',
                  )}
                >
                  {statusText}
                </span>
                {!isLeak && !isChecking && (
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isLeak && currentFlow
                  ? `${currentFlow} L/min continuous`
                  : `Updated ${lastUpdated}`}
              </p>
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  )
}
