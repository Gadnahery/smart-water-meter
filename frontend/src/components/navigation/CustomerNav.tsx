import { Activity, Droplets, Home, Receipt, User, Waves } from 'lucide-react'

export const customerNavItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/water', label: 'Water', icon: Waves, end: false },
  { to: '/bills', label: 'Bills', icon: Receipt, end: false },
  { to: '/activity', label: 'Activity', icon: Activity, end: false },
  { to: '/profile', label: 'Profile', icon: User, end: false },
]

export const brandIcon = Droplets
