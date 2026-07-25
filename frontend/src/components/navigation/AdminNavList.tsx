import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { adminNavItems } from './AdminNav'

export function AdminNavList({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  return (
    <nav className="flex-1 space-y-1 p-4">
      {adminNavItems.map(({ to, label, icon: Icon, end }) => {
        const link = (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                collapsed && 'justify-center px-0',
                isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && label}
          </NavLink>
        )

        if (!collapsed) return link

        return (
          <Tooltip key={to} delayDuration={200}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}
