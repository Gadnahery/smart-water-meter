import { supabase } from '@/lib/supabase'

export async function fetchRecentNotifications(customerId: string, limit = 5) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}
