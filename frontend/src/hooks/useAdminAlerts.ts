import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAlerts, setAlertStatus } from '@/services/adminAlerts'
import type { AlertStatus } from '@/types'

export function useAlerts() {
  return useQuery({ queryKey: ['admin-alerts'], queryFn: fetchAlerts })
}

export function useAlertMutations() {
  const queryClient = useQueryClient()

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AlertStatus }) => setAlertStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-counts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-recent-alerts'] })
    },
  })

  return { setStatus }
}
