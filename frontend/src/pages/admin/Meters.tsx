import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { BatteryMedium, ChevronDown, Loader2, Pencil, Plus, Trash2, Wifi, WifiOff, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/empty/EmptyState'
import { MeterFormDialog } from '@/components/forms/MeterFormDialog'
import { MaintenanceDialog } from '@/components/forms/MaintenanceDialog'
import { useMeterMutations, useMeters } from '@/hooks/useAdminMeters'
import { useLatestValveCommands, useSendValveCommand } from '@/hooks/useValveCommands'
import type { MeterWithCustomer } from '@/services/adminMeters'
import type { ValveCommandType } from '@/types'

const valveCommands: ValveCommandType[] = ['OPEN', 'CLOSE', 'RESET', 'RESTART', 'CALIBRATE', 'UPDATE']

const statusTone: Record<string, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  online: 'default',
  offline: 'destructive',
  maintenance: 'outline',
  disabled: 'secondary',
  fault: 'destructive',
}

export default function Meters() {
  const { data: meters = [], isLoading } = useMeters()
  const { remove } = useMeterMutations()
  const { data: latestCommands = [] } = useLatestValveCommands()
  const sendCommand = useSendValveCommand()

  const [formOpen, setFormOpen] = useState(false)
  const [editingMeter, setEditingMeter] = useState<MeterWithCustomer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MeterWithCustomer | null>(null)
  const [maintenanceMeter, setMaintenanceMeter] = useState<MeterWithCustomer | null>(null)

  async function issueCommand(meterId: string, command: ValveCommandType) {
    try {
      await sendCommand.mutateAsync({ meterId, command })
      toast.success(`${command} command queued`, {
        description: 'It will run the next time the device polls for commands.',
      })
    } catch (error) {
      toast.error('Could not send command', { description: error instanceof Error ? error.message : undefined })
    }
  }

  function openCreate() {
    setEditingMeter(null)
    setFormOpen(true)
  }

  function openEdit(meter: MeterWithCustomer) {
    setEditingMeter(meter)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      toast.success('Meter removed')
      setDeleteTarget(null)
    } catch (error) {
      toast.error('Could not remove meter', { description: error instanceof Error ? error.message : undefined })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Smart meters</h1>
          <p className="text-sm text-muted-foreground">{meters.length} registered</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Register meter
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : meters.length === 0 ? (
        <EmptyState
          icon={WifiOff}
          title="No meters registered yet"
          description="Register your first smart meter to start tracking consumption."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>Last seen</TableHead>
                <TableHead>Valve</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meters.map((meter) => (
                <TableRow key={meter.id}>
                  <TableCell className="font-medium">{meter.meter_serial}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {meter.customer_name ? (
                      <>
                        {meter.customer_name}
                        <span className="ml-1 text-xs">({meter.customer_number})</span>
                      </>
                    ) : (
                      <span className="italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusTone[meter.status] ?? 'secondary'} className="capitalize">
                      {meter.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {meter.battery_level != null ? (
                      <span className="flex items-center gap-1">
                        <BatteryMedium className="h-3.5 w-3.5" />
                        {meter.battery_level}%
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {meter.wifi_signal != null ? (
                      <span className="flex items-center gap-1">
                        <Wifi className="h-3.5 w-3.5" />
                        {meter.wifi_signal} dBm
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {meter.last_seen ? formatDistanceToNow(new Date(meter.last_seen), { addSuffix: true }) : 'Never'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          {latestCommands.find((c) => c.meter_id === meter.id)?.command ?? 'Send command'}
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {valveCommands.map((cmd) => (
                          <DropdownMenuItem key={cmd} onClick={() => issueCommand(meter.id, cmd)}>
                            {cmd}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setMaintenanceMeter(meter)} title="Maintenance">
                      <Wrench className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(meter)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(meter)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <MeterFormDialog open={formOpen} onOpenChange={setFormOpen} meter={editingMeter} />

      <MaintenanceDialog
        open={!!maintenanceMeter}
        onOpenChange={(open) => !open && setMaintenanceMeter(null)}
        meterId={maintenanceMeter?.id ?? null}
        meterSerial={maintenanceMeter?.meter_serial}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {deleteTarget?.meter_serial}?</DialogTitle>
            <DialogDescription>
              This permanently deletes the meter and all of its readings, usage history, and alerts. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>
              {remove.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
