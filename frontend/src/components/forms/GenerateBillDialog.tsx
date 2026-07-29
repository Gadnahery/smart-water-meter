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
import { useCustomerOptions } from '@/hooks/useAdminMeters'
import { useBillMutations } from '@/hooks/useAdminBilling'

const schema = z.object({
  customer_id: z.string().min(1, 'Select a customer'),
  billing_month: z.string(),
  billing_year: z.string(),
  consumption: z.string().min(1, 'Consumption is required'),
})

type FormValues = z.infer<typeof schema>

const now = new Date()

export function GenerateBillDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: customers = [] } = useCustomerOptions()
  const { generate } = useBillMutations()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_id: '',
      billing_month: String(now.getMonth() + 1),
      billing_year: String(now.getFullYear()),
      consumption: '',
    },
  })

  const customerId = watch('customer_id')

  async function onSubmit(values: FormValues) {
    try {
      await generate.mutateAsync({
        customer_id: values.customer_id,
        billing_month: Number(values.billing_month),
        billing_year: Number(values.billing_year),
        consumption: Number(values.consumption),
      })
      toast.success('Bill generated')
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error('Could not generate bill', { description: error instanceof Error ? error.message : undefined })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate bill</DialogTitle>
          <DialogDescription>Manually create a bill for a customer and billing period.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={(v) => setValue('customer_id', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.customer_number} · {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customer_id && <p className="text-sm text-destructive">{errors.customer_id.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing_month">Month</Label>
              <Input id="billing_month" type="number" min={1} max={12} {...register('billing_month')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_year">Year</Label>
              <Input id="billing_year" type="number" {...register('billing_year')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumption">Consumption (litres)</Label>
              <Input id="consumption" type="number" step="1" {...register('consumption')} />
              {errors.consumption && <p className="text-sm text-destructive">{errors.consumption.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={generate.isPending}>
              {generate.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
