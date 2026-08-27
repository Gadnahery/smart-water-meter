import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  Activity,
  AlertTriangle,
  Droplets,
  Gauge,
  KeyRound,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminMetricCard } from '@/components/admin/AdminMetricCard'
import { LiveSessionTable } from '@/components/admin/LiveSessionTable'
import { DeviceHealthCard } from '@/components/admin/DeviceHealthCard'
import { ConsumptionOverview } from '@/components/charts/ConsumptionOverview'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import { useAllActiveSessions, useStopSession } from '@/hooks/useWaterSession'
import { useAllTokens } from '@/hooks/useWaterTokens'
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate'
import { formatCurrency, formatLitres } from '@/lib/format'

export default function Dashboard() {
  const { isLoading, counts, todayConsumption, series, alerts } = useAdminDashboard()
  const { data: activeSessions = [] } = useAllActiveSessions()
  const { data: tokens = [] } = useAllTokens(50)
  const stopSession = useStopSession()

  useRealtimeInvalidate('smart_meters', [['admin-counts']])
  useRealtimeInvalidate('customers', [['admin-counts']])
  useRealtimeInvalidate('alerts', [['admin-counts'], ['admin-recent-alerts']])
  useRealtimeInvalidate('daily_usage', [['admin-today-consumption'], ['admin-consumption-series']])
  useRealtimeInvalidate('water_sessions', [['all-active-sessions']])
  useRealtimeInvalidate('water_tokens', [['all-tokens']])

  // Real Database Metrics
  const activeSessionsCount = activeSessions.length
  const todayLitres = todayConsumption || 0
  const activeTokensCount = tokens.filter((t) => t.status === 'active').length
  const tokenRevenue = useMemo(() => {
    return tokens.reduce((sum, t) => sum + (t.total || 0), 0)
  }, [tokens])

  const totalMeters = counts?.totalMeters ?? 0
  const onlineMeters = counts?.activeMeters ?? 0
  const offlineMeters = counts?.offlineMeters ?? Math.max(0, totalMeters - onlineMeters)
  const lowBatteryCount = 0
  const weakSignalCount = 0

  async function handleStopSession(sessionId: string, meterId?: string) {
    await stopSession.mutateAsync({ sessionId, meterId })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-[24px]" />
      </div>
    )
  }

  const currentDateStr = format(new Date(), 'EEEE, MMMM d, yyyy')

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Fleet Operations
            </h1>
            <Badge className="bg-sky-500 text-white font-mono text-[10px]">
              Live Telemetry
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            SafeWater Smart Meter Management System · {currentDateStr}
          </p>
        </div>
      </div>

      {/* 2. Top Metrics (Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminMetricCard
          label="Active Sessions"
          value={activeSessionsCount}
          sublabel={activeSessionsCount > 0 ? 'Water flowing now' : 'No flowing sessions'}
          icon={<Droplets className="h-5 w-5 text-sky-500" />}
        />
        <AdminMetricCard
          label="Today's Consumption"
          value={formatLitres(todayLitres)}
          sublabel="Validated pulse volume"
          icon={<Activity className="h-5 w-5 text-cyan-500" />}
        />
        <AdminMetricCard
          label="Water Tokens"
          value={activeTokensCount}
          sublabel={`Revenue: ${formatCurrency(tokenRevenue)}`}
          icon={<KeyRound className="h-5 w-5 text-purple-500" />}
        />
        <AdminMetricCard
          label="Online Meters"
          value={`${onlineMeters} / ${totalMeters}`}
          sublabel={totalMeters > 0 ? `${Math.round((onlineMeters / totalMeters) * 100)}% fleet operational` : 'No meters registered'}
          icon={<Gauge className="h-5 w-5 text-emerald-500" />}
        />
      </div>

      {/* 3. Live Water Sessions */}
      <Card className="rounded-[24px] border border-sky-200/80 dark:border-sky-900 bg-card overflow-hidden card-soft-shadow">
        <CardHeader className="border-b border-sky-100 dark:border-sky-900/50 bg-sky-500/5 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeSessions.length > 0 ? 'bg-sky-400 opacity-75' : 'bg-slate-400 opacity-20'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${activeSessions.length > 0 ? 'bg-sky-500' : 'bg-slate-400'}`} />
              </span>
              <CardTitle className="text-base font-bold text-foreground">
                Live Water Sessions
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-sky-300 text-sky-700 dark:border-sky-800 dark:text-sky-300">
              {activeSessions.length} Actuator(s) Open
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <LiveSessionTable
            sessions={activeSessions}
            onStopSession={handleStopSession}
            isStopping={stopSession.isPending}
          />
        </CardContent>
      </Card>

      {/* 4. Fleet Telemetry & Device Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Device Health Breakdown */}
        <div className="lg:col-span-1">
          <DeviceHealthCard
            totalMeters={totalMeters}
            onlineMeters={onlineMeters}
            offlineMeters={offlineMeters}
            lowBatteryMeters={lowBatteryCount}
            weakSignalMeters={weakSignalCount}
          />
        </div>

        {/* System Consumption Graph */}
        <div className="lg:col-span-2">
          <ConsumptionOverview data={series} />
        </div>
      </div>

      {/* 5. Recent Alerts & System Activity */}
      <Card className="rounded-[24px] border border-border/80 bg-card p-6 card-soft-shadow">
        <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-bold text-foreground">
              Recent Fleet Alerts & Health Events
            </CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">{alerts.length} active</span>
        </CardHeader>
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
              No active alerts. All smart meters operating normally.
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/30 p-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full ${al.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    <div>
                      <span className="font-bold text-foreground block capitalize">
                        {al.alert_type.replace('_', ' ')} · {al.meter_serial}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {al.customer_name}
                      </span>
                    </div>
                  </div>

                  <Badge variant={al.severity === 'critical' ? 'destructive' : 'outline'} className="text-[10px] capitalize">
                    {al.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
