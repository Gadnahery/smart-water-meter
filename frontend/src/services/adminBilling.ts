import { supabase } from '@/lib/supabase'
import type { BillStatus, PaymentMethod, PaymentStatus } from '@/types'

export interface AdminBillRow {
  id: string
  customer_id: string
  billing_month: number
  billing_year: number
  consumption: number
  amount: number
  tax: number
  discount: number
  total: number
  due_date: string
  status: BillStatus
  generated_at: string
  customer_number: string
  customer_name: string
}

export async function fetchAllBills(): Promise<AdminBillRow[]> {
  const { data, error } = await supabase
    .from('bills')
    .select(
      'id, customer_id, billing_month, billing_year, consumption, amount, tax, discount, total, due_date, status, generated_at, customers(customer_number, profiles(first_name, last_name))',
    )
    .order('generated_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const customer = row.customers as unknown as {
      customer_number: string
      profiles: { first_name: string; last_name: string } | null
    } | null

    return {
      id: row.id,
      customer_id: row.customer_id,
      billing_month: row.billing_month,
      billing_year: row.billing_year,
      consumption: row.consumption,
      amount: row.amount,
      tax: row.tax,
      discount: row.discount,
      total: row.total,
      due_date: row.due_date,
      status: row.status,
      generated_at: row.generated_at,
      customer_number: customer?.customer_number ?? '',
      customer_name: customer?.profiles ? `${customer.profiles.first_name} ${customer.profiles.last_name}` : 'Unknown',
    }
  })
}

export async function updateBillStatus(id: string, status: BillStatus) {
  const { error } = await supabase.from('bills').update({ status }).eq('id', id)
  if (error) throw error
}

export interface GenerateBillInput {
  customer_id: string
  billing_month: number
  billing_year: number
  consumption: number
}

export async function generateBill(input: GenerateBillInput) {
  const { data: settings, error: settingsError } = await supabase
    .from('system_settings')
    .select('water_tariff')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (settingsError) throw settingsError

  const tariff = settings?.water_tariff ?? 0
  const amount = Math.round(input.consumption * tariff * 100) / 100
  const tax = Math.round(amount * 0.05 * 100) / 100
  const dueDate = new Date(input.billing_year, input.billing_month, 15)

  const { error } = await supabase.from('bills').insert({
    customer_id: input.customer_id,
    billing_month: input.billing_month,
    billing_year: input.billing_year,
    consumption: input.consumption,
    amount,
    tax,
    discount: 0,
    total: amount + tax,
    due_date: dueDate.toISOString().slice(0, 10),
    status: 'pending',
  })
  if (error) throw error
}

export interface AdminPaymentRow {
  id: string
  amount: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  transaction_reference: string | null
  paid_at: string
  customer_number: string
  customer_name: string
  billing_period: string
}

export async function fetchAllPayments(): Promise<AdminPaymentRow[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(
      'id, amount, payment_method, payment_status, transaction_reference, paid_at, customers(customer_number, profiles(first_name, last_name)), bills(billing_month, billing_year)',
    )
    .order('paid_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const customer = row.customers as unknown as {
      customer_number: string
      profiles: { first_name: string; last_name: string } | null
    } | null
    const bill = row.bills as unknown as { billing_month: number; billing_year: number } | null

    return {
      id: row.id,
      amount: row.amount,
      payment_method: row.payment_method,
      payment_status: row.payment_status,
      transaction_reference: row.transaction_reference,
      paid_at: row.paid_at,
      customer_number: customer?.customer_number ?? '',
      customer_name: customer?.profiles ? `${customer.profiles.first_name} ${customer.profiles.last_name}` : 'Unknown',
      billing_period: bill ? `${bill.billing_month}/${bill.billing_year}` : '',
    }
  })
}
