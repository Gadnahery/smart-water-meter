import { supabase } from '@/lib/supabase'
import type { AlertSeverity, AlertStatus, AlertType } from '@/types'

export interface AlertRow {
  id: string
  meter_id: string
  alert_type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  description: string | null
  created_at: string
  resolved_at: string | null
  meter_serial: string
  customer_name: string | null
  customer_number: string | null
}

export async function fetchAlerts(): Promise<AlertRow[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select(
      'id, meter_id, alert_type, severity, status, description, created_at, resolved_at, smart_meters(meter_serial, customers!smart_meters_customer_id_fkey(customer_number, profiles(first_name, last_name)))',
    )
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const meter = row.smart_meters as unknown as {
      meter_serial: string
      customers: {
        customer_number: string
        profiles: { first_name: string; last_name: string } | null
      } | null
    } | null
    const profile = meter?.customers?.profiles

    return {
      id: row.id,
      meter_id: row.meter_id,
      alert_type: row.alert_type,
      severity: row.severity,
      status: row.status,
      description: row.description,
      created_at: row.created_at,
      resolved_at: row.resolved_at,
      meter_serial: meter?.meter_serial ?? 'Unknown meter',
      customer_name: profile ? `${profile.first_name} ${profile.last_name}` : null,
      customer_number: meter?.customers?.customer_number ?? null,
    }
  })
}

export async function setAlertStatus(id: string, status: AlertStatus) {
  const { error } = await supabase
    .from('alerts')
    .update({ status, resolved_at: status === 'resolved' ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
}
