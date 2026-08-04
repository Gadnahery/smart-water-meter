import { useQuery } from '@tanstack/react-query'
import { fetchLatestReading, fetchPrimaryMeter } from '@/services/meters'

export function useMeter(customerId: string | undefined) {
  return useQuery({
    queryKey: ['meter', customerId],
    enabled: !!customerId,
    queryFn: () => fetchPrimaryMeter(customerId!),
    // Online/offline is derived from last_seen recency (see
    // lib/meterStatus.ts) purely on the client, so without a periodic
    // refetch the "Online" badge would only update when some other DB
    // write happens to trigger a realtime invalidation. Refetching every
    // 30s makes a device that just went quiet flip to "Offline" on its
    // own within ~30s, with no new row required.
    refetchInterval: 30_000,
  })
}

export function useLatestReading(meterId: string | undefined) {
  return useQuery({
    queryKey: ['latest-reading', meterId],
    enabled: !!meterId,
    queryFn: () => fetchLatestReading(meterId!),
  })
}
