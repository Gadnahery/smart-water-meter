import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMeter,
  deleteMeter,
  fetchCustomerOptions,
  fetchMeters,
  regenerateDeviceApiKey,
  updateMeter,
  type MeterFormValues,
} from '@/services/adminMeters'

export function useMeters() {
  // See useMeter.ts: online/offline is derived client-side from
  // last_seen recency, so this needs a periodic refetch to notice a
  // device going quiet even when no new DB row arrives to trigger a
  // realtime invalidation.
  return useQuery({ queryKey: ['admin-meters'], queryFn: fetchMeters, refetchInterval: 30_000 })
}

export function useCustomerOptions() {
  return useQuery({ queryKey: ['admin-customer-options'], queryFn: fetchCustomerOptions })
}

export function useMeterMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-meters'] })
    queryClient.invalidateQueries({ queryKey: ['admin-counts'] })
  }

  const create = useMutation({
    mutationFn: (values: MeterFormValues) => createMeter(values),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: MeterFormValues }) => updateMeter(id, values),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteMeter(id),
    onSuccess: invalidate,
  })

  const regenerateApiKey = useMutation({
    mutationFn: (id: string) => regenerateDeviceApiKey(id),
    onSuccess: invalidate,
  })

  return { create, update, remove, regenerateApiKey }
}
