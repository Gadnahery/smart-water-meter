import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCustomerOptions, useMeterMutations } from '@/hooks/useAdminMeters'
import type { MeterWithCustomer } from '@/services/adminMeters'

const UNASSIGNED = '__unassigned__'

const statusOptions = ['online', 'offline', 'maintenance', 'disabled', 'fault'] as const

const meterSchema = z.object({
  meter_serial: z.string().min(1, 'Meter serial is required'),
  customer_id: z.string(),
  firmware_version: z.string(),
  installation_date: z.string(),
  status: z.enum(statusOptions),
  battery_level: z.string(),
  wifi_signal: z.string(),
})

type MeterFormValues = z.infer<typeof meterSchema>

function toFormValues(meter?: MeterWithCustomer | null): MeterFormValues {
  return {
    meter_serial: meter?.meter_serial ?? '',
    customer_id: meter?.customer_id ?? UNASSIGNED,
    firmware_version: meter?.firmware_version ?? '',
    installation_date: meter?.installation_date ?? '',
    status: meter?.status ?? 'offline',
    battery_level: meter?.battery_level != null ? String(meter.battery_level) : '',
    wifi_signal: meter?.wifi_signal != null ? String(meter.wifi_signal) : '',
  }
}

interface MeterFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meter?: MeterWithCustomer | null
}

export function MeterFormDialog({ open, onOpenChange, meter }: MeterFormDialogProps) {
  const isEdit = !!meter
  const { data: customers = [] } = useCustomerOptions()
  const { create, update } = useMeterMutations()
  const submitting = create.isPending || update.isPending

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MeterFormValues>({
    resolver: zodResolver(meterSchema),
    defaultValues: toFormValues(meter),
  })

  useEffect(() => {
    if (open) reset(toFormValues(meter))
  }, [open, meter, reset])

  const status = watch('status')
  const customerId = watch('customer_id')

  async function onSubmit(values: MeterFormValues) {
    const payload = {
      meter_serial: values.meter_serial.trim(),
      customer_id: values.customer_id === UNASSIGNED ? null : values.customer_id,
      firmware_version: values.firmware_version.trim() || null,
      installation_date: values.installation_date || null,
      status: values.status,
      battery_level: values.battery_level === '' ? null : Number(values.battery_level),
      wifi_signal: values.wifi_signal === '' ? null : Number(values.wifi_signal),
    }

    try {
      if (isEdit) {
        await update.mutateAsync({ id: meter.id, values: payload })
        toast.success('Meter updated')
      } else {
        await create.mutateAsync(payload)
        toast.success('Meter registered')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(isEdit ? 'Could not update meter' : 'Could not register meter', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit smart meter' : 'Register smart meter'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update meter details and customer assignment.' : 'Add a new ESP32 smart meter.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="meter_serial">Meter serial</Label>
            <Input id="meter_serial" placeholder="WM-00002" {...register('meter_serial')} />
            {errors.meter_serial && <p className="text-sm text-destructive">{errors.meter_serial.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Assign to customer</Label>
            <Select value={customerId} onValueChange={(v) => setValue('customer_id', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.customer_number} · {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firmware_version">Firmware version</Label>
              <Input id="firmware_version" placeholder="1.0.0" {...register('firmware_version')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installation_date">Installation date</Label>
              <Input id="installation_date" type="date" {...register('installation_date')} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setValue('status', v as MeterFormValues['status'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="battery_level">Battery %</Label>
              <Input id="battery_level" type="number" min={0} max={100} {...register('battery_level')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wifi_signal">Wi-Fi signal (dBm)</Label>
              <Input id="wifi_signal" type="number" {...register('wifi_signal')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Save changes' : 'Register meter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
