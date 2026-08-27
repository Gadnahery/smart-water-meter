import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/navigation/Sidebar'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Header } from '@/components/navigation/Header'

export function CustomerLayout() {
  return (
    <div className="flex h-screen h-svh w-screen overflow-hidden atmospheric-bg">
      {/* Customer Desktop Sidebar (hidden on mobile) */}
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 pb-28 lg:pb-8">
          <div className="mx-auto w-full max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
      {/* Mobile Floating iOS Capsule Navigation */}
      <BottomNav />
    </div>
  )
}
