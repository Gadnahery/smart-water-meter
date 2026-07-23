import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/navigation/AdminSidebar'
import { AdminHeader } from '@/components/navigation/AdminHeader'

export function AdminLayout() {
  return (
    <div className="flex min-h-svh bg-background">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
