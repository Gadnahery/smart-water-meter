import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Droplet, Gauge, TrendingDown, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/cards/StatCard'
import { UsageChart } from '@/components/charts/UsageChart'
import { useAuth } from '@/hooks/useAuth'
import { useMeter } from '@/hooks/useMeter'
import { useUsageSeries } from '@/hooks/useUsageSeries'
import { fetchSettings } from '@/services/adminSettings'
import { downloadCsv } from '@/lib/csv'

type Range = 'daily' | 'weekly' | 'monthly' | 'yearly'

export default function Usage() {
  const { customer } = useAuth()
  const [range, setRange] = useState<Range>('daily')

  const { data: meter, isLoading: meterLoading } = useMeter(customer?.id)
  const { series, daily, currentMonth, previousMonth, isLoading: usageLoading } = useUsageSeries(meter?.id)
  const { data: settings } = useQuery({ queryKey: ['public-settings'], queryFn: fetchSettings })

  const stats = useMemo(() => {
    if (daily.length === 0) return null
    const values = daily.map((d) => Number(d.consumption))
    return {
      average: values.reduce((sum, v) => sum + v, 0) / values.length,
      highest: Math.max(...values),
      lowest: Math.min(...values),
    }
  }, [daily])

  const trendPct =
    currentMonth && previousMonth && previousMonth.total_consumption > 0
      ? ((currentMonth.total_consumption - previousMonth.total_consumption) / previousMonth.total_consumption) * 100
      : null

  const estimatedBill = currentMonth && settings ? currentMonth.total_consumption * settings.water_tariff : null

  function exportCsv() {
    downloadCsv(
      'usage.csv',
      daily.map((d) => ({ date: d.date, consumption: d.consumption })),
    )
  }

  if (meterLoading || usageLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Water usage</h1>
          <p className="text-sm text-muted-foreground">Detailed consumption analytics for your meter</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={daily.length === 0}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Avg. daily usage"
          value={stats ? `${stats.average.toFixed(1)} m³` : '—'}
          icon={<Droplet className="h-5 w-5" />}
        />
        <StatCard
          label="Highest day"
          value={stats ? `${stats.highest.toFixed(1)} m³` : '—'}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Lowest day"
          value={stats ? `${stats.lowest.toFixed(1)} m³` : '—'}
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          label="Est. this month's bill"
          value={estimatedBill != null ? `$${estimatedBill.toFixed(2)}` : '—'}
          icon={<Gauge className="h-5 w-5" />}
        />
      </div>

      <UsageChart series={series} range={range} onRangeChange={setRange} />

      {trendPct != null && (
        <p className="text-sm text-muted-foreground">
          Consumption is{' '}
          <span className={trendPct >= 0 ? 'font-medium text-warning' : 'font-medium text-success'}>
            {trendPct >= 0 ? 'up' : 'down'} {Math.abs(trendPct).toFixed(0)}%
          </span>{' '}
          compared to last month.
        </p>
      )}
    </div>
  )
}
