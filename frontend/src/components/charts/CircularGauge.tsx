import { motion } from 'framer-motion'
import { Droplets } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CircularGaugeProps {
  value: number // remaining or consumed
  max: number // total allocation or budget
  size?: number
  strokeWidth?: number
  unit?: string
  label?: string
  sublabel?: string
  isFlowing?: boolean
  flowRate?: number
  color?: 'water' | 'emerald' | 'primary' | 'warning'
  className?: string
}

export function CircularGauge({
  value,
  max,
  size = 240,
  strokeWidth = 16,
  unit = 'L',
  label = 'Remaining',
  sublabel,
  isFlowing = false,
  flowRate,
  color = 'water',
  className,
}: CircularGaugeProps) {
  const safeMax = max > 0 ? max : 1
  const percentage = Math.min(Math.max((value / safeMax) * 100, 0), 100)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const colorStyles = {
    water: {
      track: 'text-sky-100 dark:text-sky-950/50',
      stroke: 'text-sky-500 dark:text-sky-400',
      glow: 'shadow-[0_0_24px_rgba(14,165,233,0.25)]',
      gradientId: 'waterGradient',
      gradientFrom: '#0ea5e9',
      gradientTo: '#06b6d4',
    },
    emerald: {
      track: 'text-emerald-100 dark:text-emerald-950/50',
      stroke: 'text-emerald-500 dark:text-emerald-400',
      glow: 'shadow-[0_0_24px_rgba(16,185,129,0.25)]',
      gradientId: 'emeraldGradient',
      gradientFrom: '#10b981',
      gradientTo: '#34d399',
    },
    primary: {
      track: 'text-blue-100 dark:text-blue-950/50',
      stroke: 'text-blue-600 dark:text-blue-400',
      glow: 'shadow-[0_0_24px_rgba(37,99,235,0.25)]',
      gradientId: 'primaryGradient',
      gradientFrom: '#2563eb',
      gradientTo: '#3b82f6',
    },
    warning: {
      track: 'text-amber-100 dark:text-amber-950/50',
      stroke: 'text-amber-500 dark:text-amber-400',
      glow: 'shadow-[0_0_24px_rgba(245,158,11,0.25)]',
      gradientId: 'warningGradient',
      gradientFrom: '#f59e0b',
      gradientTo: '#fbbf24',
    },
  }[color]

  return (
    <div className={cn('relative flex flex-col items-center justify-center', className)}>
      <div className={cn('relative flex items-center justify-center rounded-full', isFlowing && colorStyles.glow)}>
        <svg width={size} height={size} className="-rotate-90 transform">
          <defs>
            <linearGradient id={colorStyles.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorStyles.gradientFrom} />
              <stop offset="100%" stopColor={colorStyles.gradientTo} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className={colorStyles.track}
          />

          {/* Foreground animated progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${colorStyles.gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {isFlowing && (
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="mb-1 flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-600 dark:bg-sky-400/20 dark:text-sky-300"
            >
              <Droplets className="h-3 w-3" />
              <span>{flowRate != null ? `${flowRate} L/min` : 'Water flowing'}</span>
            </motion.div>
          )}

          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              {Math.round(value).toLocaleString()}
            </span>
            <span className="text-lg font-semibold text-muted-foreground">{unit}</span>
          </div>

          <span className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</span>

          {sublabel && (
            <span className="mt-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">{sublabel}</span>
          )}

          <span className="mt-1 text-[11px] text-muted-foreground/80">{percentage.toFixed(1)}% of total</span>
        </div>
      </div>
    </div>
  )
}
