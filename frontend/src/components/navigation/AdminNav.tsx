import {
  AlertTriangle,
  BarChart3,
  FileText,
  Gauge,
  LayoutDashboard,
  Receipt,
  ScrollText,
  Settings,
  Users,
  Wallet,
} from 'lucide-react'

export const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/customers', label: 'Customers', icon: Users, end: false },
  { to: '/admin/meters', label: 'Smart Meters', icon: Gauge, end: false },
  { to: '/admin/consumption', label: 'Consumption', icon: BarChart3, end: false },
  { to: '/admin/billing', label: 'Billing', icon: Receipt, end: false },
  { to: '/admin/payments', label: 'Payments', icon: Wallet, end: false },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, end: false },
  { to: '/admin/reports', label: 'Reports', icon: FileText, end: false },
  { to: '/admin/alerts', label: 'Alerts', icon: AlertTriangle, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText, end: false },
]
