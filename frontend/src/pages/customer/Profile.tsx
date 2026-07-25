import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, LogOut, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(7, 'Enter a valid phone number'),
})

type Values = z.infer<typeof schema>

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, 'Must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type PasswordValues = z.infer<typeof passwordSchema>

export default function Profile() {
  const { profile, customer, signOut, updatePassword } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    values: profile
      ? { firstName: profile.first_name, lastName: profile.last_name, phone: profile.phone ?? '' }
      : undefined,
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  async function onSubmit(values: Values) {
    if (!profile) return
    setSubmitting(true)
    const { error } = await supabase
      .from('profiles')
      .update({ first_name: values.firstName, last_name: values.lastName, phone: values.phone })
      .eq('id', profile.id)
    setSubmitting(false)

    if (error) {
      toast.error('Could not update profile', { description: error.message })
      return
    }
    toast.success('Profile updated')
  }

  async function onPasswordSubmit(values: PasswordValues) {
    setChangingPassword(true)
    const { error } = await updatePassword(values.newPassword)
    setChangingPassword(false)

    if (error) {
      toast.error('Could not update password', { description: error })
      return
    }
    resetPasswordForm()
    toast.success('Password updated')
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Customer number</Label>
              <Input value={customer?.customer_number ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...register('phone')} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" {...registerPassword('newPassword')} />
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" type="password" {...registerPassword('confirmPassword')} />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={changingPassword}>
              {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={() => signOut()}>
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </div>
  )
}
