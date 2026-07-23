import { useQuery } from '@tanstack/react-query'
import { fetchLatestReading, fetchPrimaryMeter } from '@/services/meters'

export function useMeter(customerId: string | undefined) {
  return useQuery({
    queryKey: ['meter', customerId],
    enabled: !!customerId,
    queryFn: () => fetchPrimaryMeter(customerId!),
  })
}

export function useLatestReading(meterId: string | undefined) {
  return useQuery({
    queryKey: ['latest-reading', meterId],
    enabled: !!meterId,
    queryFn: () => fetchLatestReading(meterId!),
  })
}
