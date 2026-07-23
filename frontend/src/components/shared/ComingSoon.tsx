import type { LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/empty/EmptyState'

export function ComingSoon({ icon, title }: { icon: LucideIcon; title: string }) {
  return <EmptyState icon={icon} title={title} description="This section is coming in a future update." />
}
