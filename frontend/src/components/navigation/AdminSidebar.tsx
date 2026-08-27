import { ChevronsLeft, ChevronsRight, Droplets } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'
import { AdminNavList } from './AdminNavList'

export function AdminSidebar() {
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
          <Droplets className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sm font-black tracking-tight text-foreground block">SafeWater</span>
            <span className="text-[10px] font-semibold text-muted-foreground block -mt-1">IoT Operations</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <AdminNavList collapsed={collapsed} />
      </div>

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
