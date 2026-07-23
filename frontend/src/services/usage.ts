import { supabase } from '@/lib/supabase'
import type { DailyUsage, MonthlyUsage } from '@/types'

export async function fetchDailyUsage(meterId: string, days = 90): Promise<DailyUsage[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('daily_usage')
    .select('*')
    .eq('meter_id', meterId)
    .gte('date', since.toISOString().slice(0, 10))
    .order('date', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchMonthlyUsage(meterId: string, limit = 24): Promise<MonthlyUsage[]> {
  const { data, error } = await supabase
    .from('monthly_usage')
    .select('*')
    .eq('meter_id', meterId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).slice().reverse()
}
