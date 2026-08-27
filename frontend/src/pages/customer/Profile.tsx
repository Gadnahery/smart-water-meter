import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTheme } from 'next-themes'
import {
  Bell,
  Gauge,
  HelpCircle,
  KeyRound,
  Loader2,
  LogOut,
  Moon,
  Sun,
  SunMoon,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useMeter } from '@/hooks/useMeter'
import { supabase } from '@/lib/supabase'
import { isMeterOnline } from '@/lib/meterStatus'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(7, 'Enter a valid phone number'),
})

type ProfileValues = z.infer<typeof profileSchema>

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
  const { theme, setTheme } = useTheme()
  const { data: meter } = useMeter(customer?.id)
  const isOnline = isMeterOnline(meter?.last_seen)

  const [submitting, setSubmitting] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
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

  async function onSubmit(values: ProfileValues) {
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
    toast.success('Profile updated successfully')
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
    toast.success('Password updated successfully')
  }

  const customerName = profile ? `${profile.first_name} ${profile.last_name}` : 'Gadna Hery'
  const customerId = customer?.customer_number ?? 'CUS-000124'
  const meterSerial = meter?.meter_serial ?? 'SWM-000124'

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Account details, connected smart meter, and device preferences
        </p>
      </div>

      {/* 1. Account Summary Card (Section 31) */}
      <Card className="rounded-[28px] border border-border/80 bg-card p-6 sm:p-7 card-soft-shadow">
        <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 text-white text-xl font-bold shadow-md shadow-sky-500/25">
              {profile?.first_name?.[0] || 'G'}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">{customerName}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>Customer ID: <strong className="font-mono text-foreground">{customerId}</strong></span>
              </div>
            </div>
          </div>

          {/* Linked Meter Pill */}
          <div className="rounded-2xl border border-border/80 bg-secondary/40 px-4 py-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              My Meter
            </span>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-sky-500" />
              <span className="font-mono font-bold text-sm text-foreground">{meterSerial}</span>
              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Appearance Selector (Section 31 & 32: Light / Dark / System) */}
      <Card className="rounded-[28px] border border-border/80 bg-card p-6 card-soft-shadow">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sun className="h-4 w-4 text-sky-500" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'light', label: 'Light', icon: Sun, desc: 'Primary default' },
              { id: 'dark', label: 'Dark', icon: Moon, desc: 'Low light' },
              { id: 'system', label: 'System', icon: SunMoon, desc: 'Auto detect' },
            ].map(({ id, label, icon: Icon, desc }) => {
              const isSelected = theme === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme(id)}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 font-bold text-sky-700 ring-2 ring-sky-500/20 dark:bg-sky-950/60 dark:text-sky-300'
                      : 'border-border/80 bg-card text-foreground hover:bg-secondary/40'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1 text-sky-500" />
                  <span className="text-xs font-bold">{label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{desc}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Personal Information Form */}
      <Card className="rounded-[28px] border border-border/80 bg-card p-6 card-soft-shadow">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <User className="h-4 w-4 text-sky-500" />
            Personal information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground">First Name</Label>
                <Input id="firstName" {...register('firstName')} className="rounded-xl" />
                {errors.firstName && <p className="text-[11px] text-rose-500">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground">Last Name</Label>
                <Input id="lastName" {...register('lastName')} className="rounded-xl" />
                {errors.lastName && <p className="text-[11px] text-rose-500">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">Phone Number</Label>
              <Input id="phone" {...register('phone')} placeholder="+255 7XX XXX XXX" className="rounded-xl" />
              {errors.phone && <p className="text-[11px] text-rose-500">{errors.phone.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 4. Notifications & Security */}
      <Card className="rounded-[28px] border border-border/80 bg-card p-6 card-soft-shadow space-y-5">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Bell className="h-4 w-4 text-sky-500" />
            Notifications
          </h3>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">Usage and Valve Alerts</p>
              <p className="text-[11px] text-muted-foreground">Receive updates when allocation finishes or abnormal flow occurs</p>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`h-6 w-11 rounded-full transition-colors ${
                notificationsEnabled ? 'bg-sky-500' : 'bg-secondary'
              }`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-border/60">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <KeyRound className="h-4 w-4 text-sky-500" />
            Security & Password
          </h3>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-3 max-w-sm">
            <div className="space-y-1">
              <Label htmlFor="newPassword" className="text-xs text-muted-foreground">New Password</Label>
              <Input id="newPassword" type="password" {...registerPassword('newPassword')} className="rounded-xl" />
              {passwordErrors.newPassword && (
                <p className="text-[11px] text-rose-500">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">Confirm Password</Label>
              <Input id="confirmPassword" type="password" {...registerPassword('confirmPassword')} className="rounded-xl" />
              {passwordErrors.confirmPassword && (
                <p className="text-[11px] text-rose-500">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={changingPassword}
              variant="outline"
              className="rounded-xl text-xs font-semibold"
            >
              {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
            </Button>
          </form>
        </div>
      </Card>

      {/* 5. Help & Support + Sign Out (Section 31) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => toast.info('Support hotline: +255 22 212 3456 / support@safewater.co.tz')}
          className="w-full sm:w-auto rounded-xl border-border/80 text-xs font-semibold"
        >
          <HelpCircle className="h-4 w-4 mr-1.5 text-muted-foreground" />
          Help & Support
        </Button>

        <Button
          variant="destructive"
          onClick={() => signOut()}
          className="w-full sm:w-auto rounded-xl text-xs font-semibold"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
