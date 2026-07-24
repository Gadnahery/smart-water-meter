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
import { useCustomerMutations } from '@/hooks/useAdminCustomers'
import type { CustomerRow } from '@/services/adminCustomers'

const statusOptions = ['active', 'suspended', 'inactive'] as const

const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string(),
  address: z.string(),
  national_id: z.string(),
  account_status: z.enum(statusOptions),
})

type CustomerFormValues = z.infer<typeof customerSchema>

function toFormValues(customer: CustomerRow): CustomerFormValues {
  return {
    first_name: customer.first_name,
    last_name: customer.last_name,
    phone: customer.phone ?? '',
    address: customer.address ?? '',
    national_id: customer.national_id ?? '',
    account_status: customer.account_status,
  }
}

interface CustomerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: CustomerRow | null
}

export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
  const { update } = useCustomerMutations()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ? toFormValues(customer) : undefined,
  })

  useEffect(() => {
    if (open && customer) reset(toFormValues(customer))
  }, [open, customer, reset])

  const accountStatus = watch('account_status')

  async function onSubmit(values: CustomerFormValues) {
    if (!customer) return
    try {
      await update.mutateAsync({
        customer,
        values: {
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          phone: values.phone.trim() || null,
          address: values.address.trim() || null,
          national_id: values.national_id.trim() || null,
          account_status: values.account_status,
        },
      })
      toast.success('Customer updated')
      onOpenChange(false)
    } catch (error) {
      toast.error('Could not update customer', { description: error instanceof Error ? error.message : undefined })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit customer</DialogTitle>
          <DialogDescription>{customer?.customer_number} · {customer?.email}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" {...register('first_name')} />
              {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" {...register('last_name')} />
              {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="national_id">National ID</Label>
              <Input id="national_id" {...register('national_id')} />
            </div>
            <div className="space-y-2">
              <Label>Account status</Label>
              <Select
                value={accountStatus}
                onValueChange={(v) => setValue('account_status', v as CustomerFormValues['account_status'])}
              >
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
