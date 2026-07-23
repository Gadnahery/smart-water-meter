import { supabase } from '@/lib/supabase'
import type { SmartMeter } from '@/types'

export async function fetchPrimaryMeter(customerId: string): Promise<SmartMeter | null> {
  const { data, error } = await supabase
    .from('smart_meters')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function fetchLatestReading(meterId: string) {
  const { data, error } = await supabase
    .from('meter_readings')
    .select('*')
    .eq('meter_id', meterId)
    .order('reading_time', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}
