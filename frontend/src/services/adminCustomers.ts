import { supabase } from '@/lib/supabase'
import type { AccountStatus } from '@/types'

export interface CustomerRow {
  id: string
  profile_id: string
  customer_number: string
  national_id: string | null
  address: string | null
  account_status: AccountStatus
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  meter_serial: string | null
}

export async function fetchCustomers(): Promise<CustomerRow[]> {
  const { data, error } = await supabase
    .from('customers')
    .select(
      'id, profile_id, customer_number, national_id, address, account_status, created_at, profiles(first_name, last_name, email, phone), smart_meters!smart_meters_customer_id_fkey(meter_serial)',
    )
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const profile = row.profiles as unknown as {
      first_name: string
      last_name: string
      email: string
      phone: string | null
    } | null
    const meters = row.smart_meters as unknown as { meter_serial: string }[] | null

    return {
      id: row.id,
      profile_id: row.profile_id,
      customer_number: row.customer_number,
      national_id: row.national_id,
      address: row.address,
      account_status: row.account_status,
      created_at: row.created_at,
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? null,
      meter_serial: meters?.[0]?.meter_serial ?? null,
    }
  })
}

export interface CustomerFormValues {
  first_name: string
  last_name: string
  phone: string | null
  address: string | null
  national_id: string | null
  account_status: AccountStatus
}

export async function updateCustomer(customer: { id: string; profile_id: string }, values: CustomerFormValues) {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ first_name: values.first_name, last_name: values.last_name, phone: values.phone })
    .eq('id', customer.profile_id)
  if (profileError) throw profileError

  const { error: customerError } = await supabase
    .from('customers')
    .update({ address: values.address, national_id: values.national_id, account_status: values.account_status })
    .eq('id', customer.id)
  if (customerError) throw customerError
}
