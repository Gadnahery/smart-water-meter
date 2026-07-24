import { format } from 'date-fns'
import { Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/empty/EmptyState'
import { useAllPayments } from '@/hooks/useAdminBilling'

const methodLabels: Record<string, string> = {
  card: 'Card',
  bank: 'Bank transfer',
  mobile_money: 'Mobile money',
  cash: 'Cash',
}

export default function Payments() {
  const { data: payments = [], isLoading } = useAllPayments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground">{payments.length} recorded · demo payments, no real gateway</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState icon={Wallet} title="No payments yet" description="Payments appear here as customers pay bills." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{p.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{p.customer_number}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.billing_period}</TableCell>
                  <TableCell className="text-muted-foreground">{methodLabels[p.payment_method]}</TableCell>
                  <TableCell className="text-muted-foreground">{p.transaction_reference}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {p.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">${p.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(p.paid_at), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
