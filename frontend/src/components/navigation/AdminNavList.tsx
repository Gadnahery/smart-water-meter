import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { adminNavItems } from './AdminNav'

export function AdminNavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 p-4">
      {adminNavItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
              isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary',
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
