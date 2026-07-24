import { supabase } from '@/lib/supabase'
import type { SystemSettings } from '@/types'

export async function fetchSettings(): Promise<SystemSettings> {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error
  return data
}

export type SettingsFormValues = Pick<
  SystemSettings,
  'company_name' | 'water_tariff' | 'currency' | 'billing_cycle' | 'alert_threshold' | 'support_email' | 'support_phone'
>

export async function updateSettings(id: string, values: SettingsFormValues) {
  const { error } = await supabase.from('system_settings').update(values).eq('id', id)
  if (error) throw error
}
