import { useQuery } from '@tanstack/react-query'
import { Bell, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || 'U'
}

export function Header() {
  const { profile, customer, signOut } = useAuth()

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications', customer?.id],
    enabled: !!customer,
    queryFn: async () => {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', customer!.id)
        .eq('is_read', false)
      return count ?? 0
    },
  })

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-border bg-card px-6">
      <div>
        <p className="text-sm font-medium text-foreground">
          Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
        </p>
        <p className="text-xs text-muted-foreground">{today}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full p-0 text-[10px]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full">
              <Avatar>
                <AvatarFallback>{initials(profile?.first_name, profile?.last_name)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
