import { useQuery } from '@tanstack/react-query'
import {
  fetchAdminCounts,
  fetchRecentAlerts,
  fetchRecentCustomers,
  fetchSystemConsumptionSeries,
  fetchTodayConsumption,
} from '@/services/admin'

export function useAdminDashboard() {
  // activeMeters/offlineMeters are derived from last_seen recency (see
  // lib/meterStatus.ts) - refetch periodically so a device going quiet is
  // reflected even without a new DB row to trigger a realtime refresh.
  const counts = useQuery({ queryKey: ['admin-counts'], queryFn: fetchAdminCounts, refetchInterval: 30_000 })
  const today = useQuery({ queryKey: ['admin-today-consumption'], queryFn: fetchTodayConsumption })
  const series = useQuery({ queryKey: ['admin-consumption-series'], queryFn: () => fetchSystemConsumptionSeries(30) })
  const alerts = useQuery({ queryKey: ['admin-recent-alerts'], queryFn: () => fetchRecentAlerts(5) })
  const customers = useQuery({ queryKey: ['admin-recent-customers'], queryFn: () => fetchRecentCustomers(5) })

  return {
    isLoading: counts.isLoading || today.isLoading,
    counts: counts.data,
    todayConsumption: today.data ?? 0,
    series: series.data ?? [],
    alerts: alerts.data ?? [],
    customers: customers.data ?? [],
  }
}
