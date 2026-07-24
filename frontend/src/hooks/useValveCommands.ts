import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchLatestValveCommands, sendValveCommand } from '@/services/valveCommands'
import { useAuth } from '@/hooks/useAuth'
import type { ValveCommandType } from '@/types'

export function useLatestValveCommands() {
  return useQuery({ queryKey: ['latest-valve-commands'], queryFn: fetchLatestValveCommands })
}

export function useSendValveCommand() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ meterId, command }: { meterId: string; command: ValveCommandType }) =>
      sendValveCommand(meterId, command, profile!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['latest-valve-commands'] }),
  })
}
