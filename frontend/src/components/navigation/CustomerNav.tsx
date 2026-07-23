import { Bell, Droplets, Gauge, Home, Receipt, User } from 'lucide-react'

export const customerNavItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/usage', label: 'Usage', icon: Gauge, end: false },
  { to: '/bills', label: 'Bills', icon: Receipt, end: false },
  { to: '/notifications', label: 'Alerts', icon: Bell, end: false },
  { to: '/profile', label: 'Profile', icon: User, end: false },
]

export const brandIcon = Droplets
