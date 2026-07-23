import { Droplets } from 'lucide-react'
import { AdminNavList } from './AdminNavList'

export function AdminSidebar() {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-[72px] items-center gap-2 border-b border-border px-6 text-lg font-bold text-foreground">
        <Droplets className="h-6 w-6 text-primary" />
        SafeWater Admin
      </div>
      <AdminNavList />
    </aside>
  )
}
