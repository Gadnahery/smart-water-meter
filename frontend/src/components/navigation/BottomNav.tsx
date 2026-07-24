import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { customerNavItems } from './CustomerNav'

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-4 z-40 flex items-center justify-around gap-1 rounded-[28px] border border-border/60 bg-card/80 px-2 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl lg:hidden"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {customerNavItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-all duration-200',
              isActive && 'bg-primary/10 text-primary',
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
