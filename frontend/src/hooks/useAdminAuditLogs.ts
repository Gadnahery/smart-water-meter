import { useQuery } from '@tanstack/react-query'
import { fetchAuditLogs } from '@/services/adminAuditLogs'

export function useAuditLogs() {
  return useQuery({ queryKey: ['admin-audit-logs'], queryFn: () => fetchAuditLogs(100) })
}
