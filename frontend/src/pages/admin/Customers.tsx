import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Search, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/empty/EmptyState'
import { CustomerFormDialog } from '@/components/forms/CustomerFormDialog'
import { useCustomers } from '@/hooks/useAdminCustomers'
import type { CustomerRow } from '@/services/adminCustomers'

const statusTone: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  suspended: 'destructive',
  inactive: 'secondary',
}

export default function Customers() {
  const { data: customers = [], isLoading } = useCustomers()
  const [search, setSearch] = useState('')
  const [editingCustomer, setEditingCustomer] = useState<CustomerRow | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) =>
      [c.customer_number, c.first_name, c.last_name, c.email, c.phone ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [customers, search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground">{customers.length} total</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={customers.length === 0 ? 'No customers yet' : 'No matches'}
          description={
            customers.length === 0
              ? 'Customers appear here once they register.'
              : 'Try a different search term.'
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Meter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{customer.customer_number}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <p>{customer.email}</p>
                    {customer.phone && <p className="text-xs">{customer.phone}</p>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.meter_serial ?? <span className="italic">None</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusTone[customer.account_status] ?? 'secondary'} className="capitalize">
                      {customer.account_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(customer.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditingCustomer(customer)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CustomerFormDialog
        open={!!editingCustomer}
        onOpenChange={(open) => !open && setEditingCustomer(null)}
        customer={editingCustomer}
      />
    </div>
  )
}
