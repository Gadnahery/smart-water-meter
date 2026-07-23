import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  email: z.email('Enter a valid email address'),
})

type Values = z.infer<typeof schema>

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  async function onSubmit(values: Values) {
    setSubmitting(true)
    await requestPasswordReset(values.email)
    setSubmitting(false)
    // Always show the same confirmation, regardless of whether the email
    // exists, so this endpoint can't be used to enumerate accounts.
    setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center lg:text-left">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success lg:mx-0" />
        <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          If an account exists for that address, we&apos;ve sent a link to reset your password.
        </p>
        <Link to="/login" className="inline-block text-sm font-medium text-primary hover:underline">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-foreground">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}
