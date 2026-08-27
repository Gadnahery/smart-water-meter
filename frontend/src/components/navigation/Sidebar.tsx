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
        'relative hidden shrink-0 flex-col border-r border-border/80 bg-card h-full select-none transition-[width] duration-200 lg:flex z-20',
        collapsed ? 'w-[76px]' : 'w-[280px]',
      )}
    >
      <div
        className={cn(
          'flex h-[72px] shrink-0 items-center gap-2.5 border-b border-border/80 text-lg font-bold text-foreground',
          collapsed ? 'justify-center px-2' : 'px-6',
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-xs">
          <BrandIcon className="h-5 w-5 shrink-0" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sm font-black tracking-tight text-foreground block">SafeWater</span>
            <span className="text-[10px] font-semibold text-muted-foreground block -mt-1">Customer Portal</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1.5 p-3.5 overflow-y-auto">
        {customerNavItems.map(({ to, label, icon: Icon, end }) => {
          const link = (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground',
                  collapsed && 'justify-center px-0',
                  isActive && 'bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400 font-bold',
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
        className="flex shrink-0 items-center justify-center gap-2 border-t border-border/80 py-3.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        {!collapsed && 'Collapse'}
      </button>
    </aside>
  )
}
