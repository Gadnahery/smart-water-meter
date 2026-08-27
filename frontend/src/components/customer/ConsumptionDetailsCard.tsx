import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatLitres } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ConsumptionDetailsCardProps {
  todayUsage?: number
  weekUsage?: number
  monthUsage?: number
  avgDaily?: number
  highestDaily?: number
  lowestDaily?: number
  chartData?: { day: string; val: number }[]
  className?: string
}

export function ConsumptionDetailsCard({
  todayUsage = 142,
  weekUsage = 1250,
  monthUsage = 4850,
  avgDaily = 160,
  highestDaily = 220,
  lowestDaily = 95,
  chartData = [
    { day: 'Mon', val: 140 },
    { day: 'Tue', val: 185 },
    { day: 'Wed', val: 120 },
    { day: 'Thu', val: 220 },
    { day: 'Fri', val: 175 },
    { day: 'Sat', val: 195 },
    { day: 'Sun', val: 142 },
  ],
  className,
}: ConsumptionDetailsCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card
      className={cn(
        'rounded-[24px] border border-border/80 bg-card overflow-hidden card-soft-shadow transition-all',
        className,
      )}
    >
      <CardContent className="p-5 sm:p-6">
        {/* Header toggle */}
        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">Consumption details</span>
            <span className="text-xs text-muted-foreground">· Breakdown & averages</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground group-hover:text-foreground"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 3 Core Quick Stats always visible */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-border/60">
          <div className="rounded-2xl bg-secondary/40 p-3 text-center">
            <span className="text-[11px] font-medium text-muted-foreground">Today</span>
            <p className="text-base sm:text-lg font-bold text-foreground mt-0.5">
              {formatLitres(todayUsage)}
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/40 p-3 text-center">
            <span className="text-[11px] font-medium text-muted-foreground">This Week</span>
            <p className="text-base sm:text-lg font-bold text-foreground mt-0.5">
              {formatLitres(weekUsage)}
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/40 p-3 text-center">
            <span className="text-[11px] font-medium text-muted-foreground">This Month</span>
            <p className="text-base sm:text-lg font-bold text-foreground mt-0.5">
              {formatLitres(monthUsage)}
            </p>
          </div>
        </div>

        {/* Expandable detailed view */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 pt-4 overflow-hidden"
            >
              {/* Mini weekly bar chart */}
              <div className="rounded-2xl bg-secondary/20 p-4 border border-border/60">
                <span className="text-xs font-semibold text-muted-foreground block mb-2">
                  Daily Usage This Week (L)
                </span>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                      <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={10} stroke="var(--color-muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-card)',
                          borderColor: 'var(--color-border)',
                          borderRadius: '10px',
                          fontSize: '11px',
                        }}
                        formatter={(val) => [`${val} L`, 'Usage']}
                      />
                      <Bar dataKey="val" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Analytical averages */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl border border-border/60 p-2.5">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Average daily</span>
                  <span className="font-bold text-foreground mt-0.5 block">{formatLitres(avgDaily)}</span>
                </div>
                <div className="rounded-xl border border-border/60 p-2.5">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Highest day</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{formatLitres(highestDaily)}</span>
                </div>
                <div className="rounded-xl border border-border/60 p-2.5">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Lowest day</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400 mt-0.5 block">{formatLitres(lowestDaily)}</span>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                  <Link to="/usage">
                    View Full Analytics
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
