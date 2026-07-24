import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Bell, Droplets, Gauge, MessageCircleWarning, Wifi, WifiOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/cards/StatCard'
import { UsageChart } from '@/components/charts/UsageChart'
import { EmptyState } from '@/components/empty/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { useLatestReading, useMeter } from '@/hooks/useMeter'
import { useUsageSeries } from '@/hooks/useUsageSeries'
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate'
import { fetchRecentNotifications } from '@/services/notifications'

type Range = 'daily' | 'weekly' | 'monthly' | 'yearly'

function percentChange(current?: number, previous?: number) {
  if (!current || !previous) return null
  return ((current - previous) / previous) * 100
}

export default function Home() {
  const { customer } = useAuth()
  const [range, setRange] = useState<Range>('daily')

  const { data: meter, isLoading: meterLoading } = useMeter(customer?.id)
  const { data: latestReading } = useLatestReading(meter?.id)
  const { series, currentMonth, previousMonth, isLoading: usageLoading } = useUsageSeries(meter?.id)

  const { data: notifications = [] } = useQuery({
    queryKey: ['recent-notifications', customer?.id],
    enabled: !!customer,
    queryFn: () => fetchRecentNotifications(customer!.id),
  })

  useRealtimeInvalidate('smart_meters', [['meter', customer?.id]], meter ? `id=eq.${meter.id}` : undefined, !!meter)
  useRealtimeInvalidate(
    'meter_readings',
    [['latest-reading', meter?.id]],
    meter ? `meter_id=eq.${meter.id}` : undefined,
    !!meter,
  )
  useRealtimeInvalidate(
    'notifications',
    [['recent-notifications', customer?.id], ['unread-notifications', customer?.id]],
    customer ? `customer_id=eq.${customer.id}` : undefined,
    !!customer,
  )

  if (meterLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  if (!meter) {
    return (
      <EmptyState
        icon={Gauge}
        title="No meter registered yet"
        description="Once a SafeWater smart meter is installed at your address, your usage will show up here automatically."
      />
    )
  }

  const change = percentChange(currentMonth?.total_consumption, previousMonth?.total_consumption)
  const isOnline = meter.status === 'online'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Current month usage"
          value={`${(currentMonth?.total_consumption ?? 0).toFixed(1)} m³`}
          sub={
            change === null
              ? 'No comparison data yet'
              : `${change >= 0 ? '+' : ''}${change.toFixed(0)}% vs last month`
          }
          icon={<Droplets className="h-5 w-5" />}
        />
        <StatCard
          label="Meter status"
          value={isOnline ? 'Online' : 'Offline'}
          sub={meter.wifi_signal != null ? `Signal ${meter.wifi_signal} dBm` : meter.meter_serial}
          icon={isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
          tone={isOnline ? 'success' : 'destructive'}
        />
        <StatCard
          label="Latest reading"
          value={latestReading ? `${Number(latestReading.water_usage).toFixed(1)} m³` : '—'}
          sub={
            latestReading
              ? `${formatDistanceToNow(new Date(latestReading.reading_time), { addSuffix: true })}`
              : 'No readings yet'
          }
          icon={<Gauge className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/usage">
              <Gauge className="h-4 w-4" />
              View usage
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/notifications">
              <MessageCircleWarning className="h-4 w-4" />
              Report an issue
            </Link>
          </Button>
        </CardContent>
      </Card>

      {!usageLoading && <UsageChart series={series} range={range} onRangeChange={setRange} />}

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  {n.type === 'leak' || n.type === 'emergency' ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{n.message}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
