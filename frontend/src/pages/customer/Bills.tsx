import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { CheckCircle2, Download, Loader2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { useBills, usePayBill, usePayments } from '@/hooks/useBills'
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate'
import { generateInvoicePdf } from '@/lib/pdf'
import { formatCurrency, formatLitres } from '@/lib/format'
import type { Bill, PaymentMethod } from '@/types'

const methodLabels: Record<PaymentMethod, string> = {
  card: 'Credit / Debit Card (Demo)',
  mobile_money: 'M-Pesa / Mobile Money (Demo)',
  bank: 'Bank Transfer (Demo)',
  cash: 'Cash / Agent (Demo)',
}

export default function Bills() {
  const { profile, customer } = useAuth()
  const { data: bills = [] } = useBills()
  const { data: payments = [] } = usePayments()
  const payBill = usePayBill()

  const [payingBill, setPayingBill] = useState<Bill | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('mobile_money')

  useRealtimeInvalidate('bills', [['bills', customer?.id]], customer ? `customer_id=eq.${customer.id}` : undefined, !!customer)

  const outstanding = useMemo(() => {
    const sum = bills.filter((b) => b.status === 'pending' || b.status === 'overdue').reduce((acc, b) => acc + b.total, 0)
    return sum > 0 ? sum : 125400
  }, [bills])

  const pendingBill = useMemo<Bill>(() => {
    const found = bills.find((b) => b.status === 'pending' || b.status === 'overdue')
    if (found) return found

    return {
      id: 'demo-bill-aug',
      customer_id: customer?.id ?? 'cus-1',
      billing_month: 8,
      billing_year: 2026,
      consumption: 1254,
      amount: 125400,
      discount: 0,
      tax: 6270,
      total: 131670,
      status: 'pending',
      due_date: '2026-09-15T00:00:00Z',
      generated_at: '2026-08-27T00:00:00Z',
      updated_at: '2026-08-27T00:00:00Z',
    }
  }, [bills, customer])

  function downloadInvoice(bill: Bill) {
    if (!profile || !customer) return
    generateInvoicePdf(bill, {
      name: `${profile.first_name} ${profile.last_name}`,
      customerNumber: customer.customer_number,
      email: profile.email,
    })
  }

  async function confirmPay() {
    if (!payingBill) return
    try {
      await payBill.mutateAsync({ bill: payingBill, method })
      toast.success('Bill payment completed (Demo)', {
        description: 'Simulated payment successful - no money charged.',
      })
      setPayingBill(null)
    } catch (error) {
      toast.error('Payment failed', { description: error instanceof Error ? error.message : undefined })
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Bills & Payments
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Account billing and payment records
        </p>
      </div>

      {/* 1. Top Card: Current Balance (Section 28) */}
      <Card className="rounded-[28px] border border-border/80 bg-card p-6 sm:p-7 card-soft-shadow">
        <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current balance
            </span>
            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {formatCurrency(outstanding)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Outstanding balance</span>
            </div>
          </div>

          <Button
            onClick={() => setPayingBill(pendingBill)}
            className="h-12 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/25 self-start sm:self-auto"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Pay Bill
          </Button>
        </CardContent>
      </Card>

      {/* 2. Monthly Bill Breakdown Card (Section 28: August 2026) */}
      {pendingBill && (
        <Card className="rounded-[28px] border border-border/80 bg-card p-6 sm:p-7 card-soft-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Monthly Statement
              </span>
              <h2 className="text-xl font-bold text-foreground mt-0.5">
                {format(new Date(pendingBill.billing_year, pendingBill.billing_month - 1), 'MMMM yyyy')}
              </h2>
            </div>
            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300 font-semibold">
              Due {format(new Date(pendingBill.due_date), 'd MMM yyyy')}
            </Badge>
          </div>

          <div className="rounded-2xl bg-secondary/30 p-4 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Water consumed</span>
              <span className="font-semibold text-foreground">{formatLitres(pendingBill.consumption)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Water</span>
              <span>{formatCurrency(pendingBill.amount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{formatCurrency(pendingBill.tax)}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between font-black text-base text-foreground">
              <span>Total</span>
              <span className="text-sky-600 dark:text-sky-400">{formatCurrency(pendingBill.total)}</span>
            </div>
          </div>

          <div className="flex gap-2.5 pt-1">
            <Button
              onClick={() => setPayingBill(pendingBill)}
              className="flex-1 h-11 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm"
            >
              Pay bill
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadInvoice(pendingBill)}
              className="h-11 px-4 rounded-xl border-border/80 text-xs font-semibold"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Invoice PDF
            </Button>
          </div>
        </Card>
      )}

      {/* 3. Payment History List Rows (Section 28) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-foreground px-1">Payment history</h3>

        {payments.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
            No past payment records.
          </div>
        ) : (
          <div className="space-y-2.5">
            {payments.map((pay) => (
              <Card key={pay.id} className="rounded-2xl border border-border/80 bg-card p-4 card-soft-shadow">
                <CardContent className="p-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        Payment of {formatCurrency(pay.amount)}
                      </span>
                      <span className="text-[11px] text-muted-foreground capitalize">
                        {pay.payment_method.replace('_', ' ')} · {format(new Date(pay.paid_at), 'd MMM yyyy, h:mm a')}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Completed
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Payment Confirmation Dialog */}
      {payingBill && (
        <Dialog open={!!payingBill} onOpenChange={() => setPayingBill(null)}>
          <DialogContent className="sm:max-w-md rounded-[28px] p-6 space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white">
                  <Wallet className="h-5 w-5" />
                </div>
                <DialogTitle className="text-lg font-bold">Pay Utility Bill</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Simulate demo postpaid billing settlement.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
              <span className="font-bold">Demo Mode:</span> No actual bank or mobile account will be charged.
            </div>

            <div className="rounded-2xl bg-secondary/30 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing Period</span>
                <span className="font-semibold text-foreground">
                  {format(new Date(payingBill.billing_year, payingBill.billing_month - 1), 'MMMM yyyy')}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border">
                <span>Amount to pay</span>
                <span className="text-sky-600 dark:text-sky-400">{formatCurrency(payingBill.total)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Select Payment Method</span>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(methodLabels).map(([k, lbl]) => (
                    <SelectItem key={k} value={k}>
                      {lbl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button variant="outline" onClick={() => setPayingBill(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={confirmPay}
                disabled={payBill.isPending}
                className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
              >
                {payBill.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
