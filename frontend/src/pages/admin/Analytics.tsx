import { useMemo } from 'react'
import { BarChart3, TrendingUp, Users } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/cards/StatCard'
import { useAllBills } from '@/hooks/useAdminBilling'

export default function Analytics() {
  const { data: bills = [], isLoading } = useAllBills()

  const totalRevenue = useMemo(() => bills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.total, 0), [bills])
  const outstanding = useMemo(
    () => bills.filter((b) => b.status === 'pending' || b.status === 'overdue').reduce((sum, b) => sum + b.total, 0),
    [bills],
  )
  const avgConsumption = useMemo(
    () => (bills.length === 0 ? 0 : bills.reduce((sum, b) => sum + b.consumption, 0) / bills.length),
    [bills],
  )

  const revenueByMonth = useMemo(() => {
    const totals = new Map<string, number>()
    for (const bill of bills) {
      if (bill.status !== 'paid') continue
      const key = `${bill.billing_year}-${String(bill.billing_month).padStart(2, '0')}`
      totals.set(key, (totals.get(key) ?? 0) + bill.total)
    }
    return Array.from(totals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ label: key, value }))
  }, [bills])

  const topCustomers = useMemo(() => {
    const totals = new Map<string, { name: string; number: string; consumption: number }>()
    for (const bill of bills) {
      const existing = totals.get(bill.customer_id)
      totals.set(bill.customer_id, {
        name: bill.customer_name,
        number: bill.customer_number,
        consumption: (existing?.consumption ?? 0) + bill.consumption,
      })
    }
    return Array.from(totals.values())
      .sort((a, b) => b.consumption - a.consumption)
      .slice(0, 5)
  }, [bills])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Business metrics from billing data</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total revenue (paid)" value={`$${totalRevenue.toFixed(2)}`} icon={<TrendingUp className="h-5 w-5" />} tone="success" />
        <StatCard label="Outstanding" value={`$${outstanding.toFixed(2)}`} icon={<TrendingUp className="h-5 w-5" />} tone={outstanding > 0 ? 'warning' : 'default'} />
        <StatCard label="Avg. consumption / bill" value={`${avgConsumption.toFixed(1)} m³`} icon={<BarChart3 className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by month (paid bills)</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueByMonth.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No paid bills yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueByMonth} margin={{ left: -20, right: 12, top: 12 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={50} />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                  contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12 }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top consumers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topCustomers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No billing data yet.</p>
          ) : (
            topCustomers.map((c) => (
              <div key={c.number} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.number}</p>
                </div>
                <p className="font-semibold text-foreground">{c.consumption.toFixed(1)} m³</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
