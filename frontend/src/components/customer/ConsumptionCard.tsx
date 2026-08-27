import { Link } from 'react-router-dom'
import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { formatLitres } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ConsumptionCardProps {
  totalLitres?: number
  trendPct?: number // negative means lower/better
  statusText?: string
  chartData?: { val: number }[]
  periodLabel?: string
  className?: string
}

export function ConsumptionCard({
  totalLitres = 1250,
  trendPct = -8,
  statusText = 'Within normal range',
  chartData = [
    { val: 120 },
    { val: 145 },
    { val: 110 },
    { val: 160 },
    { val: 135 },
    { val: 125 },
    { val: 140 },
  ],
  periodLabel = 'this week',
  className,
}: ConsumptionCardProps) {
  const isDecrease = trendPct <= 0

  return (
    <Link to="/usage" className="block group">
      <Card
        className={cn(
          'rounded-[24px] border border-border/80 bg-card p-5 sm:p-6 card-soft-shadow card-soft-shadow-hover transition-all',
          className,
        )}
      >
        <CardContent className="p-0 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <span>Water consumption</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
            </div>
            <span className="text-xs text-muted-foreground font-medium capitalize">
              {periodLabel}
            </span>
          </div>

          {/* Big number + Mini chart row */}
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {formatLitres(totalLitres)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {statusText}
                </span>
                <span className="text-xs text-muted-foreground/50">·</span>
                <div
                  className={cn(
                    'inline-flex items-center gap-0.5 text-xs font-bold rounded-md px-1.5 py-0.5',
                    isDecrease
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
                  )}
                >
                  {isDecrease ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  <span>
                    {Math.abs(trendPct)}% vs last week
                  </span>
                </div>
              </div>
            </div>

            {/* Subtle mini sparkline */}
            <div className="h-14 w-28 sm:w-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                  <defs>
                    <linearGradient id="consumGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="url(#consumGrad)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
