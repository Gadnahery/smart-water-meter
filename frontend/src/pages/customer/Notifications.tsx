import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Bell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { fetchRecentNotifications } from '@/services/notifications'

export default function Notifications() {
  const { customer } = useAuth()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['all-notifications', customer?.id],
    enabled: !!customer,
    queryFn: () => fetchRecentNotifications(customer!.id, 50),
  })

  if (isLoading) return null

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No notifications"
        description="Leak alerts, usage warnings, and maintenance notices will show up here."
      />
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <Card key={n.id}>
          <CardContent className="flex items-start gap-3 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
              {n.type === 'leak' || n.type === 'emergency' ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : (
                <Bell className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                {!n.is_read && (
                  <Badge variant="secondary" className="text-[10px]">
                    New
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{n.message}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
