import { ChevronsLeft, ChevronsRight, Droplets } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'
import { AdminNavList } from './AdminNavList'

export function AdminSidebar() {
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
        <Droplets className="h-6 w-6 shrink-0 text-primary" />
        {!collapsed && 'SafeWater Admin'}
      </div>

      <AdminNavList collapsed={collapsed} />

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
