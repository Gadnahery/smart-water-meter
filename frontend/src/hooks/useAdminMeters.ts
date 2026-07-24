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
  return useQuery({ queryKey: ['admin-meters'], queryFn: fetchMeters })
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
