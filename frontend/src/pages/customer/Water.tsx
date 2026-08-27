import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  KeyRound,
  Plus,
  Waves,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ActiveSessionCard } from '@/components/customer/ActiveSessionCard'
import { WaterTokenCard } from '@/components/customer/WaterTokenCard'
import { GetWaterDialog } from '@/components/dialogs/GetWaterDialog'
import { ActivateTokenDialog } from '@/components/dialogs/ActivateTokenDialog'
import { useAuth } from '@/hooks/useAuth'
import { useLatestReading, useMeter } from '@/hooks/useMeter'
import { useActiveSession, useStopSession } from '@/hooks/useWaterSession'
import { useActiveToken, useCustomerTokens, useActivateToken } from '@/hooks/useWaterTokens'
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate'
import { formatLitres } from '@/lib/format'
import { isMeterOnline } from '@/lib/meterStatus'
import type { WaterToken } from '@/types'

export default function Water() {
  const { customer } = useAuth()
  const [getWaterOpen, setGetWaterOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)

  const { data: meter, isLoading: meterLoading } = useMeter(customer?.id)
  const { data: latestReading } = useLatestReading(meter?.id)
  const { data: activeToken, isLoading: tokenLoading } = useActiveToken(customer?.id)
  const { data: activeSession } = useActiveSession(customer?.id)
  const { data: customerTokens = [] } = useCustomerTokens(customer?.id)

  const stopSession = useStopSession()
  const activateToken = useActivateToken()

  useRealtimeInvalidate('water_tokens', [['active-token', customer?.id], ['customer-tokens', customer?.id]])
  useRealtimeInvalidate('water_sessions', [['active-session', customer?.id]])
  useRealtimeInvalidate('meter_readings', [['latest-reading', meter?.id]])

  const isOnline = isMeterOnline(meter?.last_seen)
  const flowRate = isOnline && latestReading?.flow_rate != null ? Number(latestReading.flow_rate) : 0

  async function handleEmergencyStop() {
    if (!activeSession && !activeToken) return
    try {
      if (activeSession) {
        await stopSession.mutateAsync({
          sessionId: activeSession.id,
          meterId: meter?.id,
        })
      }
      toast.success('Water session stopped', {
        description: 'Valve has been safely closed and session completed.',
      })
    } catch (error) {
      toast.error('Could not stop water session', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  async function handleActivateToken(token: WaterToken) {
    if (!customer) return
    try {
      await activateToken.mutateAsync({
        tokenCode: token.token_code,
        customerId: customer.id,
      })
      toast.success('Token activated! Valve is open.', {
        description: `Now dispensing ${formatLitres(token.allocated_litres)}`,
      })
    } catch (error) {
      toast.error('Could not activate token', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  if (meterLoading || tokenLoading) {
    return (
      <div className="space-y-6 pb-10">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-72 rounded-[28px]" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header section (Section 19) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Water
          </h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Your smart meter:</span>
            <strong className="font-mono text-foreground">{meter?.meter_serial ?? 'SWM-000124'}</strong>
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setGetWaterOpen(true)}
            className="rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/25"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Get Water
          </Button>

          <Button
            variant="outline"
            onClick={() => setActivateOpen(true)}
            className="rounded-2xl border-border/80 font-semibold text-sm hover:bg-secondary"
          >
            <KeyRound className="h-4 w-4 mr-1.5 text-muted-foreground" />
            Activate Code
          </Button>
        </div>
      </div>

      {/* Main Active Session or Inactive State */}
      <AnimatePresence mode="wait">
        {activeToken ? (
          <motion.div
            key="active-session"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ActiveSessionCard
              token={activeToken}
              session={activeSession}
              flowRate={flowRate}
              meterSerial={meter?.meter_serial ?? 'SWM-000124'}
              onStopSession={handleEmergencyStop}
              isStopping={stopSession.isPending}
            />
          </motion.div>
        ) : (
          <motion.div
            key="inactive-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="rounded-[28px] border border-border/80 p-8 text-center bg-card card-soft-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-500 dark:bg-sky-950/60 dark:text-sky-400 mb-4 shadow-xs">
                <Waves className="h-8 w-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                No active water session
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Your valve is closed. Tap below to get a prepaid water allocation and open your smart meter valve.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                <Button
                  onClick={() => setGetWaterOpen(true)}
                  className="w-full h-12 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-base shadow-lg shadow-sky-600/25"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Get Water
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActivateOpen(true)}
                  className="w-full h-12 rounded-2xl border-border/80 font-semibold"
                >
                  <KeyRound className="h-4 w-4 mr-2 text-muted-foreground" />
                  Enter Token Code
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Water Tokens (Section 19) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-foreground">Recent water tokens</h3>
          <span className="text-xs text-muted-foreground">{customerTokens.length} total</span>
        </div>

        {customerTokens.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
            No water tokens yet. Request your first water allocation.
          </div>
        ) : (
          <div className="grid gap-3">
            {customerTokens.map((tok) => (
              <WaterTokenCard
                key={tok.id}
                token={tok}
                meterSerial={meter?.meter_serial ?? 'SWM-000124'}
                onActivate={handleActivateToken}
                isActivating={activateToken.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <GetWaterDialog
        open={getWaterOpen}
        onOpenChange={setGetWaterOpen}
        meterId={meter?.id}
        meterSerial={meter?.meter_serial ?? 'SWM-000124'}
      />
      <ActivateTokenDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
      />
    </div>
  )
}
