import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'
import { customerNavItems, brandIcon as BrandIcon } from './CustomerNav'

export function Sidebar() {
  const [collapsed, setCollapsed] = useSidebarCollapsed()

  return (
    <aside
      className={cn(
        'relative hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[76px]' : 'w-[280px]',
      )}
    >
      <div
        className={cn(
          'flex h-[72px] items-center gap-2 border-b border-border text-lg font-bold text-foreground',
          collapsed ? 'justify-center px-2' : 'px-6',
        )}
      >
        <BrandIcon className="h-6 w-6 shrink-0 text-primary" />
        {!collapsed && 'SafeWater'}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {customerNavItems.map(({ to, label, icon: Icon, end }) => {
          const link = (
            <NavLink
              key={to}
              to={to}
              end={end}
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

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center gap-2 border-t border-border py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        {!collapsed && 'Collapse'}
      </button>
    </aside>
  )
}
