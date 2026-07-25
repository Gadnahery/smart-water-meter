import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Laptop, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Laptop },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid a hydration/SSR mismatch flash - next-themes only knows the real
  // value once mounted on the client.
  useEffect(() => setMounted(true), [])

  return (
    <div className="inline-flex rounded-xl border border-border p-1">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors',
            mounted && theme === value && 'bg-primary/10 text-primary',
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
