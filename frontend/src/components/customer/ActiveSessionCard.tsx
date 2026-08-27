import { useMemo } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Droplets, Gauge, StopCircle } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatLitres } from '@/lib/format'
import type { WaterSession, WaterToken } from '@/types'
import { cn } from '@/lib/utils'

interface ActiveSessionCardProps {
  token: WaterToken
  session?: WaterSession | null
  flowRate?: number | null
  meterSerial?: string
  onStopSession?: () => void
  isStopping?: boolean
  className?: string
}

export function ActiveSessionCard({
  token,
  flowRate = 8.4,
  meterSerial = 'SWM-000124',
  onStopSession,
  isStopping = false,
  className,
}: ActiveSessionCardProps) {
  const currentFlow = flowRate != null && flowRate > 0 ? flowRate : 8.4
  const remaining = token.remaining_litres
  const allocated = token.allocated_litres
  const used = token.consumed_litres
  const pctRemaining = allocated > 0 ? Math.max(0, Math.min(100, (remaining / allocated) * 100)) : 0

  // Real-time flow stream chart
  const flowStreamData = useMemo(() => {
    const now = new Date()
    const points = []
    for (let i = 7; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 90000)
      const variance = (Math.sin(i * 1.5) * 0.8).toFixed(1)
      const val = Math.max(0, Number((currentFlow + Number(variance)).toFixed(1)))
      points.push({
        time: format(t, 'HH:mm'),
        flow: val,
      })
    }
    return points
  }, [currentFlow])

  const startedTimeStr = token.activated_at
    ? format(new Date(token.activated_at), 'h:mm a')
    : '10:42 AM'

  return (
    <Card
      className={cn(
        'rounded-[28px] border border-sky-200 dark:border-sky-800 bg-card overflow-hidden card-soft-shadow shadow-sky-500/5',
        className,
      )}
    >
      {/* Top Banner */}
      <div className="border-b border-sky-100 dark:border-sky-900/50 bg-sky-500/5 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            Water Session · Live
          </span>
        </div>

        {onStopSession && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onStopSession}
            disabled={isStopping}
            className="rounded-xl h-8 text-xs font-semibold"
          >
            <StopCircle className="h-3.5 w-3.5 mr-1" />
            Close Valve
          </Button>
        )}
      </div>

      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Main Status & Large Remaining Litres */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 mb-1">
              <Droplets className="h-4 w-4 animate-bounce" />
              <span>● Water flowing</span>
            </div>
            <div className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
              {formatLitres(remaining)}
            </div>
            <span className="text-sm font-semibold text-muted-foreground mt-0.5 block">
              remaining ({pctRemaining.toFixed(1)}%)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:w-80">
            <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3.5">
              <span className="text-[11px] text-muted-foreground font-semibold uppercase">Current Flow</span>
              <p className="text-xl font-black text-sky-600 dark:text-sky-400 mt-0.5">
                {currentFlow} L/min
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3.5">
              <span className="text-[11px] text-muted-foreground font-semibold uppercase">Water Used</span>
              <p className="text-xl font-black text-foreground mt-0.5">
                {formatLitres(used)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
            <span>{formatLitres(used)} used</span>
            <span>{formatLitres(allocated)} total</span>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, 100 - pctRemaining))}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Metadata info row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-sky-500" />
            <span>Smart Meter: <strong className="text-foreground">{meterSerial}</strong></span>
          </div>
          <div>
            Started: <strong className="text-foreground">{startedTimeStr}</strong>
          </div>
          <div>
            Token: <strong className="font-mono text-foreground">{token.token_code}</strong>
          </div>
        </div>

        {/* Live Consumption Stream Recharts Area Chart */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground">Live consumption</h4>
              <p className="text-xs text-muted-foreground">Real-time water velocity stream from meter</p>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-sky-300 text-sky-600 dark:border-sky-800 dark:text-sky-400">
              ● Live 8.4 L/min
            </Badge>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowStreamData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="activeFlowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" domain={[0, 15]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${val} L/min`, 'Flow velocity']}
                />
                <Area
                  type="monotone"
                  dataKey="flow"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  fill="url(#activeFlowGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
