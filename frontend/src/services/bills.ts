import { supabase } from '@/lib/supabase'
import type { Bill, Payment, PaymentMethod } from '@/types'

export async function fetchBills(customerId: string): Promise<Bill[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('customer_id', customerId)
    .order('billing_year', { ascending: false })
    .order('billing_month', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function fetchPayments(customerId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('customer_id', customerId)
    .order('paid_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Demo/mock payment only - there is no real payment gateway. This records a
 * 'completed' payment instantly; no money actually moves anywhere.
 */
export async function payBillMock(bill: Bill, customerId: string, method: PaymentMethod) {
  const { error } = await supabase.from('payments').insert({
    bill_id: bill.id,
    customer_id: customerId,
    amount: bill.total,
    payment_method: method,
    transaction_reference: `DEMO-${Date.now()}`,
    payment_status: 'completed',
  })
  if (error) throw error
}
