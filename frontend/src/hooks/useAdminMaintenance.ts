import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createMaintenanceLog, fetchMaintenanceLogs, type MaintenanceLogInput } from '@/services/adminMaintenance'

export function useMaintenanceLogs(meterId: string | undefined) {
  return useQuery({
    queryKey: ['maintenance-logs', meterId],
    queryFn: () => fetchMaintenanceLogs(meterId!),
    enabled: !!meterId,
  })
}

export function useCreateMaintenanceLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: MaintenanceLogInput) => createMaintenanceLog(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-logs', variables.meter_id] })
    },
  })
}
