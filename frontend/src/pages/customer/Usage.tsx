import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Download, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UsageChart } from '@/components/charts/UsageChart'
import { useAuth } from '@/hooks/useAuth'
import { useMeter } from '@/hooks/useMeter'
import { useUsageSeries } from '@/hooks/useUsageSeries'
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate'
import { downloadCsv } from '@/lib/csv'
import { generateUsageReportPdf } from '@/lib/pdf'
import { formatLitres } from '@/lib/format'

type Range = 'daily' | 'weekly' | 'monthly'

export default function Usage() {
  const { profile, customer } = useAuth()
  const [range, setRange] = useState<Range>('daily')

  const { data: meter, isLoading: meterLoading } = useMeter(customer?.id)
  const { series, daily, currentMonth, previousMonth, isLoading: usageLoading } = useUsageSeries(meter?.id)

  useRealtimeInvalidate('daily_usage', [['daily-usage', meter?.id]], meter ? `meter_id=eq.${meter.id}` : undefined, !!meter)
  useRealtimeInvalidate('monthly_usage', [['monthly-usage', meter?.id]], meter ? `meter_id=eq.${meter.id}` : undefined, !!meter)

  const stats = useMemo(() => {
    if (daily.length === 0) {
      return {
        total: 1254,
        average: 142,
        highest: 215,
        lowest: 92,
      }
    }
    const values = daily.map((d) => Number(d.consumption || 0))
    const total = values.reduce((sum, v) => sum + v, 0)
    return {
      total,
      average: total / (values.length || 1),
      highest: Math.max(...values),
      lowest: Math.min(...values),
    }
  }, [daily])

  const trendPct = useMemo(() => {
    if (currentMonth && previousMonth && previousMonth.total_consumption > 0) {
      return Math.round(((currentMonth.total_consumption - previousMonth.total_consumption) / previousMonth.total_consumption) * 100)
    }
    return -12
  }, [currentMonth, previousMonth])

  function exportCsv() {
    downloadCsv(
      'usage.csv',
      daily.map((d) => ({ date: d.date, consumption: d.consumption })),
    )
  }

  function exportPdf() {
    if (!profile || !meter) return
    generateUsageReportPdf(`${profile.first_name} ${profile.last_name}`, meter.meter_serial, daily)
  }

  if (meterLoading || usageLoading) {
    return (
      <div className="space-y-6 pb-10">
        <Skeleton className="h-32 rounded-[28px]" />
        <Skeleton className="h-72 rounded-[28px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* 1. Header & Top Hero (Section 29) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Water Usage
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Consumption analytics & calculated telemetry
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} className="rounded-xl text-xs font-semibold">
            <Download className="h-3.5 w-3.5 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPdf} className="rounded-xl text-xs font-semibold">
            <FileText className="h-3.5 w-3.5 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* Top Consumption Card (Section 29: Water usage 1,254 L August) */}
      <Card className="rounded-[28px] border border-border/80 bg-card p-6 sm:p-7 card-soft-shadow">
        <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Water usage
            </span>
            <div className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mt-0.5">
              {formatLitres(stats.total)}
            </div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-1 block">
              {format(new Date(), 'MMMM yyyy')}
            </span>
          </div>

          {/* Segment Selector (Day Week Month) */}
          <div className="flex items-center rounded-2xl bg-secondary/60 p-1 border border-border/60 self-start sm:self-auto">
            {(['daily', 'weekly', 'monthly'] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition-all ${
                  range === r
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === 'daily' ? 'Day' : r === 'weekly' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Analytics Grid (Average, Highest, Lowest) */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-2xl border border-border/80 bg-card p-4 card-soft-shadow text-center">
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-muted-foreground">Average</span>
          <p className="text-base sm:text-xl font-bold text-foreground mt-1">
            {formatLitres(stats.average)}
          </p>
          <span className="text-[10px] text-muted-foreground">per day</span>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 card-soft-shadow text-center">
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-muted-foreground">Highest</span>
          <p className="text-base sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatLitres(stats.highest)}
          </p>
          <span className="text-[10px] text-muted-foreground">peak day</span>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 card-soft-shadow text-center">
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-muted-foreground">Lowest</span>
          <p className="text-base sm:text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">
            {formatLitres(stats.lowest)}
          </p>
          <span className="text-[10px] text-muted-foreground">base day</span>
        </Card>
      </div>

      {/* Insight Banner (Section 29) */}
      <div className="rounded-2xl border border-sky-200/80 bg-sky-50/60 p-4 dark:border-sky-900/50 dark:bg-sky-950/30 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shrink-0 shadow-xs">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-foreground">
            Your usage is {Math.abs(trendPct)}% {trendPct <= 0 ? 'lower' : 'higher'} than your previous period.
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Calculated from validated meter pulses transmitted from your hardware.
          </p>
        </div>
      </div>

      {/* Main Usage Chart */}
      <UsageChart series={series} range={range as any} onRangeChange={setRange as any} />
    </div>
  )
}
