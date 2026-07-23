import type { ReactNode } from 'react'
import { Droplets, Gauge, ShieldCheck, Wifi } from 'lucide-react'

const features = [
  { icon: Gauge, label: 'Real-time consumption monitoring' },
  { icon: Wifi, label: 'Connected smart meters, always in sync' },
  { icon: ShieldCheck, label: 'Leak detection before it becomes a problem' },
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-900/40" />
        <div className="relative flex items-center gap-2 text-lg font-bold">
          <Droplets className="h-6 w-6" />
          SafeWater
        </div>
        <div className="relative space-y-8">
          <h1 className="text-4xl font-bold leading-tight">
            Smarter water management, from meter to dashboard.
          </h1>
          <ul className="space-y-4">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-primary-foreground/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-primary-foreground/70">
          &copy; {new Date().getFullYear()} SafeWater. All rights reserved.
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2">
        <div className="mb-8 flex items-center gap-2 text-xl font-bold text-foreground lg:hidden">
          <Droplets className="h-6 w-6 text-primary" />
          SafeWater
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
