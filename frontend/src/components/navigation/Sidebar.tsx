import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { customerNavItems, brandIcon as BrandIcon } from './CustomerNav'

export function Sidebar() {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-[72px] items-center gap-2 border-b border-border px-6 text-lg font-bold text-foreground">
        <BrandIcon className="h-6 w-6 text-primary" />
        SafeWater
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {customerNavItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
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
    </aside>
  )
}
