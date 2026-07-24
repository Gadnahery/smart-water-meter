import { useEffect } from 'react'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Subscribes to Postgres change events (spec sections 38/56) for a table
 * and invalidates the given React Query keys whenever a row changes, so
 * open pages reflect updates (e.g. from another user, or the ESP32
 * ingestion function) without a manual refresh.
 */
export function useRealtimeInvalidate(table: string, queryKeys: QueryKey[], filter?: string, enabled = true) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel(`realtime:${table}:${filter ?? 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        () => {
          for (const key of queryKeys) {
            queryClient.invalidateQueries({ queryKey: key })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, enabled])
}
