import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Cpu,
  Droplets,
  KeyRound,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const showcaseFeatures = [
  {
    icon: Activity,
    title: 'High-Precision Pulse Telemetry',
    desc: '450 pulses/L calibration factor with real-time flow velocity analytics.',
  },
  {
    icon: KeyRound,
    title: 'Prepaid Token & Instant Dispenser',
    desc: '12-digit STS-grade prepaid water token generator with automatic shutoff.',
  },
  {
    icon: Zap,
    title: 'Automated Solenoid Actuator',
    desc: 'Instant remote valve shutoff upon credit exhaustion or leak detection.',
  },
  {
    icon: ShieldCheck,
    title: 'DAWASA & EWURA Compliant',
    desc: 'Pre-configured domestic and commercial water tariffs for Tanzania.',
  },
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh w-full bg-[#f6fafd] dark:bg-slate-950 text-foreground antialiased selection:bg-sky-500 selection:text-white">
      {/* 1. Left Showcase Showcase Panel (Desktop) */}
      <div className="relative hidden w-[48%] flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-950 via-slate-950 to-blue-950 p-12 text-white lg:flex border-r border-sky-900/30">
        {/* Ambient atmospheric gradients & glow */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-sky-500/15 blur-[100px]" />
        <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-cyan-400/10 blur-[100px]" />

        {/* Top brand header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30 text-white">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                SafeWater
                <Badge className="bg-sky-500/20 text-sky-300 border-sky-400/30 text-[9px] font-mono px-1.5 py-0">
                  ESP32 IoT
                </Badge>
              </span>
              <span className="text-[11px] text-sky-200/70 block">Smart Utility Infrastructure</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-900/40 px-3 py-1 text-xs text-sky-200 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="font-mono text-[11px] font-semibold">Gateway Live</span>
          </div>
        </div>

        {/* Center hero showcase */}
        <div className="relative z-10 my-auto space-y-8 py-8">
          <div className="space-y-3">
            <Badge className="bg-sky-400/10 text-sky-300 border border-sky-400/30 text-xs font-semibold px-3 py-1">
              Next-Gen Prepaid Water Architecture
            </Badge>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Intelligent Water Flow & Automated Token Management.
            </h1>
            <p className="text-sm sm:text-base text-sky-100/70 max-w-lg leading-relaxed">
              Empowering consumers with realtime volumetric balance tracking, automated valve shutoff, and instant mobile money top-ups.
            </p>
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
            {showcaseFeatures.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.4 }}
                className="group rounded-2xl border border-sky-500/15 bg-white/[0.04] p-3.5 backdrop-blur-sm transition-all hover:border-sky-400/40 hover:bg-white/[0.08]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <feat.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{feat.title}</h3>
                    <p className="text-[11px] text-sky-200/60 mt-0.5 leading-snug">{feat.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Hardware Tagline */}
        <div className="relative z-10 flex items-center justify-between text-xs text-sky-200/50 border-t border-sky-800/40 pt-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-sky-400" />
            <span>ESP32 / YF-S201 Firmware v1.2.0</span>
          </div>
          <span>&copy; {new Date().getFullYear()} SafeWater Utility</span>
        </div>
      </div>

      {/* 2. Right Auth Panel */}
      <div className="relative flex w-full flex-col justify-between p-6 sm:p-12 lg:w-[52%]">
        {/* Top mobile header & theme switcher */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25">
              <Droplets className="h-5 w-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">SafeWater</span>
          </div>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Center content */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          {children}
        </div>

        {/* Footer */}
        <div className="w-full max-w-md mx-auto text-center text-xs text-muted-foreground pt-6">
          <span>Safe & encrypted utility connection · SSL TLS 1.3</span>
        </div>
      </div>
    </div>
  )
}
