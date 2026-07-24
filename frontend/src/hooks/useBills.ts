import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBills, fetchPayments, payBillMock } from '@/services/bills'
import { useAuth } from '@/hooks/useAuth'
import type { Bill, PaymentMethod } from '@/types'

export function useBills() {
  const { customer } = useAuth()
  return useQuery({
    queryKey: ['bills', customer?.id],
    queryFn: () => fetchBills(customer!.id),
    enabled: !!customer,
  })
}

export function usePayments() {
  const { customer } = useAuth()
  return useQuery({
    queryKey: ['payments', customer?.id],
    queryFn: () => fetchPayments(customer!.id),
    enabled: !!customer,
  })
}

export function usePayBill() {
  const { customer } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bill, method }: { bill: Bill; method: PaymentMethod }) => payBillMock(bill, customer!.id, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', customer?.id] })
      queryClient.invalidateQueries({ queryKey: ['payments', customer?.id] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications', customer?.id] })
      queryClient.invalidateQueries({ queryKey: ['all-notifications', customer?.id] })
      queryClient.invalidateQueries({ queryKey: ['recent-notifications', customer?.id] })
    },
  })
}
