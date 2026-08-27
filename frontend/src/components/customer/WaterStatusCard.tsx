import { motion } from 'framer-motion'
import { KeyRound, Plus, Waves } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CircularGauge } from '@/components/charts/CircularGauge'
import { FlowIndicator } from '@/components/ui/FlowIndicator'
import { formatLitres } from '@/lib/format'
import type { WaterToken } from '@/types'

interface WaterStatusCardProps {
  activeToken?: WaterToken | null
  flowRate?: number | null
  isFlowing?: boolean
  todayLitres?: number
  onGetWater: () => void
  onEnterToken: () => void
  onOpenWaterCenter: () => void
}

export function WaterStatusCard({
  activeToken,
  flowRate = 8.4,
  isFlowing = false,
  onGetWater,
  onEnterToken,
  onOpenWaterCenter,
}: WaterStatusCardProps) {
  const hasActiveToken = !!activeToken
  const remainingLitres = activeToken?.remaining_litres ?? 0
  const allocatedLitres = activeToken?.allocated_litres ?? 5000
  const pctRemaining = allocatedLitres > 0 ? (remainingLitres / allocatedLitres) * 100 : 0

  return (
    <Card className="overflow-hidden rounded-[28px] border border-border/80 bg-card card-soft-shadow">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left / Center visual: Circular Gauge */}
          <div className="w-full md:w-auto flex justify-center">
            {hasActiveToken ? (
              <CircularGauge
                value={remainingLitres}
                max={allocatedLitres}
                size={230}
                strokeWidth={18}
                unit="L"
                label="Water remaining"
                sublabel={isFlowing ? `● Water flowing ${flowRate ?? 8.4} L/min` : 'Valve open'}
                isFlowing={isFlowing}
                flowRate={flowRate ?? 8.4}
                color="water"
              />
            ) : (
              <div className="relative flex flex-col items-center justify-center p-6 text-center">
                <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-tr from-sky-100 to-cyan-50 dark:from-sky-950/60 dark:to-cyan-950/30">
                  <motion.div
                    animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  >
                    <Waves className="h-16 w-16 text-sky-500/80" />
                  </motion.div>
                </div>
                <span className="mt-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Standby Mode
                </span>
              </div>
            )}
          </div>

          {/* Right side content */}
          <div className="w-full md:flex-1 space-y-4">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  {hasActiveToken ? 'Active Water Session' : 'Water Available'}
                </span>
                {hasActiveToken && (
                  <FlowIndicator status={isFlowing ? 'flowing' : 'closed'} flowRate={flowRate} />
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {hasActiveToken
                  ? `${formatLitres(remainingLitres)} remaining`
                  : 'No active water session'}
              </h2>

              <p className="text-sm text-muted-foreground">
                {hasActiveToken
                  ? `${pctRemaining.toFixed(1)}% of your ${formatLitres(allocatedLitres)} allocation. Token ${activeToken.token_code}.`
                  : 'Tap Get Water to instantly allocate fresh prepaid water with automatic valve management.'}
              </p>
            </div>

            {/* Quick status bar when active */}
            {hasActiveToken && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Usage progress</span>
                  <span>{formatLitres(activeToken.consumed_litres)} used</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, 100 - pctRemaining))}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              {hasActiveToken ? (
                <Button
                  onClick={onOpenWaterCenter}
                  className="h-12 flex-1 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/25"
                >
                  <Waves className="h-4 w-4 mr-2" />
                  Open Water Center
                </Button>
              ) : (
                <Button
                  onClick={onGetWater}
                  className="h-12 flex-1 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/25"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Get Water
                </Button>
              )}

              <Button
                variant="outline"
                onClick={onEnterToken}
                className="h-12 rounded-2xl border-border/80 hover:bg-secondary font-semibold text-sm"
              >
                <KeyRound className="h-4 w-4 mr-2 text-muted-foreground" />
                Enter Token
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
