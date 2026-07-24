import { format } from 'date-fns'
import { ScrollText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/empty/EmptyState'
import { useAuditLogs } from '@/hooks/useAdminAuditLogs'

const actionTone: Record<string, 'default' | 'secondary' | 'destructive'> = {
  INSERT: 'default',
  UPDATE: 'secondary',
  DELETE: 'destructive',
}

export default function AuditLogs() {
  const { data: logs = [], isLoading } = useAuditLogs()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Audit logs</h1>
        <p className="text-sm text-muted-foreground">Most recent {logs.length} admin actions</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No activity yet" description="Admin actions will be logged here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant={actionTone[log.action] ?? 'secondary'}>{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.table_name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.record_id?.slice(0, 8)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.actor_name ?? 'System'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(log.created_at), 'MMM d, yyyy, h:mm a')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
