import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAllActiveSessions,
  fetchActiveSession,
  fetchRecentSessions,
  stopWaterSession,
} from '@/services/waterSessions'

export function useActiveSession(customerId?: string) {
  return useQuery({
    queryKey: ['active-session', customerId],
    enabled: !!customerId,
    queryFn: () => fetchActiveSession(customerId!),
    refetchInterval: 3_000, // Poll quickly for live water flow feel
  })
}

export function useRecentSessions(customerId?: string, limit = 20) {
  return useQuery({
    queryKey: ['recent-sessions', customerId, limit],
    queryFn: () => fetchRecentSessions(customerId, limit),
    refetchInterval: 10_000,
  })
}

export function useAllActiveSessions() {
  return useQuery({
    queryKey: ['all-active-sessions'],
    queryFn: () => fetchAllActiveSessions(),
    refetchInterval: 5_000,
  })
}

export function useStopSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, meterId }: { sessionId: string; meterId?: string }) =>
      stopWaterSession(sessionId, meterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-session'] })
      queryClient.invalidateQueries({ queryKey: ['active-token'] })
      queryClient.invalidateQueries({ queryKey: ['customer-tokens'] })
      queryClient.invalidateQueries({ queryKey: ['all-active-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['recent-sessions'] })
    },
  })
}
