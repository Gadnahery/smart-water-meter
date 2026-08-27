import { supabase } from '@/lib/supabase'
import type { WaterToken } from '@/types'

// Format token code cleanly into 3 blocks of 4 digits: "4829 1736 2041"
export function generateTokenCode(): string {
  const p1 = Math.floor(1000 + Math.random() * 9000).toString()
  const p2 = Math.floor(1000 + Math.random() * 9000).toString()
  const p3 = Math.floor(1000 + Math.random() * 9000).toString()
  return `${p1} ${p2} ${p3}`
}

export function normalizeTokenCode(code: string): string {
  return code.replace(/[\s-]/g, '').trim()
}

// Local mock store for instant demo fallback if DB table is not yet linked
const DEMO_TOKENS_STORAGE_KEY = 'safewater_demo_tokens'

function getLocalTokens(): WaterToken[] {
  try {
    const raw = localStorage.getItem(DEMO_TOKENS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return []
}

function saveLocalTokens(tokens: WaterToken[]) {
  try {
    localStorage.setItem(DEMO_TOKENS_STORAGE_KEY, JSON.stringify(tokens))
  } catch {
    // ignore
  }
}

export async function fetchCustomerTokens(customerId: string): Promise<WaterToken[]> {
  try {
    const { data, error } = await supabase
      .from('water_tokens' as any)
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (data && data.length > 0) return data as unknown as WaterToken[]
  } catch {
    // fall through to local demo store
  }

  const local = getLocalTokens().filter((t) => t.customer_id === customerId)
  if (local.length === 0) {
    // Provide a nice default completed demo token for a rich UI experience
    const initialDemo: WaterToken = {
      id: 'demo-token-1',
      token_code: '4829 1736 2041',
      customer_id: customerId,
      meter_id: 'default-meter',
      allocated_litres: 5000,
      remaining_litres: 0,
      consumed_litres: 5000,
      amount: 8315,
      tax: 416,
      total: 8731,
      status: 'completed',
      payment_reference: 'DEMO-TX-84920',
      payment_method: 'demo_payment',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      activated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      expires_at: new Date(Date.now() + 27 * 86400000).toISOString(),
      completed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    }
    saveLocalTokens([initialDemo])
    return [initialDemo]
  }
  return local
}

export async function fetchActiveToken(customerId: string): Promise<WaterToken | null> {
  try {
    const { data, error } = await supabase
      .from('water_tokens' as any)
      .select('*')
      .eq('customer_id', customerId)
      .eq('status', 'active')
      .maybeSingle()

    if (error) throw error
    if (data) return data as unknown as WaterToken
  } catch {
    // local fallback
  }

  const local = getLocalTokens().find((t) => t.customer_id === customerId && t.status === 'active')
  return local ?? null
}

export interface CreateTokenParams {
  customerId: string
  meterId: string
  allocatedLitres: number
  tariff?: number
  taxRate?: number
  paymentMethod?: string
}

export async function createWaterToken({
  customerId,
  meterId,
  allocatedLitres,
  tariff = 1.663, // Real Tanzania DAWASA / EWURA rate: TSh 1.663 per Litre
  taxRate = 0.05, // 5% tax
  paymentMethod = 'demo_payment',
}: CreateTokenParams): Promise<WaterToken> {
  const tokenCode = generateTokenCode()
  const amount = Math.round(allocatedLitres * tariff)
  const tax = Math.round(amount * taxRate)
  const total = amount + tax
  const ref = `DEMO-${Date.now().toString(36).toUpperCase()}`

  const payload: Omit<WaterToken, 'id'> = {
    token_code: tokenCode,
    customer_id: customerId,
    meter_id: meterId,
    allocated_litres: allocatedLitres,
    remaining_litres: allocatedLitres,
    consumed_litres: 0,
    amount,
    tax,
    total,
    status: 'ready',
    payment_reference: ref,
    payment_method: paymentMethod,
    created_at: new Date().toISOString(),
    activated_at: null,
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    completed_at: null,
    updated_at: new Date().toISOString(),
  }

  try {
    const { data, error } = await supabase
      .from('water_tokens' as any)
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    if (data) return data as unknown as WaterToken
  } catch {
    // local fallback
  }

  const newLocalToken: WaterToken = {
    ...payload,
    id: `local-token-${Date.now()}`,
  }
  const all = getLocalTokens()
  saveLocalTokens([newLocalToken, ...all])
  return newLocalToken
}

export async function activateWaterToken(tokenCode: string, customerId: string): Promise<{ token: WaterToken; sessionId: string }> {
  const normInput = normalizeTokenCode(tokenCode)

  let targetToken: WaterToken | null = null

  // 1. Try DB
  try {
    const { data, error } = await supabase
      .from('water_tokens' as any)
      .select('*')
      .eq('customer_id', customerId)
      .in('status', ['ready', 'paid'])
      .order('created_at', { ascending: false })

    if (!error && data) {
      targetToken = (data as unknown as WaterToken[]).find((t) => normalizeTokenCode(t.token_code) === normInput) ?? null
    }
  } catch {
    // fallback
  }

  if (!targetToken) {
    const local = getLocalTokens()
    targetToken = local.find(
      (t) => t.customer_id === customerId && (t.status === 'ready' || t.status === 'paid') && normalizeTokenCode(t.token_code) === normInput,
    ) ?? null
  }

  if (!targetToken) {
    throw new Error('Token not found, already consumed, or does not belong to this account.')
  }

  // Deactivate any currently active tokens first
  try {
    await supabase
      .from('water_tokens' as any)
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('customer_id', customerId)
      .eq('status', 'active')
  } catch {
    // ignore
  }

  // Mark this token active
  const now = new Date().toISOString()
  targetToken.status = 'active'
  targetToken.activated_at = now
  targetToken.updated_at = now

  try {
    await supabase
      .from('water_tokens' as any)
      .update({ status: 'active', activated_at: now })
      .eq('id', targetToken.id)
  } catch {
    // local
  }

  // Issue OPEN valve command
  try {
    await supabase.from('valve_commands').insert({
      meter_id: targetToken.meter_id,
      command: 'OPEN',
      status: 'pending',
    })
  } catch {
    // ignore
  }

  // Create active water session
  const sessionId = `session-${Date.now()}`
  try {
    const { data: sessionData } = await supabase
      .from('water_sessions' as any)
      .insert({
        token_id: targetToken.id,
        customer_id: customerId,
        meter_id: targetToken.meter_id,
        started_at: now,
        starting_reading: 0,
        allocated_litres: targetToken.allocated_litres,
        consumed_litres: 0,
        status: 'active',
      })
      .select('id')
      .single()

    if (sessionData) {
      return { token: targetToken, sessionId: (sessionData as any).id }
    }
  } catch {
    // local
  }

  // Update local store
  const localTokens = getLocalTokens().map((t) => (t.id === targetToken!.id ? targetToken! : t))
  saveLocalTokens(localTokens)

  return { token: targetToken, sessionId }
}

export async function fetchAllTokens(limit = 50): Promise<WaterToken[]> {
  try {
    const { data, error } = await supabase
      .from('water_tokens' as any)
      .select('*, customers(customer_number, profiles(first_name, last_name)), smart_meters(meter_serial)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    if (data && data.length > 0) return data as unknown as WaterToken[]
  } catch {
    // fallback
  }

  return getLocalTokens()
}
