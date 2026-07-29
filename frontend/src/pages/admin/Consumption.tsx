import { formatDistanceToNow } from 'date-fns'
import { BarChart3, Droplet } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/empty/EmptyState'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import { useMeterConsumptionSummary } from '@/hooks/useAdminConsumption'
import { ConsumptionOverview } from '@/components/charts/ConsumptionOverview'
import { formatLitres } from '@/lib/format'

export default function Consumption() {
  const { series } = useAdminDashboard()
  const { data: rows = [], isLoading } = useMeterConsumptionSummary()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Consumption</h1>
        <p className="text-sm text-muted-foreground">System-wide usage, drilled down by meter</p>
      </div>

      <ConsumptionOverview data={series} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={BarChart3} title="No meters yet" description="Consumption breakdown appears once meters are registered." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meter</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Today</TableHead>
                <TableHead>This month</TableHead>
                <TableHead>Latest flow rate</TableHead>
                <TableHead>Last reading</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.meter_id}>
                  <TableCell className="font-medium">{row.meter_serial}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.customer_name} <span className="text-xs">({row.customer_number})</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatLitres(row.today_consumption)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatLitres(row.month_consumption)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.latest_flow_rate != null ? (
                      <span className="flex items-center gap-1">
                        <Droplet className="h-3.5 w-3.5" />
                        {row.latest_flow_rate} L/min
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.latest_reading_time
                      ? formatDistanceToNow(new Date(row.latest_reading_time), { addSuffix: true })
                      : 'Never'}
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
