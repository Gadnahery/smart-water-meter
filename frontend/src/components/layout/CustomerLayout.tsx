import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/navigation/Sidebar'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Header } from '@/components/navigation/Header'

export function CustomerLayout() {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
