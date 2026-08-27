import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { adminNavSections } from './AdminNav'

export function AdminNavList({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  return (
    <nav className="flex-1 space-y-4 p-3 overflow-y-auto">
      {adminNavSections.map((section) => (
        <div key={section.title} className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">
              {section.title}
            </p>
          )}

          {section.items.map(({ to, label, icon: Icon, end }) => {
            const link = (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition-all duration-150 hover:bg-secondary hover:text-foreground',
                    collapsed && 'justify-center px-0 py-2.5',
                    isActive &&
                      'bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400 font-bold',
                  )
                }
              >
                <Icon className={cn('h-4 w-4 shrink-0', collapsed && 'h-5 w-5')} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            )

            if (!collapsed) return link

            return (
              <Tooltip key={to} delayDuration={150}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" className="font-semibold text-xs">
                  {label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
