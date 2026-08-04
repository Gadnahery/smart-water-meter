import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/empty/EmptyState'
import { GenerateBillDialog } from '@/components/forms/GenerateBillDialog'
import { useAllBills, useBillMutations } from '@/hooks/useAdminBilling'
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate'
import { formatCurrency, formatLitres } from '@/lib/format'
import type { BillStatus } from '@/types'

const statusTone: Record<BillStatus, 'outline' | 'destructive' | 'secondary'> = {
  pending: 'outline',
  overdue: 'destructive',
  paid: 'secondary',
  cancelled: 'secondary',
}

const statusOptions: BillStatus[] = ['pending', 'paid', 'overdue', 'cancelled']

export default function Billing() {
  const { data: bills = [], isLoading } = useAllBills()
  const { setStatus } = useBillMutations()
  const [generateOpen, setGenerateOpen] = useState(false)

  useRealtimeInvalidate('bills', [['admin-bills']])

  async function changeStatus(id: string, status: BillStatus) {
    try {
      await setStatus.mutateAsync({ id, status })
      toast.success('Bill status updated')
    } catch (error) {
      toast.error('Could not update bill', { description: error instanceof Error ? error.message : undefined })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground">{bills.length} bills · demo billing, no real gateway</p>
        </div>
        <Button onClick={() => setGenerateOpen(true)}>
          <Plus className="h-4 w-4" />
          Generate bill
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No bills yet"
          description="Bills generate automatically each billing period, or create one manually."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Consumption</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{bill.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{bill.customer_number}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(bill.billing_year, bill.billing_month - 1), 'MMM yyyy')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatLitres(bill.consumption)}</TableCell>
                  <TableCell className="font-medium text-foreground">{formatCurrency(bill.total)}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(bill.due_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Select value={bill.status} onValueChange={(v) => changeStatus(bill.id, v as BillStatus)}>
                      <SelectTrigger className="h-8 w-[130px]">
                        <Badge variant={statusTone[bill.status]} className="capitalize">
                          {bill.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <GenerateBillDialog open={generateOpen} onOpenChange={setGenerateOpen} />
    </div>
  )
}
