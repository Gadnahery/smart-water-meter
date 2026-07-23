import { supabase } from '@/lib/supabase'
import type { MeterStatus } from '@/types'

export interface MeterWithCustomer {
  id: string
  meter_serial: string
  customer_id: string | null
  firmware_version: string | null
  installation_date: string | null
  status: MeterStatus
  battery_level: number | null
  wifi_signal: number | null
  last_seen: string | null
  created_at: string
  customer_name: string | null
  customer_number: string | null
}

export async function fetchMeters(): Promise<MeterWithCustomer[]> {
  const { data, error } = await supabase
    .from('smart_meters')
    .select(
      'id, meter_serial, customer_id, firmware_version, installation_date, status, battery_level, wifi_signal, last_seen, created_at, customers!smart_meters_customer_id_fkey(customer_number, profiles(first_name, last_name))',
    )
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const customer = row.customers as unknown as {
      customer_number: string
      profiles: { first_name: string; last_name: string } | null
    } | null

    return {
      id: row.id,
      meter_serial: row.meter_serial,
      customer_id: row.customer_id,
      firmware_version: row.firmware_version,
      installation_date: row.installation_date,
      status: row.status,
      battery_level: row.battery_level,
      wifi_signal: row.wifi_signal,
      last_seen: row.last_seen,
      created_at: row.created_at,
      customer_name: customer?.profiles ? `${customer.profiles.first_name} ${customer.profiles.last_name}` : null,
      customer_number: customer?.customer_number ?? null,
    }
  })
}

export interface CustomerOption {
  id: string
  customer_number: string
  name: string
}

export async function fetchCustomerOptions(): Promise<CustomerOption[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('id, customer_number, profiles(first_name, last_name)')
    .order('customer_number', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => {
    const profile = row.profiles as unknown as { first_name: string; last_name: string } | null
    return {
      id: row.id,
      customer_number: row.customer_number,
      name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
    }
  })
}

export interface MeterFormValues {
  meter_serial: string
  customer_id: string | null
  firmware_version: string | null
  installation_date: string | null
  status: MeterStatus
  battery_level: number | null
  wifi_signal: number | null
}

export async function createMeter(values: MeterFormValues) {
  const { data, error } = await supabase.from('smart_meters').insert(values).select('id').single()
  if (error) throw error

  if (values.customer_id) {
    await supabase.from('customers').update({ meter_id: data.id }).eq('id', values.customer_id)
  }

  return data
}

export async function updateMeter(id: string, values: MeterFormValues) {
  const { error } = await supabase.from('smart_meters').update(values).eq('id', id)
  if (error) throw error

  if (values.customer_id) {
    await supabase.from('customers').update({ meter_id: id }).eq('id', values.customer_id)
  }
}

export async function deleteMeter(id: string) {
  const { error } = await supabase.from('smart_meters').delete().eq('id', id)
  if (error) throw error
}
