import { useEffect, useState } from 'react'

const STORAGE_KEY = 'safewater-sidebar-collapsed'

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  return [collapsed, setCollapsed] as const
}
