import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { WaterSafetyCard } from '@/components/customer/WaterSafetyCard'
import { MeterStatusCard } from '@/components/customer/MeterStatusCard'
import { WaterStatusCard } from '@/components/customer/WaterStatusCard'
import { ConsumptionCard } from '@/components/customer/ConsumptionCard'
import { ConsumptionDetailsCard } from '@/components/customer/ConsumptionDetailsCard'
import { ActivityTimeline, type ActivityEvent } from '@/components/customer/ActivityTimeline'
import { GetWaterDialog } from '@/components/dialogs/GetWaterDialog'
import { ActivateTokenDialog } from '@/components/dialogs/ActivateTokenDialog'
import { useAuth } from '@/hooks/useAuth'
import { useLatestReading, useMeter } from '@/hooks/useMeter'
import { useActiveSession } from '@/hooks/useWaterSession'
import { useActiveToken, useCustomerTokens } from '@/hooks/useWaterTokens'
import { useUsageSeries } from '@/hooks/useUsageSeries'
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate'
import { formatLitres } from '@/lib/format'
import { isMeterOnline } from '@/lib/meterStatus'

export default function Home() {
  const { profile, customer } = useAuth()
  const navigate = useNavigate()

  const [getWaterOpen, setGetWaterOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)

  const { data: meter, isLoading: meterLoading } = useMeter(customer?.id)
  const { data: latestReading } = useLatestReading(meter?.id)
  const { data: activeToken } = useActiveToken(customer?.id)
  const { data: activeSession } = useActiveSession(customer?.id)
  const { data: tokens = [] } = useCustomerTokens(customer?.id)
  const { daily, currentMonth, previousMonth } = useUsageSeries(meter?.id)

  useRealtimeInvalidate('smart_meters', [['meter', customer?.id]], meter ? `id=eq.${meter.id}` : undefined, !!meter)
  useRealtimeInvalidate('meter_readings', [['latest-reading', meter?.id]], meter ? `meter_id=eq.${meter.id}` : undefined, !!meter)
  useRealtimeInvalidate('daily_usage', [['daily-usage', meter?.id]], meter ? `meter_id=eq.${meter.id}` : undefined, !!meter)
  useRealtimeInvalidate('monthly_usage', [['monthly-usage', meter?.id]], meter ? `meter_id=eq.${meter.id}` : undefined, !!meter)
  useRealtimeInvalidate('water_tokens', [['active-token', customer?.id], ['customer-tokens', customer?.id]])
  useRealtimeInvalidate('water_sessions', [['active-session', customer?.id]])

  const isOnline = isMeterOnline(meter?.last_seen)
  const flowRate = (isOnline && latestReading?.flow_rate != null) ? Number(latestReading.flow_rate) : null
  const isFlowing = isOnline && (activeSession != null || (flowRate != null && flowRate > 0))

  // Real Usage calculations from database
  const todayUsage = useMemo(() => {
    if (daily.length > 0) {
      return Number(daily[daily.length - 1].consumption) || 0
    }
    return 0
  }, [daily])

  const weekUsage = useMemo(() => {
    if (daily.length > 0) {
      return daily.slice(-7).reduce((acc, curr) => acc + Number(curr.consumption || 0), 0)
    }
    return 0
  }, [daily])

  const monthUsage = currentMonth?.total_consumption ?? 0

  const trendPct = useMemo(() => {
    if (currentMonth && previousMonth && previousMonth.total_consumption > 0) {
      return Math.round(((currentMonth.total_consumption - previousMonth.total_consumption) / previousMonth.total_consumption) * 100)
    }
    return 0
  }, [currentMonth, previousMonth])

  // Sparkline data for consumption card (real readings)
  const consumptionChartData = useMemo(() => {
    if (daily.length >= 7) {
      return daily.slice(-7).map((d) => ({ val: Number(d.consumption || 0) }))
    }
    return daily.map((d) => ({ val: Number(d.consumption || 0) }))
  }, [daily])

  // Mini bar chart data for consumption details card
  const weekBarData = useMemo(() => {
    if (daily.length >= 7) {
      return daily.slice(-7).map((d) => ({
        day: format(new Date(d.date), 'EEE'),
        val: Number(d.consumption || 0),
      }))
    }
    return daily.map((d) => ({
      day: format(new Date(d.date), 'EEE'),
      val: Number(d.consumption || 0),
    }))
  }, [daily])

  // Real Recent activity stream
  const recentActivityEvents: ActivityEvent[] = useMemo(() => {
    const events: ActivityEvent[] = []

    if (activeSession) {
      events.push({
        id: `sess-act-${activeSession.id}`,
        title: 'Water session started',
        description: `Consuming at ${flowRate ?? 0} L/min`,
        timestamp: activeSession.started_at,
        type: 'session_started',
        badge: 'Flowing',
      })
    }

    if (activeToken) {
      events.push({
        id: `tok-act-${activeToken.id}`,
        title: `${formatLitres(activeToken.consumed_litres)} consumed`,
        description: `Remaining: ${formatLitres(activeToken.remaining_litres)}`,
        timestamp: activeToken.activated_at || activeToken.created_at,
        type: 'consumed',
      })
    }

    // Add real completed tokens
    tokens.slice(0, 3).forEach((t) => {
      if (t.status === 'completed' && t.completed_at) {
        events.push({
          id: `tok-comp-${t.id}`,
          title: 'Water session completed',
          description: `Allocation of ${formatLitres(t.allocated_litres)} consumed. Valve closed.`,
          timestamp: t.completed_at,
          type: 'session_completed',
        })
      }
    })

    return events
  }, [activeSession, activeToken, tokens, flowRate])

  if (meterLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-20 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-[28px]" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    )
  }

  const customerName = profile?.first_name ? `${profile.first_name}` : 'Customer'
  const customerAddress = customer?.address
    ? `${customer.address} · Acc #${customer.customer_number}`
    : `Account #${customer?.customer_number ?? 'Unassigned'}`

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Header with greeting, address, and live meter dot */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Good morning, {customerName}
          </h1>
          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isOnline ? 'Meter online' : 'Meter offline'}</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {customerAddress}
        </p>
      </div>

      {/* 2. Two compact status cards side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <WaterSafetyCard
          status={isFlowing ? 'monitoring' : 'no_leak'}
          lastUpdated={meter?.last_seen ? 'Telemetry active' : 'No recent signal'}
          currentFlow={flowRate ?? undefined}
        />
        <MeterStatusCard
          status={isOnline ? 'online' : 'offline'}
          meterSerial={meter?.meter_serial ?? 'None'}
          wifiSignal={isOnline ? meter?.wifi_signal : null}
          batteryLevel={isOnline ? meter?.battery_level : null}
          lastSeenText={meter?.last_seen ? 'Active recently' : 'Never connected'}
        />
      </div>

      {/* 3. Main Water Status Card */}
      <WaterStatusCard
        activeToken={activeToken}
        flowRate={flowRate}
        isFlowing={isFlowing}
        todayLitres={todayUsage}
        onGetWater={() => setGetWaterOpen(true)}
        onEnterToken={() => setActivateOpen(true)}
        onOpenWaterCenter={() => navigate('/water')}
      />

      {/* 4. Water Consumption Card */}
      <ConsumptionCard
        totalLitres={weekUsage}
        trendPct={trendPct}
        statusText={weekUsage > 0 ? 'Recorded usage' : 'No recorded usage'}
        chartData={consumptionChartData}
        periodLabel="this week"
      />

      {/* 5. Consumption Details Progressive Card */}
      <ConsumptionDetailsCard
        todayUsage={todayUsage}
        weekUsage={weekUsage}
        monthUsage={monthUsage}
        chartData={weekBarData}
      />

      {/* 6. Recent Activity Timeline */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
          <button
            onClick={() => navigate('/activity')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            View all
          </button>
        </div>
        <ActivityTimeline events={recentActivityEvents} />
      </div>

      {/* Dialogs */}
      <GetWaterDialog
        open={getWaterOpen}
        onOpenChange={setGetWaterOpen}
        meterId={meter?.id}
        meterSerial={meter?.meter_serial}
        onActivated={() => navigate('/water')}
      />
      <ActivateTokenDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        onSuccess={() => navigate('/water')}
      />
    </div>
  )
}
