import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { AdminRoute } from '@/components/shared/AdminRoute'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import Home from '@/pages/customer/Home'
import Usage from '@/pages/customer/Usage'
import Bills from '@/pages/customer/Bills'
import Notifications from '@/pages/customer/Notifications'
import Profile from '@/pages/customer/Profile'
import Dashboard from '@/pages/admin/Dashboard'
import AdminCustomers from '@/pages/admin/Customers'
import AdminMeters from '@/pages/admin/Meters'
import AdminConsumption from '@/pages/admin/Consumption'
import AdminBilling from '@/pages/admin/Billing'
import AdminPayments from '@/pages/admin/Payments'
import AdminAnalytics from '@/pages/admin/Analytics'
import AdminReports from '@/pages/admin/Reports'
import AdminAlerts from '@/pages/admin/Alerts'
import AdminSettings from '@/pages/admin/Settings'
import AdminAuditLogs from '@/pages/admin/AuditLogs'
import NotFound from '@/pages/errors/NotFound'
import Forbidden from '@/pages/errors/Forbidden'

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

      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/meters" element={<AdminMeters />} />
        <Route path="/admin/consumption" element={<AdminConsumption />} />
        <Route path="/admin/billing" element={<AdminBilling />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/alerts" element={<AdminAlerts />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
      </Route>

      <Route path="/403" element={<Forbidden />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
