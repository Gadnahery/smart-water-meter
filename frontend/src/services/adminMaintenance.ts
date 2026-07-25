import { supabase } from '@/lib/supabase'
import type { MaintenanceLog } from '@/types'

export async function fetchMaintenanceLogs(meterId: string): Promise<MaintenanceLog[]> {
  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*')
    .eq('meter_id', meterId)
    .order('maintenance_date', { ascending: false })

  if (error) throw error
  return data ?? []
}

export interface MaintenanceLogInput {
  meter_id: string
  technician: string | null
  description: string | null
  maintenance_date: string
  next_service: string | null
}

export async function createMaintenanceLog(input: MaintenanceLogInput) {
  const { error } = await supabase.from('maintenance_logs').insert(input)
  if (error) throw error
}
