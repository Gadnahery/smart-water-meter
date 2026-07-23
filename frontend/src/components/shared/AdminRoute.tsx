import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
