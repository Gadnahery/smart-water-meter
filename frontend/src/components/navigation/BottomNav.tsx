import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { customerNavItems } from './CustomerNav'

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-4 z-50 flex items-center justify-around gap-1 rounded-[32px] border border-border/80 bg-card/85 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl lg:hidden max-w-md mx-auto"
      style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
    >
      {customerNavItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-semibold transition-all duration-200',
              isActive
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="activeBottomTab"
                  className="absolute inset-0 rounded-2xl bg-sky-500/10 dark:bg-sky-400/15"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive && 'scale-110')} />
              <span className="relative z-10">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
