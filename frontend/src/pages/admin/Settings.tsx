import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useSettings, useUpdateSettings } from '@/hooks/useAdminSettings'

const schema = z.object({
  company_name: z.string().min(1, 'Required'),
  water_tariff: z.string(),
  currency: z.string().min(1, 'Required'),
  billing_cycle: z.string().min(1, 'Required'),
  alert_threshold: z.string(),
  support_email: z.string(),
  support_phone: z.string(),
})

type FormValues = z.infer<typeof schema>

export default function Settings() {
  const { data: settings, isLoading } = useSettings()
  const update = useUpdateSettings()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (settings) {
      reset({
        company_name: settings.company_name,
        water_tariff: String(settings.water_tariff),
        currency: settings.currency,
        billing_cycle: settings.billing_cycle,
        alert_threshold: settings.alert_threshold != null ? String(settings.alert_threshold) : '',
        support_email: settings.support_email ?? '',
        support_phone: settings.support_phone ?? '',
      })
    }
  }, [settings, reset])

  async function onSubmit(values: FormValues) {
    if (!settings) return
    try {
      await update.mutateAsync({
        id: settings.id,
        values: {
          company_name: values.company_name.trim(),
          water_tariff: Number(values.water_tariff),
          currency: values.currency.trim(),
          billing_cycle: values.billing_cycle.trim(),
          alert_threshold: values.alert_threshold === '' ? null : Number(values.alert_threshold),
          support_email: values.support_email.trim() || null,
          support_phone: values.support_phone.trim() || null,
        },
      })
      toast.success('Settings updated')
    } catch (error) {
      toast.error('Could not update settings', { description: error instanceof Error ? error.message : undefined })
    }
  }

  if (isLoading || !settings) {
    return <Skeleton className="h-96" />
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">System settings</h1>
        <p className="text-sm text-muted-foreground">Tariff, currency, and support configuration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="company_name">Company name</Label>
              <Input id="company_name" {...register('company_name')} />
              {errors.company_name && <p className="text-sm text-destructive">{errors.company_name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="water_tariff">Water tariff (per litre)</Label>
                <Input id="water_tariff" type="number" step="0.01" {...register('water_tariff')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" {...register('currency')} />
                {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billing_cycle">Billing cycle</Label>
                <Input id="billing_cycle" {...register('billing_cycle')} />
                {errors.billing_cycle && <p className="text-sm text-destructive">{errors.billing_cycle.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert_threshold">High-usage alert threshold (L/min)</Label>
                <Input id="alert_threshold" type="number" step="0.1" {...register('alert_threshold')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="support_email">Support email</Label>
                <Input id="support_email" type="email" {...register('support_email')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_phone">Support phone</Label>
                <Input id="support_phone" {...register('support_phone')} />
              </div>
            </div>

            <Button type="submit" disabled={update.isPending}>
              {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save settings
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>
    </div>
  )
}
