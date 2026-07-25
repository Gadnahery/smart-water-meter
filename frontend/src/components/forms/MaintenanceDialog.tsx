import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Loader2, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useCreateMaintenanceLog, useMaintenanceLogs } from '@/hooks/useAdminMaintenance'

const schema = z.object({
  technician: z.string(),
  description: z.string(),
  maintenance_date: z.string().min(1, 'Required'),
  next_service: z.string(),
})

type FormValues = z.infer<typeof schema>

const today = new Date().toISOString().slice(0, 10)

export function MaintenanceDialog({
  open,
  onOpenChange,
  meterId,
  meterSerial,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  meterId: string | null
  meterSerial?: string
}) {
  const { data: logs = [], isLoading } = useMaintenanceLogs(meterId ?? undefined)
  const create = useCreateMaintenanceLog()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { technician: '', description: '', maintenance_date: today, next_service: '' },
  })

  async function onSubmit(values: FormValues) {
    if (!meterId) return
    try {
      await create.mutateAsync({
        meter_id: meterId,
        technician: values.technician.trim() || null,
        description: values.description.trim() || null,
        maintenance_date: values.maintenance_date,
        next_service: values.next_service || null,
      })
      toast.success('Maintenance log added')
      reset({ technician: '', description: '', maintenance_date: today, next_service: '' })
    } catch (error) {
      toast.error('Could not add log', { description: error instanceof Error ? error.message : undefined })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Maintenance — {meterSerial}</DialogTitle>
          <DialogDescription>Service history and technician visits for this meter.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No maintenance recorded yet.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(log.maintenance_date), 'MMM d, yyyy')}
                    {log.technician && <span className="text-muted-foreground"> · {log.technician}</span>}
                  </p>
                  {log.description && <p className="text-sm text-muted-foreground">{log.description}</p>}
                  {log.next_service && (
                    <p className="text-xs text-muted-foreground">
                      Next service: {format(new Date(log.next_service), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <p className="text-sm font-medium text-foreground">Log a new visit</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="technician">Technician</Label>
              <Input id="technician" {...register('technician')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance_date">Date</Label>
              <Input id="maintenance_date" type="date" {...register('maintenance_date')} />
              {errors.maintenance_date && (
                <p className="text-sm text-destructive">{errors.maintenance_date.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="What was done" {...register('description')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="next_service">Next service due</Label>
            <Input id="next_service" type="date" {...register('next_service')} />
          </div>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add log
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
