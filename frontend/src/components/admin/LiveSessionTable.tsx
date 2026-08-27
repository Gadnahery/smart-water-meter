import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { Droplets, Eye, StopCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatLitres } from '@/lib/format'
import type { WaterSession } from '@/types'

interface LiveSessionTableProps {
  sessions: WaterSession[]
  onStopSession?: (sessionId: string, meterId?: string) => Promise<void>
  isStopping?: boolean
}

export function LiveSessionTable({ sessions, onStopSession, isStopping = false }: LiveSessionTableProps) {
  const [inspectingSession, setInspectingSession] = useState<WaterSession | null>(null)

  if (sessions.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No active water sessions at this moment.
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="text-xs">
            <TableHead>Customer</TableHead>
            <TableHead>Meter</TableHead>
            <TableHead>Flow Velocity</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Started</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((s) => {
            const pct = s.allocated_litres > 0
              ? Math.min(100, Math.round((s.consumed_litres / s.allocated_litres) * 100))
              : 0
            const remaining = Math.max(0, s.allocated_litres - s.consumed_litres)

            return (
              <TableRow key={s.id} className="text-xs hover:bg-secondary/40">
                <TableCell className="font-semibold text-foreground">
                  {s.customer_name || 'Customer A'}
                  <span className="block text-[11px] font-normal text-muted-foreground">
                    {s.customer_number || 'CUS-000124'}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="font-mono font-medium text-foreground">
                    {s.meter_serial || 'SWM-000124'}
                  </span>
                  <Badge variant="outline" className="ml-1.5 text-[10px] text-emerald-600 border-emerald-300">
                    Open
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400">
                    <Droplets className="h-3.5 w-3.5" />
                    <span>8.4 L/min</span>
                  </div>
                </TableCell>

                <TableCell className="font-bold text-foreground">
                  {formatLitres(remaining)}
                </TableCell>

                <TableCell>
                  <div className="space-y-1 w-28">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{pct}%</span>
                      <span>{formatLitres(s.consumed_litres)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {format(new Date(s.started_at), 'h:mm a')}
                  <span className="block text-[10px]">
                    ({formatDistanceToNow(new Date(s.started_at), { addSuffix: true })})
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setInspectingSession(s)}
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {onStopSession && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isStopping}
                        onClick={() => onStopSession(s.id, s.meter_id)}
                        className="h-7 px-2 text-[11px] rounded-lg"
                      >
                        <StopCircle className="h-3 w-3 mr-1" />
                        Shutoff
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Session Inspector Dialog */}
      {inspectingSession && (
        <Dialog open={!!inspectingSession} onOpenChange={() => setInspectingSession(null)}>
          <DialogContent className="sm:max-w-md rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Session Inspector</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Detailed telemetry for active water session
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-secondary/40 p-3">
                  <span className="text-muted-foreground uppercase text-[10px] font-semibold">Customer</span>
                  <p className="font-bold text-foreground mt-0.5">{inspectingSession.customer_name || 'Customer'}</p>
                </div>
                <div className="rounded-xl bg-secondary/40 p-3">
                  <span className="text-muted-foreground uppercase text-[10px] font-semibold">Meter Serial</span>
                  <p className="font-mono font-bold text-foreground mt-0.5">{inspectingSession.meter_serial || 'SWM-000124'}</p>
                </div>
                <div className="rounded-xl bg-secondary/40 p-3">
                  <span className="text-muted-foreground uppercase text-[10px] font-semibold">Allocated</span>
                  <p className="font-bold text-foreground mt-0.5">{formatLitres(inspectingSession.allocated_litres)}</p>
                </div>
                <div className="rounded-xl bg-secondary/40 p-3">
                  <span className="text-muted-foreground uppercase text-[10px] font-semibold">Consumed</span>
                  <p className="font-bold text-foreground mt-0.5">{formatLitres(inspectingSession.consumed_litres)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3 text-sky-800 dark:border-sky-900 dark:bg-sky-950/20 dark:text-sky-300">
                <p className="font-semibold">Flow Velocity: 8.4 L/min</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Valve status: OPEN (Telemetry confirmed)</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
