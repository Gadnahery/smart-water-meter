import {
  AlertTriangle,
  BarChart3,
  FileText,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Receipt,
  ScrollText,
  Settings,
  TrendingUp,
  Users,
  Wallet,
  Waves,
} from 'lucide-react'

export interface AdminNavSection {
  title: string
  items: {
    to: string
    label: string
    icon: any
    end?: boolean
  }[]
}

export const adminNavSections: AdminNavSection[] = [
  {
    title: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/customers', label: 'Customers', icon: Users },
      { to: '/admin/meters', label: 'Smart Meters', icon: Gauge },
      { to: '/admin/sessions', label: 'Water Sessions', icon: Waves },
      { to: '/admin/tokens', label: 'Tokens', icon: KeyRound },
    ],
  },
  {
    title: 'Billing',
    items: [
      { to: '/admin/billing', label: 'Bills', icon: Receipt },
      { to: '/admin/payments', label: 'Payments', icon: Wallet },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { to: '/admin/consumption', label: 'Live Usage', icon: BarChart3 },
      { to: '/admin/alerts', label: 'Alerts', icon: AlertTriangle },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
      { to: '/admin/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: Settings },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
    ],
  },
]
