import { supabase } from '@/lib/supabase'
import { onlineThresholdIso } from '@/lib/meterStatus'

export interface AdminCounts {
  totalCustomers: number
  totalMeters: number
  activeMeters: number
  offlineMeters: number
  activeAlerts: number
}

async function countRows(table: 'customers' | 'smart_meters' | 'alerts', filter?: [string, string]) {
  let query = supabase.from(table).select('id', { count: 'exact', head: true })
  if (filter) query = query.eq(filter[0], filter[1])
  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

// "Active" here means "has actually sent a reading/heartbeat recently" -
// the smart_meters.status column is set to 'online' by the device but
// never reverted to 'offline' on its own, so it can't be trusted for a
// live online/offline split. See lib/meterStatus.ts.
async function countActiveMeters() {
  const { count, error } = await supabase
    .from('smart_meters')
    .select('id', { count: 'exact', head: true })
    .gte('last_seen', onlineThresholdIso())
  if (error) throw error
  return count ?? 0
}

export async function fetchAdminCounts(): Promise<AdminCounts> {
  const [totalCustomers, totalMeters, activeAlerts, activeMeters] = await Promise.all([
    countRows('customers'),
    countRows('smart_meters'),
    countRows('alerts', ['status', 'active']),
    countActiveMeters(),
  ])

  return { totalCustomers, totalMeters, activeMeters, offlineMeters: totalMeters - activeMeters, activeAlerts }
}

export async function fetchTodayConsumption(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase.from('daily_usage').select('consumption').eq('date', today)
  if (error) throw error
  return (data ?? []).reduce((sum, row) => sum + Number(row.consumption), 0)
}

export interface SystemUsagePoint {
  label: string
  value: number
}

export async function fetchSystemConsumptionSeries(days = 30): Promise<SystemUsagePoint[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('daily_usage')
    .select('date, consumption')
    .gte('date', since.toISOString().slice(0, 10))
    .order('date', { ascending: true })

  if (error) throw error

  const totalsByDate = new Map<string, number>()
  for (const row of data ?? []) {
    totalsByDate.set(row.date, (totalsByDate.get(row.date) ?? 0) + Number(row.consumption))
  }

  return Array.from(totalsByDate.entries()).map(([date, value]) => ({
    label: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value,
  }))
}

export interface RecentAlert {
  id: string
  alert_type: string
  severity: string
  status: string
  created_at: string
  meter_serial: string
  customer_name: string
}

export async function fetchRecentAlerts(limit = 5): Promise<RecentAlert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select(
      'id, alert_type, severity, status, created_at, smart_meters(meter_serial, customers!smart_meters_customer_id_fkey(profiles(first_name, last_name)))',
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) => {
    const meter = row.smart_meters as unknown as {
      meter_serial: string
      customers: { profiles: { first_name: string; last_name: string } | null } | null
    } | null
    const profile = meter?.customers?.profiles

    return {
      id: row.id,
      alert_type: row.alert_type,
      severity: row.severity,
      status: row.status,
      created_at: row.created_at,
      meter_serial: meter?.meter_serial ?? 'Unknown meter',
      customer_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown customer',
    }
  })
}

export interface RecentCustomer {
  id: string
  customer_number: string
  account_status: string
  created_at: string
  name: string
  email: string
}

export async function fetchRecentCustomers(limit = 5): Promise<RecentCustomer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('id, customer_number, account_status, created_at, profiles(first_name, last_name, email)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) => {
    const profile = row.profiles as unknown as { first_name: string; last_name: string; email: string } | null
    return {
      id: row.id,
      customer_number: row.customer_number,
      account_status: row.account_status,
      created_at: row.created_at,
      name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
      email: profile?.email ?? '',
    }
  })
}
