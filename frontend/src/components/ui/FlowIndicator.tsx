import { motion } from 'framer-motion'
import { Droplets, Waves, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlowIndicatorProps {
  status: 'flowing' | 'opening' | 'closed' | 'low_battery' | 'leak'
  flowRate?: number | null
  className?: string
}

export function FlowIndicator({ status, flowRate, className }: FlowIndicatorProps) {
  if (status === 'flowing') {
    return (
      <div className={cn('flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 border border-sky-200/80 dark:bg-sky-950/40 dark:border-sky-800/60', className)}>
        <div className="relative flex h-3 w-3 items-center justify-center">
          <motion.span
            animate={{ scale: [1, 2.2, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="absolute h-full w-full rounded-full bg-sky-400 opacity-75"
          />
          <span className="relative h-2 w-2 rounded-full bg-sky-500" />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
          <Waves className="h-3.5 w-3.5 animate-pulse text-sky-500" />
          <span>{flowRate != null && flowRate > 0 ? `${flowRate} L/min` : 'Water flowing'}</span>
        </div>
      </div>
    )
  }

  if (status === 'opening') {
    return (
      <div className={cn('flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 border border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-800/60', className)}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        >
          <Droplets className="h-3.5 w-3.5 text-amber-500" />
        </motion.div>
        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Opening valve...</span>
      </div>
    )
  }

  if (status === 'leak') {
    return (
      <div className={cn('flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 border border-rose-200/80 dark:bg-rose-950/40 dark:border-rose-800/60', className)}>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
        </span>
        <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Possible Leak Detected</span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 border border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700/60', className)}>
      <Lock className="h-3.5 w-3.5 text-slate-400" />
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Valve closed</span>
    </div>
  )
}
