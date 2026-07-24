import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { CheckCircle2, Loader2, Receipt, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/empty/EmptyState'
import { useBills, usePayBill, usePayments } from '@/hooks/useBills'
import type { Bill, PaymentMethod } from '@/types'

const statusTone: Record<string, 'destructive' | 'secondary' | 'outline'> = {
  pending: 'outline',
  overdue: 'destructive',
  paid: 'secondary',
  cancelled: 'secondary',
}

const methodLabels: Record<PaymentMethod, string> = {
  card: 'Card',
  bank: 'Bank transfer',
  mobile_money: 'Mobile money',
  cash: 'Cash',
}

export default function Bills() {
  const { data: bills = [], isLoading } = useBills()
  const { data: payments = [] } = usePayments()
  const payBill = usePayBill()
  const [payingBill, setPayingBill] = useState<Bill | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('card')

  const outstanding = useMemo(
    () => bills.filter((b) => b.status === 'pending' || b.status === 'overdue').reduce((sum, b) => sum + b.total, 0),
    [bills],
  )

  async function confirmPay() {
    if (!payingBill) return
    try {
      await payBill.mutateAsync({ bill: payingBill, method })
      toast.success('Payment recorded (demo)', {
        description: 'This is a simulated payment - no real charge was made.',
      })
      setPayingBill(null)
    } catch (error) {
      toast.error('Could not record payment', { description: error instanceof Error ? error.message : undefined })
    }
  }

  if (isLoading) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Outstanding balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">${outstanding.toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Demo billing - payments here are simulated, no real gateway is connected.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Bills</h2>
        {bills.length === 0 ? (
          <EmptyState icon={Receipt} title="No bills yet" description="Bills are generated automatically each month." />
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <Card key={bill.id}>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {format(new Date(bill.billing_year, bill.billing_month - 1), 'MMMM yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {bill.consumption} m³ · Due {format(new Date(bill.due_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusTone[bill.status]} className="capitalize">
                      {bill.status}
                    </Badge>
                    <p className="w-20 text-right font-semibold text-foreground">${bill.total.toFixed(2)}</p>
                    {(bill.status === 'pending' || bill.status === 'overdue') && (
                      <Button size="sm" onClick={() => setPayingBill(bill)}>
                        Pay Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {payments.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Payment history</h2>
          <div className="space-y-2">
            {payments.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center gap-3 py-3">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{methodLabels[p.payment_method]}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(p.paid_at), 'MMM d, yyyy, h:mm a')}
                    </p>
                  </div>
                  <p className="font-medium text-foreground">${p.amount.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!payingBill} onOpenChange={(open) => !open && setPayingBill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay bill</DialogTitle>
            <DialogDescription>
              This is a demo payment - no real transaction is processed and no money moves anywhere.
            </DialogDescription>
          </DialogHeader>

          {payingBill && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <span className="text-sm text-muted-foreground">Amount due</span>
                <span className="text-lg font-bold text-foreground">${payingBill.total.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Payment method</label>
                <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(methodLabels) as PaymentMethod[]).map((m) => (
                      <SelectItem key={m} value={m}>
                        {methodLabels[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayingBill(null)}>
              Cancel
            </Button>
            <Button onClick={confirmPay} disabled={payBill.isPending}>
              {payBill.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              Confirm demo payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
