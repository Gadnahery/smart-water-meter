import { supabase } from '@/lib/supabase'
import type { WaterSession } from '@/types'

const DEMO_SESSIONS_STORAGE_KEY = 'safewater_demo_sessions'

function getLocalSessions(): WaterSession[] {
  try {
    const raw = localStorage.getItem(DEMO_SESSIONS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return []
}

function saveLocalSessions(sessions: WaterSession[]) {
  try {
    localStorage.setItem(DEMO_SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    // ignore
  }
}

export async function fetchActiveSession(customerId: string): Promise<WaterSession | null> {
  try {
    const { data, error } = await supabase
      .from('water_sessions' as any)
      .select('*, smart_meters(meter_serial), water_tokens(token_code)')
      .eq('customer_id', customerId)
      .in('status', ['active', 'opening'])
      .order('started_at', { ascending: false })
      .maybeSingle()

    if (!error && data) {
      const row = data as any
      return {
        ...row,
        meter_serial: row.smart_meters?.meter_serial,
        token_code: row.water_tokens?.token_code,
      } as WaterSession
    }
  } catch {
    // local fallback
  }

  const local = getLocalSessions().find((s) => s.customer_id === customerId && (s.status === 'active' || s.status === 'opening'))
  return local ?? null
}

export async function fetchRecentSessions(customerId?: string, limit = 20): Promise<WaterSession[]> {
  try {
    let query = supabase
      .from('water_sessions' as any)
      .select('*, smart_meters(meter_serial), water_tokens(token_code)')
      .order('started_at', { ascending: false })
      .limit(limit)

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    const { data, error } = await query
    if (!error && data && data.length > 0) {
      return (data as any[]).map((row) => ({
        ...row,
        meter_serial: row.smart_meters?.meter_serial,
        token_code: row.water_tokens?.token_code,
      }))
    }
  } catch {
    // fallback
  }

  const all = getLocalSessions()
  if (customerId) {
    return all.filter((s) => s.customer_id === customerId).slice(0, limit)
  }
  return all.slice(0, limit)
}

export async function fetchAllActiveSessions(): Promise<WaterSession[]> {
  try {
    const { data, error } = await supabase
      .from('water_sessions' as any)
      .select('*, customers(customer_number, profiles(first_name, last_name)), smart_meters(meter_serial), water_tokens(token_code)')
      .in('status', ['active', 'opening'])
      .order('started_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return (data as any[]).map((row) => ({
        ...row,
        customer_name: row.customers?.profiles ? `${row.customers.profiles.first_name} ${row.customers.profiles.last_name}` : 'Customer',
        customer_number: row.customers?.customer_number,
        meter_serial: row.smart_meters?.meter_serial,
        token_code: row.water_tokens?.token_code,
      }))
    }
  } catch {
    // fallback
  }

  return getLocalSessions().filter((s) => s.status === 'active' || s.status === 'opening')
}

export async function stopWaterSession(sessionId: string, meterId?: string): Promise<void> {
  const now = new Date().toISOString()
  try {
    await supabase
      .from('water_sessions' as any)
      .update({ status: 'completed', ended_at: now })
      .eq('id', sessionId)

    if (meterId) {
      await supabase.from('valve_commands').insert({
        meter_id: meterId,
        command: 'CLOSE',
        status: 'pending',
      })
    }
  } catch {
    // local fallback
  }

  const local = getLocalSessions().map((s) => (s.id === sessionId ? { ...s, status: 'completed' as const, ended_at: now } : s))
  saveLocalSessions(local)
}
