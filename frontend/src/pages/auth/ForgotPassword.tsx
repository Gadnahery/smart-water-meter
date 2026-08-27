import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
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
    setSent(true)
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Card className="rounded-[28px] border border-emerald-200/80 bg-card p-6 sm:p-8 text-center card-soft-shadow">
          <CardContent className="p-0 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Check your inbox
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                If an account exists for that email address, we've sent a password reset link.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="outline" className="rounded-xl text-xs font-semibold">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Reset Password
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Enter your registered email address and we'll send you recovery instructions
        </p>
      </div>

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
                  className="pl-10 h-11 rounded-xl text-xs sm:text-sm bg-secondary/30 focus:bg-background"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] font-semibold text-rose-500">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/25 transition-all mt-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Link...
                </span>
              ) : (
                'Send Password Reset Link'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        Remember your password?{' '}
        <Link
          to="/login"
          className="font-bold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to login
        </Link>
      </div>
    </motion.div>
  )
}
