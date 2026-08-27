import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean(),
})

type LoginValues = z.infer<typeof loginSchema>

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const remember = watch('remember')

  function fillDemo(email: string, pass: string, role: string) {
    setValue('email', email, { shouldValidate: true })
    setValue('password', pass, { shouldValidate: true })
    toast.info(`Filled ${role} demo credentials`, { description: `${email}` })
  }

  async function onSubmit(values: LoginValues) {
    setSubmitting(true)
    const { error } = await signIn(values.email, values.password)
    setSubmitting(false)

    if (error) {
      toast.error('Login failed', { description: error })
      return
    }

    toast.success('Welcome back to SafeWater')

    const requestedFrom = (location.state as { from?: string } | null)?.from
    if (requestedFrom) {
      navigate(requestedFrom, { replace: true })
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data: profile } = user
      ? await supabase.from('profiles').select('role').eq('auth_id', user.id).maybeSingle()
      : { data: null }

    navigate(profile?.role === 'admin' ? '/admin' : '/', { replace: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Sign In
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Enter your utility credentials to access your smart water meter
        </p>
      </div>

      {/* Quick Demo Credentials Bar */}
      <div className="rounded-2xl border border-sky-200/70 bg-sky-50/60 p-3.5 dark:border-sky-900/60 dark:bg-sky-950/30 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-sky-800 dark:text-sky-300">
          <span className="flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5 text-sky-500" />
            1-Click Demo Login
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">Click to autofill</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fillDemo('admin@safewater.co.tz', 'admin123', 'Administrator')}
            className="h-8 rounded-xl border-sky-300/80 bg-white/80 dark:bg-slate-900 text-xs font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/50"
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1 text-sky-600" />
            Admin Demo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fillDemo('baraka@safewater.co.tz', 'customer123', 'Customer')}
            className="h-8 rounded-xl border-sky-300/80 bg-white/80 dark:bg-slate-900 text-xs font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/50"
          >
            <UserCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            Customer Demo
          </Button>
        </div>
      </div>

      {/* Main Login Card Form */}
      <Card className="rounded-[28px] border border-border/80 bg-card p-6 sm:p-7 card-soft-shadow">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  {...register('email')}
                  className="pl-10 h-11 rounded-xl text-xs sm:text-sm bg-secondary/30 focus:bg-background transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] font-semibold text-rose-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-foreground">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className="pl-10 pr-10 h-11 rounded-xl text-xs sm:text-sm bg-secondary/30 focus:bg-background transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-semibold text-rose-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setValue('remember', v === true)}
                  className="rounded-md"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/25 transition-all mt-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Sign In to SafeWater'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bottom Switch to Register */}
      <div className="text-center text-xs text-muted-foreground">
        New to SafeWater?{' '}
        <Link
          to="/register"
          className="font-bold text-sky-600 dark:text-sky-400 hover:underline"
        >
          Create an account
        </Link>
      </div>
    </motion.div>
  )
}
