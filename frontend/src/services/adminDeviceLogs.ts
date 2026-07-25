import { supabase } from '@/lib/supabase'
import type { DeviceLog } from '@/types'

export async function fetchDeviceLogs(meterId: string, limit = 50): Promise<DeviceLog[]> {
  const { data, error } = await supabase
    .from('device_logs')
    .select('*')
    .eq('meter_id', meterId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}
