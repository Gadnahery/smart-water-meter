import { useQuery } from '@tanstack/react-query'
import { fetchMeterConsumptionSummary } from '@/services/adminConsumption'

export function useMeterConsumptionSummary() {
  return useQuery({ queryKey: ['admin-meter-consumption'], queryFn: fetchMeterConsumptionSummary })
}
