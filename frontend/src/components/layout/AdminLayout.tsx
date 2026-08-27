import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/navigation/AdminSidebar'
import { AdminHeader } from '@/components/navigation/AdminHeader'

export function AdminLayout() {
  return (
    <div className="flex h-screen h-svh w-screen overflow-hidden bg-background">
      {/* Fixed non-scrolling Admin Sidebar */}
      <AdminSidebar />
      {/* Scrollable Main Application Content */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
