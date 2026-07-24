import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSettings, updateSettings, type SettingsFormValues } from '@/services/adminSettings'

export function useSettings() {
  return useQuery({ queryKey: ['admin-settings'], queryFn: fetchSettings })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: SettingsFormValues }) => updateSettings(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-settings'] }),
  })
}
