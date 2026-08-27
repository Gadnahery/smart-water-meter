import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  BarChart3,
  Search,
  Waves,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/empty/EmptyState'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import { useMeterConsumptionSummary } from '@/hooks/useAdminConsumption'
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate'
import { ConsumptionOverview } from '@/components/charts/ConsumptionOverview'
import { formatLitres } from '@/lib/format'

// LPDC & Pressure data inspired by Image 1 & 2
const LPDC_DATA = [
  { month: 'Jan', required: 80, given: 60.25 },
  { month: 'Feb', required: 80, given: 84.5 },
  { month: 'Mar', required: 80, given: 72.8 },
  { month: 'Apr', required: 80, given: 48.0 },
  { month: 'May', required: 80, given: 89.2 },
  { month: 'Jun', required: 80, given: 82.4 },
]

const PRESSURE_DATA = [
  { month: 'Jan', pressure: 0.65, threshold: 0.6 },
  { month: 'Feb', pressure: 0.65, threshold: 0.6 },
  { month: 'Mar', pressure: 0.42, threshold: 0.6 },
  { month: 'Apr', pressure: 0.38, threshold: 0.6 },
  { month: 'May', pressure: 0.55, threshold: 0.6 },
  { month: 'Jun', pressure: 0.58, threshold: 0.6 },
]

export default function Consumption() {
  const [search, setSearch] = useState('')
  const { series } = useAdminDashboard()
  const { data: rows = [], isLoading } = useMeterConsumptionSummary()

  useRealtimeInvalidate('daily_usage', [['admin-consumption-series'], ['admin-today-consumption']])
  useRealtimeInvalidate('monthly_usage', [['admin-consumption-series']])

  const filtered = rows.filter((r) =>
    [r.meter_serial, r.customer_name, r.customer_number]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">Live Usage & LPDC</h1>
            <Badge className="bg-sky-500 text-white font-mono text-[10px]">
              {rows.length} Active Meters
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            System-wide flow velocities, LPDC distribution trends, and pressure diagnostics
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search meter or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      {/* 1. LPDC & Residual Pressure Cards (inspired by Reference Image 1 & 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-[28px] border-border/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">LPDC Distribution Trend</h3>
              <p className="text-xs text-muted-foreground">Litres Per Day per Capita vs Target (80L)</p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              Target 80L
            </Badge>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={LPDC_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lpdcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" domain={[0, 120]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="given" stroke="#2563eb" strokeWidth={2.5} fill="url(#lpdcGrad)" name="Given LPDC" />
                <Line type="monotone" dataKey="required" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Target LPDC" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-[28px] border-border/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Pipeline Residual Pressure</h3>
              <p className="text-xs text-muted-foreground">Sensor measurements (Kg/cm²) vs Min Nominal</p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold text-emerald-600 border-emerald-300">
              Nominal 0.58
            </Badge>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PRESSURE_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" domain={[0, 1.2]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="pressure" stroke="#06b6d4" strokeWidth={2.5} fill="url(#pressGrad)" name="Pressure (Kg/cm²)" />
                <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="Min Limit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 2. System-wide 24-hour / Daily chart */}
      <ConsumptionOverview data={series} />

      {/* 3. Meter Breakdown Table */}
      <Card className="rounded-[28px] border-border/80 overflow-hidden shadow-sm">
        <CardHeader className="py-4 px-6 border-b border-border/60">
          <CardTitle className="text-base font-bold">Meter Consumption Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={BarChart3} title="No meters matching search" description="Try a different serial or customer name." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Meter Serial</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Today's Usage</TableHead>
                  <TableHead>Month Total</TableHead>
                  <TableHead>Live Flow Rate</TableHead>
                  <TableHead className="text-right">Last Reading</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.meter_id} className="text-xs">
                    <TableCell className="font-mono font-bold text-foreground">{row.meter_serial}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <p className="font-semibold text-foreground">{row.customer_name}</p>
                      <span className="text-[11px] font-mono">{row.customer_number}</span>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{formatLitres(row.today_consumption)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatLitres(row.month_consumption)}</TableCell>
                    <TableCell>
                      {row.latest_flow_rate != null && row.latest_flow_rate > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400">
                          <Waves className="h-3.5 w-3.5 animate-pulse" />
                          {row.latest_flow_rate} L/min
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0.0 L/min</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {row.latest_reading_time
                        ? formatDistanceToNow(new Date(row.latest_reading_time), { addSuffix: true })
                        : 'Never'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
