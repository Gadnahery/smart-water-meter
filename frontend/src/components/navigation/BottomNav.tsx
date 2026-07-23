import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { customerNavItems } from './CustomerNav'

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
      {customerNavItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground transition-colors',
              isActive && 'text-primary',
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
