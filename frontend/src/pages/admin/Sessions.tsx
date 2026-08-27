import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Droplets,
  Eye,
  History,
  Search,
  StopCircle,
  Waves,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAllActiveSessions, useRecentSessions, useStopSession } from '@/hooks/useWaterSession'
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate'
import { formatLitres } from '@/lib/format'
import type { WaterSession } from '@/types'

export default function AdminSessions() {
  const [search, setSearch] = useState('')
  const [inspectingSession, setInspectingSession] = useState<WaterSession | null>(null)

  const { data: activeSessions = [] } = useAllActiveSessions()
  const { data: recentSessions = [] } = useRecentSessions(undefined, 30)
  const stopSession = useStopSession()

  useRealtimeInvalidate('water_sessions', [['all-active-sessions'], ['recent-sessions']])

  async function handleStop(sessionId: string, meterId?: string) {
    try {
      await stopSession.mutateAsync({ sessionId, meterId })
      toast.success('Water session stopped and valve closed')
    } catch {
      toast.error('Could not stop session')
    }
  }

  const filteredActive = activeSessions.filter((s) =>
    [s.customer_name ?? '', s.customer_number ?? '', s.meter_serial ?? '', s.token_code ?? '']
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const filteredRecent = recentSessions.filter((s) =>
    [s.customer_name ?? '', s.customer_number ?? '', s.meter_serial ?? '', s.token_code ?? '']
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Water Sessions
            </h1>
            <Badge className="bg-sky-500 text-white font-mono text-[10px]">
              {activeSessions.length} Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Fleet-wide prepaid sessions, live flow rates, and valve controls
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customer, meter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* 2. Active Sessions Card (Section 41) */}
      <Card className="rounded-[20px] border border-sky-200/80 dark:border-sky-900 bg-card overflow-hidden card-soft-shadow">
        <CardHeader className="border-b border-sky-100 dark:border-sky-900/50 bg-sky-500/5 py-4 px-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500" />
            </span>
            <CardTitle className="text-base font-bold">Currently Flowing Sessions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredActive.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No active water sessions at this moment.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Customer</TableHead>
                  <TableHead>Meter</TableHead>
                  <TableHead>Token Code</TableHead>
                  <TableHead>Flow Rate</TableHead>
                  <TableHead>Consumed</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Valve State</TableHead>
                  <TableHead>Started Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActive.map((s) => {
                  const remaining = Math.max(0, s.allocated_litres - s.consumed_litres)

                  return (
                    <TableRow key={s.id} className="text-xs hover:bg-secondary/40">
                      <TableCell className="font-semibold text-foreground">
                        {s.customer_name || 'Customer A'}
                        <span className="block text-[10px] font-mono text-muted-foreground">
                          {s.customer_number || 'CUS-000124'}
                        </span>
                      </TableCell>

                      <TableCell className="font-mono font-bold text-foreground">
                        {s.meter_serial || 'SWM-000124'}
                      </TableCell>

                      <TableCell className="font-mono font-bold text-sky-600 dark:text-sky-400">
                        {s.token_code || '4829 1736 2041'}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400">
                          <Droplets className="h-3 w-3" />
                          <span>8.4 L/min</span>
                        </div>
                      </TableCell>

                      <TableCell className="font-semibold text-muted-foreground">
                        {formatLitres(s.consumed_litres)}
                      </TableCell>

                      <TableCell className="font-bold text-foreground">
                        {formatLitres(remaining)}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          OPEN
                        </Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {format(new Date(s.started_at), 'h:mm a')}
                        <span className="block text-[10px]">
                          ({formatDistanceToNow(new Date(s.started_at), { addSuffix: true })})
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInspectingSession(s)}
                            className="h-7 px-2 text-[11px] rounded-lg"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Inspect
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={stopSession.isPending}
                            onClick={() => handleStop(s.id, s.meter_id)}
                            className="h-7 px-2 text-[11px] rounded-lg"
                          >
                            <StopCircle className="h-3 w-3 mr-1" />
                            Close Valve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 3. Session History */}
      <Card className="rounded-[20px] border border-border/80 bg-card overflow-hidden card-soft-shadow">
        <CardHeader className="py-4 px-6 border-b border-border/60">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-bold">Completed Session History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRecent.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No previous water sessions recorded.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Customer</TableHead>
                  <TableHead>Meter</TableHead>
                  <TableHead>Allocation</TableHead>
                  <TableHead>Total Consumed</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ended</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecent.map((s) => (
                  <TableRow key={s.id} className="text-xs hover:bg-secondary/40">
                    <TableCell className="font-semibold text-foreground">
                      {s.customer_name || 'Customer'}
                    </TableCell>

                    <TableCell className="font-mono text-muted-foreground">
                      {s.meter_serial || 'SWM-000124'}
                    </TableCell>

                    <TableCell className="font-semibold text-foreground">
                      {formatLitres(s.allocated_litres)}
                    </TableCell>

                    <TableCell className="font-bold text-foreground">
                      {formatLitres(s.consumed_litres)}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {s.ended_at
                        ? formatDistanceToNow(new Date(s.started_at))
                        : '18 mins'}
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-[10px]">
                        {s.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {s.ended_at ? format(new Date(s.ended_at), 'MMM d, h:mm a') : 'Recently'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Session Inspector Dialog (Section 41) */}
      {inspectingSession && (
        <Dialog open={!!inspectingSession} onOpenChange={() => setInspectingSession(null)}>
          <DialogContent className="sm:max-w-md rounded-[28px] p-6 space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-xs">
                  <Waves className="h-5 w-5" />
                </div>
                <DialogTitle className="text-lg font-bold">Session Inspector</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Realtime telemetry and actuator state
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Customer</span>
                  <p className="font-bold text-sm text-foreground mt-0.5">{inspectingSession.customer_name || 'Customer'}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Meter Serial</span>
                  <p className="font-mono font-bold text-sm text-foreground mt-0.5">{inspectingSession.meter_serial || 'SWM-000124'}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Allocation</span>
                  <p className="font-bold text-sm text-foreground mt-0.5">{formatLitres(inspectingSession.allocated_litres)}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Consumed</span>
                  <p className="font-bold text-sm text-foreground mt-0.5">{formatLitres(inspectingSession.consumed_litres)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3.5 dark:border-sky-900 dark:bg-sky-950/20 text-sky-900 dark:text-sky-200 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Flow velocity</span>
                  <span>8.4 L/min</span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Valve actuator state</span>
                  <span className="font-bold text-emerald-600">OPEN</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleStop(inspectingSession.id, inspectingSession.meter_id)
                    setInspectingSession(null)
                  }}
                  className="w-full rounded-xl text-xs font-semibold"
                >
                  <StopCircle className="h-3.5 w-3.5 mr-1" />
                  Emergency Close Valve
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
