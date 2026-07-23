import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Droplets, LogOut, Menu } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { AdminNavList } from './AdminNavList'

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || 'A'
}

export function AdminHeader() {
  const { profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const { data: activeAlerts = 0 } = useQuery({
    queryKey: ['admin-active-alerts-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('alerts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
      return count ?? 0
    },
  })

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="h-[72px] flex-row items-center gap-2 border-b border-border px-6 text-left">
              <Droplets className="h-6 w-6 text-primary" />
              <SheetTitle>SafeWater Admin</SheetTitle>
            </SheetHeader>
            <AdminNavList onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        <p className="text-sm font-medium text-foreground">Admin dashboard</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground">
          <AlertTriangle className="h-5 w-5" />
          {activeAlerts > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-destructive p-0 text-[10px]">
              {activeAlerts > 9 ? '9+' : activeAlerts}
            </Badge>
          )}
        </div>

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
