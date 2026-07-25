import { useQuery } from '@tanstack/react-query'
import { fetchDeviceLogs } from '@/services/adminDeviceLogs'

export function useDeviceLogs(meterId: string | undefined) {
  return useQuery({
    queryKey: ['device-logs', meterId],
    queryFn: () => fetchDeviceLogs(meterId!),
    enabled: !!meterId,
  })
}
