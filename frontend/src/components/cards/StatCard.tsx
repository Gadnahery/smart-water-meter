import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'destructive'
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
}

export function StatCard({ label, value, sub, icon, tone = 'default' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', toneClasses[tone])}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}
