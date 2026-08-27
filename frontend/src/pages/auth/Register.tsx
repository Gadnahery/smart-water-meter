import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().min(7, 'Enter a valid phone number'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    terms: z.literal(true, { error: 'You must accept the terms to continue' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterValues = z.infer<typeof registerSchema>

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false as unknown as true,
    },
  })

  const terms = watch('terms')

  async function onSubmit(values: RegisterValues) {
    setSubmitting(true)
    const { error, needsConfirmation } = await signUp(values)
    setSubmitting(false)

    if (error) {
      toast.error('Registration failed', { description: error })
      return
    }

    if (needsConfirmation) {
      toast.success('Check your inbox', {
        description: 'Confirm your email address to finish creating your account.',
      })
      navigate('/login', { replace: true })
      return
    }

    toast.success('Account created successfully')
    navigate('/', { replace: true })
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
          Create Account
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Register your household or business for smart prepaid water metering
        </p>
      </div>

      {/* Main Registration Card */}
      <Card className="rounded-[28px] border border-border/80 bg-card p-6 sm:p-7 card-soft-shadow">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-bold text-foreground">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="Baraka"
                    autoComplete="given-name"
                    {...register('firstName')}
                    className="pl-10 h-10 rounded-xl text-xs sm:text-sm bg-secondary/30 focus:bg-background"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-[11px] font-semibold text-rose-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-bold text-foreground">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    placeholder="Michael"
                    autoComplete="family-name"
                    {...register('lastName')}
                    className="pl-10 h-10 rounded-xl text-xs sm:text-sm bg-secondary/30 focus:bg-background"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-[11px] font-semibold text-rose-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Phone & Email */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold text-foreground">
                Phone Number (M-Pesa / SMS)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+255 754 000 000"
                  autoComplete="tel"
                  {...register('phone')}
                  className="pl-10 h-10 rounded-xl text-xs sm:text-sm bg-secondary/30 focus:bg-background"
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] font-semibold text-rose-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="baraka@safewater.co.tz"
                  autoComplete="email"
                  {...register('email')}
                  className="pl-10 h-10 rounded-xl text-xs sm:text-sm bg-secondary/30 focus:bg-background"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] font-semibold text-rose-500">{errors.email.message}</p>
              )}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                    {...register('password')}
                    className="pl-10 pr-10 h-10 rounded-xl text-xs sm:text-sm bg-secondary/30 focus:bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-semibold text-rose-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className="pl-10 h-10 rounded-xl text-xs sm:text-sm bg-secondary/30 focus:bg-background"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] font-semibold text-rose-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                <Checkbox
                  checked={terms}
                  onCheckedChange={(v) => setValue('terms', (v === true) as true, { shouldValidate: true })}
                  className="mt-0.5 rounded-md"
                />
                <span>
                  I agree to the SafeWater{' '}
                  <span className="font-bold text-sky-600 dark:text-sky-400">Terms of Service</span> and{' '}
                  <span className="font-bold text-sky-600 dark:text-sky-400">Privacy Policy</span>
                </span>
              </label>
              {errors.terms && (
                <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.terms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/25 transition-all mt-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Create SafeWater Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bottom Switch to Login */}
      <div className="text-center text-xs text-muted-foreground">
        Already have a SafeWater account?{' '}
        <Link
          to="/login"
          className="font-bold text-sky-600 dark:text-sky-400 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </motion.div>
  )
}
