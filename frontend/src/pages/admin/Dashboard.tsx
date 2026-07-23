import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Droplets, Gauge, UserPlus, Users, Wifi, WifiOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/cards/StatCard'
import { ConsumptionOverview } from '@/components/charts/ConsumptionOverview'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'

const severityTone: Record<string, 'default' | 'warning' | 'destructive'> = {
  low: 'default',
  medium: 'warning',
  high: 'destructive',
  critical: 'destructive',
}

export default function Dashboard() {
  const { isLoading, counts, todayConsumption, series, alerts, customers } = useAdminDashboard()

  if (isLoading || !counts) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Total customers" value={counts.totalCustomers} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Total smart meters" value={counts.totalMeters} icon={<Gauge className="h-5 w-5" />} />
        <StatCard
          label="Active meters"
          value={counts.activeMeters}
          icon={<Wifi className="h-5 w-5" />}
          tone="success"
        />
        <StatCard
          label="Offline meters"
          value={counts.offlineMeters}
          icon={<WifiOff className="h-5 w-5" />}
          tone={counts.offlineMeters > 0 ? 'destructive' : 'default'}
        />
        <StatCard
          label="Today's consumption"
          value={`${todayConsumption.toFixed(1)} m³`}
          icon={<Droplets className="h-5 w-5" />}
        />
        <StatCard
          label="Active alerts"
          value={counts.activeAlerts}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone={counts.activeAlerts > 0 ? 'warning' : 'default'}
        />
      </div>

      <ConsumptionOverview data={series} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No alerts yet.</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium capitalize text-foreground">
                        {alert.alert_type.replace('_', ' ')}
                      </p>
                      <Badge variant={severityTone[alert.severity] === 'default' ? 'secondary' : 'outline'}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {alert.meter_serial} · {alert.customer_name}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent registrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No customers yet.</p>
            ) : (
              customers.map((c) => (
                <div key={c.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.customer_number} · {c.email}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
