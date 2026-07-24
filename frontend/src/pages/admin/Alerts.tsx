import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/empty/EmptyState'
import { useAlertMutations, useAlerts } from '@/hooks/useAdminAlerts'
import type { AlertStatus } from '@/types'

const severityTone: Record<string, 'secondary' | 'outline' | 'destructive'> = {
  low: 'secondary',
  medium: 'outline',
  high: 'destructive',
  critical: 'destructive',
}

const statusTone: Record<AlertStatus, 'destructive' | 'secondary' | 'outline'> = {
  active: 'destructive',
  acknowledged: 'secondary',
  resolved: 'outline',
}

const filterTabs = ['active', 'acknowledged', 'resolved', 'all'] as const

export default function Alerts() {
  const { data: alerts = [], isLoading } = useAlerts()
  const { setStatus } = useAlertMutations()
  const [filter, setFilter] = useState<(typeof filterTabs)[number]>('active')

  const filtered = useMemo(
    () => (filter === 'all' ? alerts : alerts.filter((a) => a.status === filter)),
    [alerts, filter],
  )

  async function updateStatus(id: string, status: AlertStatus) {
    try {
      await setStatus.mutateAsync({ id, status })
      toast.success(`Alert marked ${status}`)
    } catch (error) {
      toast.error('Could not update alert', { description: error instanceof Error ? error.message : undefined })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Alerts</h1>
          <p className="text-sm text-muted-foreground">{alerts.length} total</p>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as (typeof filterTabs)[number])}>
          <TabsList>
            {filterTabs.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="capitalize">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title={`No ${filter === 'all' ? '' : filter} alerts`}
          description="Alerts appear here as meters report issues."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Meter / Customer</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <p className="font-medium capitalize text-foreground">{alert.alert_type.replace('_', ' ')}</p>
                    {alert.description && (
                      <p className="max-w-xs truncate text-xs text-muted-foreground">{alert.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <p>{alert.meter_serial}</p>
                    {alert.customer_name && (
                      <p className="text-xs">
                        {alert.customer_name} ({alert.customer_number})
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={severityTone[alert.severity]} className="capitalize">
                      {alert.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusTone[alert.status]} className="capitalize">
                      {alert.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    {alert.status === 'active' && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => updateStatus(alert.id, 'acknowledged')}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => updateStatus(alert.id, 'resolved')}>
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        </Button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => updateStatus(alert.id, 'resolved')}>
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => updateStatus(alert.id, 'active')}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {alert.status === 'resolved' && (
                      <Button variant="ghost" size="icon" onClick={() => updateStatus(alert.id, 'active')}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
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
