import { supabase } from '@/lib/supabase'

export interface MeterConsumptionRow {
  meter_id: string
  meter_serial: string
  customer_name: string
  customer_number: string
  today_consumption: number
  month_consumption: number
  latest_flow_rate: number | null
  latest_reading_time: string | null
}

export async function fetchMeterConsumptionSummary(): Promise<MeterConsumptionRow[]> {
  const today = new Date().toISOString().slice(0, 10)
  const now = new Date()

  const [{ data: meters, error: metersError }, { data: todayUsage, error: todayError }, { data: monthUsage, error: monthError }] =
    await Promise.all([
      supabase
        .from('smart_meters')
        .select('id, meter_serial, customers!smart_meters_customer_id_fkey(customer_number, profiles(first_name, last_name))'),
      supabase.from('daily_usage').select('meter_id, consumption').eq('date', today),
      supabase
        .from('monthly_usage')
        .select('meter_id, total_consumption')
        .eq('month', now.getMonth() + 1)
        .eq('year', now.getFullYear()),
    ])

  if (metersError) throw metersError
  if (todayError) throw todayError
  if (monthError) throw monthError

  const todayByMeter = new Map((todayUsage ?? []).map((r) => [r.meter_id, r.consumption]))
  const monthByMeter = new Map((monthUsage ?? []).map((r) => [r.meter_id, r.total_consumption]))

  const meterIds = (meters ?? []).map((m) => m.id)
  const { data: readings, error: readingsError } = await supabase
    .from('meter_readings')
    .select('meter_id, flow_rate, reading_time')
    .in('meter_id', meterIds.length > 0 ? meterIds : ['00000000-0000-0000-0000-000000000000'])
    .order('reading_time', { ascending: false })

  if (readingsError) throw readingsError

  const latestByMeter = new Map<string, { flow_rate: number | null; reading_time: string }>()
  for (const r of readings ?? []) {
    if (!latestByMeter.has(r.meter_id)) latestByMeter.set(r.meter_id, r)
  }

  return (meters ?? []).map((m) => {
    const customer = m.customers as unknown as {
      customer_number: string
      profiles: { first_name: string; last_name: string } | null
    } | null
    const latest = latestByMeter.get(m.id)

    return {
      meter_id: m.id,
      meter_serial: m.meter_serial,
      customer_name: customer?.profiles ? `${customer.profiles.first_name} ${customer.profiles.last_name}` : 'Unassigned',
      customer_number: customer?.customer_number ?? '',
      today_consumption: todayByMeter.get(m.id) ?? 0,
      month_consumption: monthByMeter.get(m.id) ?? 0,
      latest_flow_rate: latest?.flow_rate ?? null,
      latest_reading_time: latest?.reading_time ?? null,
    }
  })
}
