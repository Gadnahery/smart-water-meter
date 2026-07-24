import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAllBills, fetchAllPayments, generateBill, updateBillStatus, type GenerateBillInput } from '@/services/adminBilling'
import type { BillStatus } from '@/types'

export function useAllBills() {
  return useQuery({ queryKey: ['admin-bills'], queryFn: fetchAllBills })
}

export function useAllPayments() {
  return useQuery({ queryKey: ['admin-payments'], queryFn: fetchAllPayments })
}

export function useBillMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-bills'] })

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BillStatus }) => updateBillStatus(id, status),
    onSuccess: invalidate,
  })

  const generate = useMutation({
    mutationFn: (input: GenerateBillInput) => generateBill(input),
    onSuccess: invalidate,
  })

  return { setStatus, generate }
}
