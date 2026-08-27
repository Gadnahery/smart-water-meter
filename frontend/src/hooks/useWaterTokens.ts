import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activateWaterToken,
  createWaterToken,
  fetchAllTokens,
  fetchCustomerTokens,
  fetchActiveToken,
  type CreateTokenParams,
} from '@/services/waterTokens'

export function useCustomerTokens(customerId?: string) {
  return useQuery({
    queryKey: ['customer-tokens', customerId],
    enabled: !!customerId,
    queryFn: () => fetchCustomerTokens(customerId!),
    refetchInterval: 10_000,
  })
}

export function useActiveToken(customerId?: string) {
  return useQuery({
    queryKey: ['active-token', customerId],
    enabled: !!customerId,
    queryFn: () => fetchActiveToken(customerId!),
    refetchInterval: 5_000,
  })
}

export function useCreateToken() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: CreateTokenParams) => createWaterToken(params),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['customer-tokens', params.customerId] })
      queryClient.invalidateQueries({ queryKey: ['all-tokens'] })
    },
  })
}

export function useActivateToken() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tokenCode, customerId }: { tokenCode: string; customerId: string }) =>
      activateWaterToken(tokenCode, customerId),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customer-tokens', customerId] })
      queryClient.invalidateQueries({ queryKey: ['active-token', customerId] })
      queryClient.invalidateQueries({ queryKey: ['active-session', customerId] })
      queryClient.invalidateQueries({ queryKey: ['all-tokens'] })
      queryClient.invalidateQueries({ queryKey: ['all-active-sessions'] })
    },
  })
}

export function useAllTokens(limit = 50) {
  return useQuery({
    queryKey: ['all-tokens', limit],
    queryFn: () => fetchAllTokens(limit),
    refetchInterval: 15_000,
  })
}
