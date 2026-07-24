import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchCustomers,
  updateCustomer,
  type CustomerFormValues,
  type CustomerRow,
} from '@/services/adminCustomers'

export function useCustomers() {
  return useQuery({ queryKey: ['admin-customers'], queryFn: fetchCustomers })
}

export function useCustomerMutations() {
  const queryClient = useQueryClient()

  const update = useMutation({
    mutationFn: ({ customer, values }: { customer: CustomerRow; values: CustomerFormValues }) =>
      updateCustomer({ id: customer.id, profile_id: customer.profile_id }, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-counts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-recent-customers'] })
    },
  })

  return { update }
}
