import { useQuery } from '@tanstack/react-query'
import {
  fetchAdminCounts,
  fetchRecentAlerts,
  fetchRecentCustomers,
  fetchSystemConsumptionSeries,
  fetchTodayConsumption,
} from '@/services/admin'

export function useAdminDashboard() {
  const counts = useQuery({ queryKey: ['admin-counts'], queryFn: fetchAdminCounts })
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
