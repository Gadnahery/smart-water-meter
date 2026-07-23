import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import Home from '@/pages/customer/Home'
import Usage from '@/pages/customer/Usage'
import Bills from '@/pages/customer/Bills'
import Notifications from '@/pages/customer/Notifications'
import Profile from '@/pages/customer/Profile'
import NotFound from '@/pages/errors/NotFound'

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <Register />
          </AuthLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthLayout>
            <ForgotPassword />
          </AuthLayout>
        }
      />
      <Route
        path="/reset-password"
        element={
          <AuthLayout>
            <ResetPassword />
          </AuthLayout>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/usage" element={<Usage />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
