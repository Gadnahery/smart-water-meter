import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().min(7, 'Enter a valid phone number'),
    email: z.email('Enter a valid email address'),
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

    toast.success('Account created')
    navigate('/', { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start monitoring your water usage</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" autoComplete="given-name" {...register('firstName')} />
            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" autoComplete="family-name" {...register('lastName')} />
            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" type="tel" autoComplete="tel" {...register('phone')} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={terms}
              onCheckedChange={(v) => setValue('terms', (v === true) as true)}
              className="mt-0.5"
            />
            I agree to the Terms of Service and Privacy Policy
          </label>
          {errors.terms && <p className="text-sm text-destructive">{errors.terms.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
