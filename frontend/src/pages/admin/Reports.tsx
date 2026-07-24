import { Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCustomers } from '@/hooks/useAdminCustomers'
import { useMeters } from '@/hooks/useAdminMeters'
import { useAllBills, useAllPayments } from '@/hooks/useAdminBilling'
import { downloadCsv } from '@/lib/csv'

export default function Reports() {
  const { data: customers = [] } = useCustomers()
  const { data: meters = [] } = useMeters()
  const { data: bills = [] } = useAllBills()
  const { data: payments = [] } = useAllPayments()

  const reports = [
    {
      title: 'Customers',
      description: `${customers.length} customers`,
      onExport: () =>
        downloadCsv(
          'customers.csv',
          customers.map((c) => ({
            customer_number: c.customer_number,
            name: `${c.first_name} ${c.last_name}`,
            email: c.email,
            phone: c.phone,
            status: c.account_status,
            meter: c.meter_serial ?? '',
            joined: c.created_at,
          })),
        ),
    },
    {
      title: 'Smart meters',
      description: `${meters.length} meters`,
      onExport: () =>
        downloadCsv(
          'smart-meters.csv',
          meters.map((m) => ({
            serial: m.meter_serial,
            customer: m.customer_name ?? '',
            status: m.status,
            battery: m.battery_level,
            signal: m.wifi_signal,
            last_seen: m.last_seen ?? '',
          })),
        ),
    },
    {
      title: 'Bills',
      description: `${bills.length} bills`,
      onExport: () =>
        downloadCsv(
          'bills.csv',
          bills.map((b) => ({
            customer: b.customer_name,
            customer_number: b.customer_number,
            period: `${b.billing_month}/${b.billing_year}`,
            consumption: b.consumption,
            total: b.total,
            status: b.status,
            due_date: b.due_date,
          })),
        ),
    },
    {
      title: 'Payments',
      description: `${payments.length} payments`,
      onExport: () =>
        downloadCsv(
          'payments.csv',
          payments.map((p) => ({
            customer: p.customer_name,
            customer_number: p.customer_number,
            period: p.billing_period,
            amount: p.amount,
            method: p.payment_method,
            status: p.payment_status,
            paid_at: p.paid_at,
          })),
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">Export data as CSV</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{report.description}</p>
              <Button variant="outline" size="sm" onClick={report.onExport} disabled={report.description.startsWith('0')}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
