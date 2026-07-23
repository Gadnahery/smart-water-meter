import { useQuery } from '@tanstack/react-query'
import { format, startOfWeek } from 'date-fns'
import { fetchDailyUsage, fetchMonthlyUsage } from '@/services/usage'
import type { DailyUsage, MonthlyUsage } from '@/types'

export interface UsagePoint {
  label: string
  value: number
}

function groupWeekly(daily: DailyUsage[]): UsagePoint[] {
  const map = new Map<string, number>()
  for (const row of daily) {
    const weekStart = startOfWeek(new Date(row.date), { weekStartsOn: 1 })
    const key = format(weekStart, 'MMM d')
    map.set(key, (map.get(key) ?? 0) + Number(row.consumption))
  }
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
}

function groupYearly(monthly: MonthlyUsage[]): UsagePoint[] {
  const map = new Map<number, number>()
  for (const row of monthly) {
    map.set(row.year, (map.get(row.year) ?? 0) + Number(row.total_consumption))
  }
  return Array.from(map.entries()).map(([year, value]) => ({ label: String(year), value }))
}

export function useUsageSeries(meterId: string | undefined) {
  const dailyQuery = useQuery({
    queryKey: ['daily-usage', meterId],
    enabled: !!meterId,
    queryFn: () => fetchDailyUsage(meterId!),
  })
  const monthlyQuery = useQuery({
    queryKey: ['monthly-usage', meterId],
    enabled: !!meterId,
    queryFn: () => fetchMonthlyUsage(meterId!),
  })

  const daily = dailyQuery.data ?? []
  const monthly = monthlyQuery.data ?? []

  const dailySeries: UsagePoint[] = daily.slice(-14).map((row) => ({
    label: format(new Date(row.date), 'MMM d'),
    value: Number(row.consumption),
  }))

  const weeklySeries = groupWeekly(daily).slice(-12)

  const monthlySeries: UsagePoint[] = monthly.slice(-12).map((row) => ({
    label: format(new Date(row.year, row.month - 1), 'MMM yyyy'),
    value: Number(row.total_consumption),
  }))

  const yearlySeries = groupYearly(monthly)

  const now = new Date()
  const currentMonth = monthly.find((row) => row.year === now.getFullYear() && row.month === now.getMonth() + 1)
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonth = monthly.find(
    (row) => row.year === prevDate.getFullYear() && row.month === prevDate.getMonth() + 1,
  )

  return {
    isLoading: dailyQuery.isLoading || monthlyQuery.isLoading,
    daily,
    monthly,
    currentMonth,
    previousMonth,
    series: { daily: dailySeries, weekly: weeklySeries, monthly: monthlySeries, yearly: yearlySeries },
  }
}
