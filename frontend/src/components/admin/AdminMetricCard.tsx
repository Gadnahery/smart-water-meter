import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AdminMetricCardProps {
  label: string
  value: string | number
  sublabel?: string
  trend?: {
    value: number
    label: string
    isPositiveGood?: boolean
  }
  icon?: ReactNode
  className?: string
}

export function AdminMetricCard({
  label,
  value,
  sublabel,
  trend,
  icon,
  className,
}: AdminMetricCardProps) {
  const isUp = trend && trend.value >= 0

  return (
    <Card className={cn('rounded-[18px] border border-border/80 bg-card p-5 card-soft-shadow', className)}>
      <CardContent className="p-0 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {value}
          </div>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-xs font-semibold pt-0.5">
              <span
                className={cn(
                  isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                )}
              >
                {isUp ? '+' : ''}{trend.value}%
              </span>
              <span className="text-muted-foreground font-normal">{trend.label}</span>
            </div>
          )}
        </div>

        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
