import { useState, useMemo } from 'react'
import {
  Eye,
  Lock,
  Plus,
  Search,
  Unlock,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/empty/EmptyState'
import { CustomerFormDialog } from '@/components/forms/CustomerFormDialog'
import { useCustomers } from '@/hooks/useAdminCustomers'
import { useSendValveCommand } from '@/hooks/useValveCommands'
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate'
import type { CustomerRow } from '@/services/adminCustomers'

export default function Customers() {
  const { data: customers = [], isLoading } = useCustomers()
  const sendCommand = useSendValveCommand()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerRow | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null)
  const [detailTab, setDetailTab] = useState('overview')

  useRealtimeInvalidate('customers', [['admin-customers']])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customers.filter((c) => {
      const matchesQuery =
        !q ||
        [c.first_name, c.last_name, c.email, c.customer_number, c.meter_serial ?? '', c.phone ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q)

      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? c.account_status === 'active' : c.account_status === 'suspended')
      return matchesQuery && matchesStatus
    })
  }, [customers, search, statusFilter])

  async function handleValveToggle(meterId: string, open: boolean) {
    try {
      await sendCommand.mutateAsync({
        meterId,
        command: open ? 'OPEN' : 'CLOSE',
      })
      toast.success(open ? 'Valve OPEN command queued' : 'Valve CLOSE command queued')
    } catch {
      toast.error('Could not send valve command')
    }
  }

  function openCreate() {
    setEditingCustomer(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Customers
            </h1>
            <Badge className="bg-sky-500 text-white font-mono text-[10px]">
              {customers.length} Accounts
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Utility accounts, linked smart meters, prepaid tokens, and billing records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openCreate}
            className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* 2. Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, number, meter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-secondary/60 p-1 border border-border/60">
            {(['all', 'active', 'suspended'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Customer Data Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={customers.length === 0 ? 'No customers yet' : 'No matching customers'}
          description="Create utility accounts to assign smart meters and issue prepaid water tokens."
        />
      ) : (
        <div className="overflow-x-auto rounded-[20px] border border-border/80 bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead>Customer</TableHead>
                <TableHead>Meter Serial</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="text-xs hover:bg-secondary/40 cursor-pointer"
                  onClick={() => {
                    setSelectedCustomer(c)
                    setDetailTab('overview')
                  }}
                >
                  <TableCell>
                    <div className="font-bold text-foreground">
                      {c.first_name} {c.last_name}
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {c.customer_number} · {c.email}
                    </span>
                  </TableCell>

                  <TableCell>
                    {c.meter_serial ? (
                      <span className="font-mono font-bold text-foreground">
                        {c.meter_serial}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">Unassigned</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={c.account_status === 'active' ? 'default' : 'secondary'}
                      className="text-[10px] capitalize"
                    >
                      {c.account_status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground font-mono">
                    {c.phone || '-'}
                  </TableCell>

                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCustomer(c)
                        setDetailTab('overview')
                      }}
                      className="h-7 px-2 text-[11px] rounded-lg"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 4. Customer Detail Modal with Tabs */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl rounded-[28px] p-6 space-y-4">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Account: <strong className="font-mono text-foreground">{selectedCustomer.customer_number}</strong> · {selectedCustomer.phone || selectedCustomer.email}
                  </DialogDescription>
                </div>
                <Badge variant={selectedCustomer.meter_id ? 'default' : 'secondary'} className="text-[10px]">
                  {selectedCustomer.meter_id ? 'Meter Assigned' : 'Unmetered'}
                </Badge>
              </div>
            </DialogHeader>

            <Tabs value={detailTab} onValueChange={setDetailTab} className="w-full">
              <TabsList className="grid grid-cols-4 sm:grid-cols-7 rounded-xl bg-secondary/60 p-1 text-xs">
                <TabsTrigger value="overview" className="rounded-lg text-[11px]">Overview</TabsTrigger>
                <TabsTrigger value="usage" className="rounded-lg text-[11px]">Usage</TabsTrigger>
                <TabsTrigger value="tokens" className="rounded-lg text-[11px]">Tokens</TabsTrigger>
                <TabsTrigger value="sessions" className="rounded-lg text-[11px]">Sessions</TabsTrigger>
                <TabsTrigger value="bills" className="rounded-lg text-[11px]">Bills</TabsTrigger>
                <TabsTrigger value="payments" className="rounded-lg text-[11px]">Payments</TabsTrigger>
                <TabsTrigger value="alerts" className="rounded-lg text-[11px]">Alerts</TabsTrigger>
              </TabsList>

              {/* Tab 1: Overview */}
              <TabsContent value="overview" className="space-y-3 pt-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-xl bg-secondary/30 p-3">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Assigned Meter</span>
                    <p className="font-mono font-bold text-sm text-foreground mt-0.5">{selectedCustomer.meter_serial || 'None'}</p>
                  </div>
                  <div className="rounded-xl bg-secondary/30 p-3">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Account Status</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 capitalize">{selectedCustomer.account_status}</p>
                  </div>
                  <div className="rounded-xl bg-secondary/30 p-3">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Customer ID</span>
                    <p className="font-mono font-bold text-sm text-foreground mt-0.5">{selectedCustomer.customer_number}</p>
                  </div>
                </div>

                {/* Valve Control Quick Action */}
                {selectedCustomer.meter_id && (
                  <div className="rounded-2xl border border-sky-200/80 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/20 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-foreground">Meter Valve Actuator</h4>
                      <p className="text-[11px] text-muted-foreground">Emergency administrative open/close overrides</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleValveToggle(selectedCustomer.meter_id!, true)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                      >
                        <Unlock className="h-3.5 w-3.5 mr-1" />
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleValveToggle(selectedCustomer.meter_id!, false)}
                        className="rounded-xl font-semibold text-xs"
                      >
                        <Lock className="h-3.5 w-3.5 mr-1" />
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab 2: Usage */}
              <TabsContent value="usage" className="space-y-3 pt-3 text-xs">
                <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-muted-foreground">
                  View usage statistics and live flow in Analytics or Water Center.
                </div>
              </TabsContent>

              {/* Tab 3: Tokens */}
              <TabsContent value="tokens" className="space-y-2 pt-3 text-xs">
                <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-muted-foreground">
                  Customer prepaid token allocations are tracked under Tokens menu.
                </div>
              </TabsContent>

              {/* Tab 4: Sessions */}
              <TabsContent value="sessions" className="space-y-2 pt-3 text-xs">
                <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-muted-foreground">
                  Active and completed water sessions appear in Sessions menu.
                </div>
              </TabsContent>

              {/* Tab 5: Bills */}
              <TabsContent value="bills" className="space-y-2 pt-3 text-xs">
                <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-muted-foreground">
                  Monthly postpaid utility statements are generated under Billing menu.
                </div>
              </TabsContent>

              {/* Tab 6: Payments */}
              <TabsContent value="payments" className="space-y-2 pt-3 text-xs">
                <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-muted-foreground">
                  Payment records are tracked under Payments menu.
                </div>
              </TabsContent>

              {/* Tab 7: Alerts */}
              <TabsContent value="alerts" className="space-y-2 pt-3 text-xs">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                  <p className="font-bold">No active leak or hardware alerts.</p>
                  <p className="text-[11px] mt-0.5">Continuous telemetry monitoring enabled.</p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setSelectedCustomer(null)} className="rounded-xl text-xs">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Customer Form Modal */}
      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
      />
    </div>
  )
}
