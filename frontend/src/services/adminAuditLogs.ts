import { supabase } from '@/lib/supabase'

export interface AuditLogRow {
  id: string
  action: string
  table_name: string | null
  record_id: string | null
  created_at: string
  actor_name: string | null
}

export async function fetchAuditLogs(limit = 100): Promise<AuditLogRow[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, action, table_name, record_id, created_at, profiles(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) => {
    const profile = row.profiles as unknown as { first_name: string; last_name: string } | null
    return {
      id: row.id,
      action: row.action,
      table_name: row.table_name,
      record_id: row.record_id,
      created_at: row.created_at,
      actor_name: profile ? `${profile.first_name} ${profile.last_name}` : null,
    }
  })
}
